// Frontend demo: records confirmed transfers, not an actual remittance service.
// AFN is the accounting currency; original foreign amounts and agreed quotes are retained.
import {afghanDateOrder,cash} from './business.js';
import {cashRegister} from './cashRegister.js';
import {currencyRate,toAfn,quoteUnits} from '../utils/currency.js';
export const SARRAF_KINDS={deposit:'سپردن پول به صراف',withdraw:'گرفتن پول از صراف',supplier:'پرداخت به عرضه‌کننده توسط صراف',customer:'دریافت پول مشتری توسط صراف'};
const clean=x=>String(x??'').trim();
const uid=()=>globalThis.crypto?.randomUUID?.()||`${Date.now()}-${Math.random().toString(36).slice(2)}`;
export const SARRAF_PROFILE_FIELDS = [
 ['name','نام صراف'], ['shopName','نام دکان / صرافی'], ['market','نام مارکیت / بازار'],
 ['shopNumber','نمبر دکان'], ['floor','منزل / طبقه'], ['country','کشور'], ['city','شهر / ولایت'],
 ['location','آدرس مکمل'], ['phone','نمبر تیلفون'], ['mobile','نمبر واتساپ / موبایل'],
 ['licenseNumber','نمبر جواز (اختیاری)'], ['contactPerson','نام شخص تماس'], ['notes','ملاحظات']
];
function profile(form){return Object.fromEntries(SARRAF_PROFILE_FIELDS.map(([key])=>[key,clean(form[key])]));}
export function createSarraf(form,data){
 const fields=profile(form);
 if(!fields.name)throw Error('نام صراف را درج کنید.');
 if((data.sarrafs||[]).some(s=>s.name===fields.name))throw Error('این صراف قبلاً ثبت شده است.');
 return {id:uid(),...fields};
}
export function updateSarrafProfile(data,id,form){
 const old=(data.sarrafs||[]).find(s=>String(s.id)===String(id));
 if(!old)throw Error('صراف را انتخاب کنید.');
 const fields=profile({...old,...form,name:old.name});
 return {...old,...fields,id:old.id};
}
export function sarrafStatement(data,id){
 const lines=(data.sarrafTransactions||[]).filter(t=>String(t.sarrafId)===String(id)).slice().sort((a,b)=>afghanDateOrder(a.date)-afghanDateOrder(b.date)||Number(a.createdAt||0)-Number(b.createdAt||0));
 let balance=0;
 const rows=lines.map(t=>{const debit=['deposit','customer'].includes(t.kind)?t.afn:0;const credit=['withdraw','supplier'].includes(t.kind)?t.afn:0;balance=cash(balance+debit-credit);return {...t,debit,credit,balance};});
 return {rows,balance,debit:cash(rows.reduce((s,t)=>s+t.debit,0)),credit:cash(rows.reduce((s,t)=>s+t.credit,0))};
}
export function recordSarrafTransaction(data,form,openingCash=0){
 const sarraf=(data.sarrafs||[]).find(s=>String(s.id)===String(form.sarrafId));
 if(!sarraf)throw Error('صراف را انتخاب کنید.');
 const kind=form.kind;
 if(!Object.hasOwn(SARRAF_KINDS,kind))throw Error('نوع معامله را انتخاب کنید.');
 if(!afghanDateOrder(form.date))throw Error('تاریخ معتبر درج کنید.');
 const currency=form.currency||'AFN', amount=Number(form.amount), quote=currency==='AFN'?1:Number(form.rate);
 const rates={[currency]:quote};
 const rate=currencyRate(currency,rates),afn=toAfn(amount,currency,rates);
 if(!(amount>0&&afn>0))throw Error('مبلغ باید بیشتر از صفر باشد.');
 const reference=clean(form.reference);
 if(!reference)throw Error('نمبر رسید یا حواله را درج کنید.');
 if((data.sarrafTransactions||[]).some(t=>t.sarrafId===sarraf.id&&t.reference===reference))throw Error('این نمبر رسید یا حواله قبلاً برای این صراف ثبت شده است.');
 if(kind==='deposit'&&cashRegister(data,openingCash).balance+0.001<afn)throw Error('پول کافی در صندوق موجود نیست.');
 const linked=kind==='supplier'||kind==='customer';
 const invoice=linked?(data.invoices||[]).find(i=>String(i.id)===String(form.invoiceId)&&i.type===(kind==='supplier'?'purchase':'sale')):null;
 if(linked&&!invoice)throw Error('بل مربوطه را انتخاب کنید.');
 if(invoice&&(afghanDateOrder(form.date)<afghanDateOrder(invoice.date)))throw Error('تاریخ حواله نباید پیش از تاریخ بل باشد.');
 if(invoice&&afn>Number(invoice.balance||0)+0.001)throw Error('مبلغ حواله از مانده بل بیشتر است.');
 const tx={id:uid(),createdAt:Date.now(),sarrafId:sarraf.id,sarrafName:sarraf.name,kind,date:form.date,currency,amount,rate:quote,quoteUnits:quoteUnits(currency),afn,reference,notes:clean(form.notes),invoiceId:invoice?.id??null,invoiceNumber:invoice?.number??null,party:invoice?.party||''};
 const next={...data,sarrafTransactions:[...(data.sarrafTransactions||[]),tx]};
 // Recheck the complete account timeline, not merely today's total.
 if(sarrafStatement(next,sarraf.id).rows.some(t=>t.balance< -0.001))throw Error('موجودی حساب نزد صراف در تاریخ این معامله کافی نیست. نخست پول به صراف بسپارید.');
 if(invoice)next.invoices=data.invoices.map(i=>String(i.id)!==String(invoice.id)?i:{...i,paid:cash(Number(i.paid||0)+afn),balance:cash(Number(i.balance||0)-afn),status:cash(Number(i.balance||0)-afn)===0?'پرداخت کامل':'پرداخت ناقص',payments:[...(i.payments||[]),{id:tx.id,date:tx.date,amount:afn,sourceAmount:amount,currency,exchangeRate:rate,viaCash:false,sarrafId:sarraf.id,thirdParty:sarraf.name,notes:`حواله ${reference}${tx.notes?' — '+tx.notes:''}`} ]});
 return next;
}
