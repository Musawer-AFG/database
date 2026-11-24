// Shipment, counterparty and double-entry calculations for the LOCAL React prototype.
// No imported workbook row is posted automatically; balances remain AFN-based.
import { afghanDateOrder, cash, findProduct, payrollAmounts } from './business.js';
import { quoteUnits } from '../utils/currency.js';
import { fifoStock } from './stockLots.js';

export const TRADE_CURRENCIES = Object.freeze(['AFN','USD','PKR','AED','EUR']);
export const TRADE_CURRENCY_LABELS = Object.freeze({AFN:'افغانی',USD:'دالر امریکایی',PKR:'روپیه پاکستانی',AED:'درهم امارات',EUR:'یورو'});
export const PARTY_TYPES = Object.freeze({customer:'مشتری',supplier:'عرضه‌کننده'});
const id = () => `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const clean = x => String(x ?? '').trim();
const num = x => Number(x);

export function convertTradeAmount(amount,currency='AFN',rate=1) {
  const n=num(amount);
  if(!Number.isFinite(n)||n<0) throw Error('مبلغ باید عدد غیرمنفی باشد.');
  if(!TRADE_CURRENCIES.includes(currency)) throw Error('واحد پول معتبر نیست.');
  const r=currency==='AFN'?1:num(rate);
  if(!Number.isFinite(r)||r<=0||r>1000000) throw Error(`نرخ تبدیل ${currency} به افغانی را درج کنید.`);
  return cash(n*r/quoteUnits(currency));
}

export function createShipment(form, data) {
  const inv=(data.invoices||[]).find(x=>x.type==='purchase' && String(x.id)===String(form.purchaseInvoiceId));
  if(!inv) throw Error('برای محاسبه قیمت تمام‌شده، نخست بل خرید را ثبت و انتخاب کنید.');
  if((data.shipments||[]).some(x=>String(x.purchaseInvoiceId)===String(inv.id) && String(x.id)!==String(form.id)))
    throw Error('برای این بل خرید قبلاً یک محموله ثبت شده است.');
  const containerCount=num(form.containerCount);
  const tonnes=num(form.tonnes);
  if(!Number.isInteger(containerCount)||containerCount<=0||containerCount>1000) throw Error('تعداد کانتنر باید یک عدد مثبت باشد.');
  if(!Number.isFinite(tonnes)||tonnes<=0) throw Error('وزن خالص محموله (به تن) را درج کنید.');
  if(!clean(form.reference)) throw Error('نمبر یا نام محموله را درج کنید.');
  if(!afghanDateOrder(form.date)) throw Error('تاریخ هجری شمسی معتبر درج کنید.');
  const costs=(form.costs||[]).filter(c=>clean(c.description)||clean(c.amount)).map(c=>{
    if(!clean(c.description)) throw Error('شرح مصارف محموله ضروری است.');
    const amount=num(c.amount);
    if(!Number.isFinite(amount)||amount<=0) throw Error('مبلغ مصارف باید بیشتر از صفر باشد.');
    return {id:c.id||id(),description:clean(c.description),amount,currency:c.currency||'AFN',rate:c.currency==='AFN'?1:num(c.rate),afn:convertTradeAmount(amount,c.currency||'AFN',c.rate),paid:c.paid===true};
  });
  return {id:form.id||id(),purchaseInvoiceId:inv.id,reference:clean(form.reference),date:form.date,origin:clean(form.origin),destination:clean(form.destination),containerCount,tonnes,supplier:inv.party||'',costs,notes:clean(form.notes)};
}

export function shipmentCost(data, shipment) {
  const invoice=(data.invoices||[]).find(x=>String(x.id)===String(shipment.purchaseInvoiceId) && x.type==='purchase');
  const purchase=invoice?cash(invoice.total):0; // Includes invoice extra expenses; never add them a second time.
  const additional=cash((shipment.costs||[]).reduce((s,c)=>s+Number(c.afn||0),0));
  const total=cash(purchase+additional);
  const tonnes=num(shipment.tonnes);
  return {purchase,additional,total,perTonne:tonnes>0?cash(total/tonnes):0,containerCount:Number(shipment.containerCount||0),paidCharges:cash((shipment.costs||[]).filter(x=>x.paid).reduce((s,x)=>s+Number(x.afn||0),0)),invoice};
}

export function createSettlement(form,data) {
  const partyType=form.partyType;
  const party=clean(form.party);
  if(!PARTY_TYPES[partyType]) throw Error('نوع طرف حساب را انتخاب کنید.');
  if(!party || !(data[partyType==='customer'?'customers':'suppliers']||[]).some(p=>p.name===party))
    throw Error('طرف حساب باید در مشتریان یا عرضه‌کنندگان ثبت شده باشد.');
  const kind=clean(form.kind);
  if(!['receive','pay','debit','credit'].includes(kind)) throw Error('نوع معامله معتبر نیست.');
  if(kind==='receive' && partyType!=='customer') throw Error('دریافت پول برای مشتری است.');
  if(kind==='pay' && partyType!=='supplier') throw Error('پرداخت پول برای عرضه‌کننده است.');
  if(!afghanDateOrder(form.date)) throw Error('تاریخ هجری شمسی معتبر درج کنید.');
  const amount=num(form.amount);
  if(!Number.isFinite(amount)||amount<=0) throw Error('مبلغ باید بیشتر از صفر باشد.');
  const currency=form.currency||'AFN';
  const rate=currency==='AFN'?1:num(form.rate);
  const afn=convertTradeAmount(amount,currency,rate);
  const invoiceId=clean(form.invoiceId);
  if(invoiceId) {
    const invoice=(data.invoices||[]).find(i=>String(i.id)===invoiceId && i.party===party && i.type===(partyType==='customer'?'sale':'purchase'));
    if(!invoice) throw Error('بل انتخاب‌شده متعلق به این طرف حساب نیست.');
    if(!['receive','pay'].includes(kind)) throw Error('اصلاحیه را نمی‌توان به بل پرداخت وصل کرد.');
    if(afn>Number(invoice.balance||0)+0.001) throw Error('مبلغ پرداخت از مانده بل بیشتر است.');
  }
  return {id:id(),partyType,party,kind,date:form.date,amount,currency,rate,afn,invoiceId:invoiceId||null,viaCash:form.viaCash!==false,thirdParty:clean(form.thirdParty),notes:clean(form.notes)};
}

export function applySettlement(data, entry) {
  // A bill payment becomes a bill payment, not a second independent settlement.
  if(entry.invoiceId) {
    return {...data,invoices:(data.invoices||[]).map(inv=>{
      if(String(inv.id)!==String(entry.invoiceId)) return inv;
      const balance=cash(Math.max(0,Number(inv.balance||0)-entry.afn));
      return {...inv,paid:cash(Number(inv.paid||0)+entry.afn),balance,status:balance===0?'پرداخت کامل':'پرداخت ناقص',payments:[...(inv.payments||[]),{
        id:entry.id,date:entry.date,amount:entry.afn,sourceAmount:entry.amount,currency:entry.currency,exchangeRate:entry.rate/quoteUnits(entry.currency),notes:entry.notes,viaCash:entry.viaCash,thirdParty:entry.thirdParty
      }]};
    })};
  }
  return {...data,settlements:[entry,...(data.settlements||[])]};
}

export function partyStatement(data,partyType,party) {
  const lines=[];
  const add=(id,date,description,debit,credit,currency='AFN',sourceAmount=null,sourceId='')=>lines.push({id,date,description,debit:cash(debit),credit:cash(credit),currency,sourceAmount,sourceId});
  for(const inv of data.invoices||[]) {
    if(inv.party!==party || inv.type!==(partyType==='customer'?'sale':'purchase')) continue;
    const source=(inv.currency||'AFN');
    add(`inv-${inv.id}`,inv.date,`${partyType==='customer'?'بل فروش':'بل خرید'} #${inv.number||inv.id}`,
      partyType==='customer'?inv.total:0,partyType==='supplier'?inv.total:0,source,inv.foreignTotal,inv.id);
    const subsequent=(inv.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
    const initial=cash(Number(inv.paid||0)-subsequent);
    if(initial>0) add(`initial-${inv.id}`,inv.date,'پرداخت هنگام صدور بل',partyType==='supplier'?initial:0,partyType==='customer'?initial:0,source,inv.foreignPaid,inv.id);
    for(const p of inv.payments||[]) add(`p-${inv.id}-${p.id}`,p.date,`تصفیه حساب بل #${inv.number||inv.id}${p.thirdParty?' توسط '+p.thirdParty:''}`,partyType==='supplier'?p.amount:0,partyType==='customer'?p.amount:0,p.currency,p.sourceAmount,inv.id);
  }
  for(const s of data.settlements||[]) if(s.partyType===partyType && s.party===party) {
    const debit=s.kind==='pay'||s.kind==='debit'?s.afn:0;
    const credit=s.kind==='receive'||s.kind==='credit'?s.afn:0;
    add(`s-${s.id}`,s.date,`${s.kind==='receive'?'دریافت علی‌الحساب':s.kind==='pay'?'پرداخت علی‌الحساب':s.kind==='debit'?'اصلاح دبیت':'اصلاح کریدیت'}${s.thirdParty?' — '+s.thirdParty:''}${s.notes?' — '+s.notes:''}`,debit,credit,s.currency,s.amount,s.id);
  }
  // Stable date order, irrespective of original invoice insertion order.
  lines.sort((a,b)=>afghanDateOrder(a.date)-afghanDateOrder(b.date)||a.id.localeCompare(b.id));
  let balance=0;
  return {lines:lines.map(line=>({...line,balance:cash(balance=balance+line.debit-line.credit)})),balance:cash(balance),debit:cash(lines.reduce((s,x)=>s+x.debit,0)),credit:cash(lines.reduce((s,x)=>s+x.credit,0))};
}

export function averageLandedCosts(data) {
  const totals=new Map();
  const add=(id,quantity,value)=>{const old=totals.get(String(id))||{quantity:0,value:0};totals.set(String(id),{quantity:old.quantity+quantity,value:old.value+value});};
  for(const product of data.products||[]) add(product.id,Number(product.quantity||0),Number(product.quantity||0)*Number(product.cost||0));
  for(const inv of data.invoices||[]) if(inv.type==='purchase') {
    const ship=(data.shipments||[]).find(s=>String(s.purchaseInvoiceId)===String(inv.id));
    const extra=ship?shipmentCost(data,ship).additional:0;
    const lines=(inv.items||[]).map(item=>({item,p:findProduct(item,data.products||[]),line:Math.max(0,Number(item.lineTotalAfn??(Number(item.price||0)*Number(item.quantity||0)))-Number(item.discount||0))}));
    const subtotal=lines.reduce((s,l)=>s+l.line,0);
    for(const {item,p,line} of lines) if(p && Number(item.quantity)>0) {
      const ratio=subtotal>0?line/subtotal:1/lines.length;
      const invoiceExtras=Number(inv.extraExpensesTotal||0);
      add(p.id,Number(item.quantity),line+(invoiceExtras+extra)*ratio);
    }
  }
  return new Map([...totals].map(([k,v])=>[k,v.quantity>0?cash(v.value/v.quantity):0]));
}

export function profitSummary(data) {
  const fifo=fifoStock(data);
  let sales=0,returns=0,cogs=0,missingCostLines=0;
  for(const inv of data.invoices||[]) {
    if(inv.type==='sale') {
      sales+=Number(inv.total||0);
      const shipment=(data.shipments||[]).find(sh=>String(sh.id)===String(inv.shipmentId) && Number(inv.soldTonnes)>0);
      if(shipment) cogs+=shipmentCost(data,shipment).perTonne*Number(inv.soldTonnes);
      else for(const [index,line] of (inv.items||[]).entries()) {
        const entry=fifo.sales.get(`${inv.id}-${index}`);
        if(!entry || entry.missing>0)missingCostLines++;
        cogs+=Number(entry?.cost||0);
      }
    } else if(inv.type==='return') returns+=Number(inv.total||0);
  }
  const operating=(data.expenses||[]).reduce((s,x)=>s+Number(x.amount||0),0);
  const payroll=(data.payroll||[]).reduce((s,x)=>s+payrollAmounts(x).net,0);
  const gross=cash(sales-returns-cogs);
  return {sales:cash(sales),returns:cash(returns),cogs:cash(cogs),gross,operating:cash(operating),payroll:cash(payroll),net:cash(gross-operating-payroll),missingCostLines,
    estimates:true};
}

// GENERATED (not persisted): invoices and payments are one source of truth. Manual
// journals are appended once. This avoids double-posting if the user edits a bill.
export function buildAccountingJournal(data,openingCash=0) {
  const entries=[];
  const post=(id,date,name,rows)=>{
    const cleanRows=rows.filter(r=>Number(r.debit||0)>0||Number(r.credit||0)>0).map(r=>({...r,debit:cash(r.debit||0),credit:cash(r.credit||0)}));
    if(!cleanRows.length) return;
    const debit=cash(cleanRows.reduce((s,x)=>s+x.debit,0)),credit=cash(cleanRows.reduce((s,x)=>s+x.credit,0));
    if(Math.abs(debit-credit)>0.01) throw Error(`سند حسابداری نامتوازن: ${name}`);
    entries.push({id:String(id),date,name,number:entries.length+1,rows:cleanRows,debit,credit,generated:true});
  };
  const row=(account,debit=0,credit=0)=>({account,debit,credit,description:''});
  const fifo=fifoStock(data);
  if(Number(openingCash)>0) post('auto-opening','1300/01/01','موجودی نقدی افتتاحیه',[row('صندوق نقدی',openingCash,0),row('سرمایه افتتاحیه',0,openingCash)]);
  for(const inv of data.invoices||[]) {
    const sign=inv.type;
    const paidLater=(inv.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0);
    const paidAt=cash(Math.max(0,Number(inv.paid||0)-paidLater));
    const balance=cash(Number(inv.total||0)-paidAt);
    if(sign==='sale') {
      post(`auto-sale-${inv.id}`,inv.date,`فروش #${inv.number||inv.id}`,[row('صندوق نقدی',paidAt,0),row('حساب‌های دریافتنی',balance,0),row('درآمد فروشات',0,inv.total)]);
      const shipment=(data.shipments||[]).find(sh=>String(sh.id)===String(inv.shipmentId)&&Number(inv.soldTonnes)>0);
      const cogs=shipment ? cash(shipmentCost(data,shipment).perTonne*Number(inv.soldTonnes)) : cash((inv.items||[]).reduce((s,item,index)=>s+Number(fifo.sales.get(`${inv.id}-${index}`)?.cost||0),0));
      if(cogs>0) post(`auto-cogs-${inv.id}`,inv.date,`بهای اجناس فروش‌رفته #${inv.number||inv.id}`,[row('بهای اجناس فروش‌رفته',cogs,0),row('موجودی اجناس',0,cogs)]);
    } else if(sign==='purchase') post(`auto-purchase-${inv.id}`,inv.date,`خرید #${inv.number||inv.id}`,[row('موجودی اجناس',inv.total,0),row('صندوق نقدی',0,paidAt),row('حساب‌های پرداختنی',0,balance)]);
    else if(sign==='return') post(`auto-return-${inv.id}`,inv.date,`برگشتی #${inv.number||inv.id}`,[row('برگشتی فروشات',inv.total,0),row('صندوق نقدی',0,paidAt),row('حساب‌های دریافتنی',0,balance)]);
    for(const p of inv.payments||[]) {
      const amount=cash(p.amount);
      if(sign==='sale') post(`auto-payment-${inv.id}-${p.id}`,p.date,`دریافت بل فروش #${inv.number||inv.id}`,[row(p.sarrafId?`حساب صراف — ${p.thirdParty} (${p.sarrafId})`:p.viaCash===false?'تسویه خارج از صندوق':'صندوق نقدی',amount,0),row('حساب‌های دریافتنی',0,amount)]);
      else if(sign==='purchase') post(`auto-payment-${inv.id}-${p.id}`,p.date,`پرداخت بل خرید #${inv.number||inv.id}`,[row('حساب‌های پرداختنی',amount,0),row(p.sarrafId?`حساب صراف — ${p.thirdParty} (${p.sarrafId})`:p.viaCash===false?'تسویه خارج از صندوق':'صندوق نقدی',0,amount)]);
    }
  }
  for(const sh of data.shipments||[]) for(const c of sh.costs||[]) {
    post(`auto-shipment-${sh.id}-${c.id}`,sh.date,`مصرف محموله ${sh.reference}: ${c.description}`,[row('موجودی اجناس',c.afn,0),row(c.paid?'صندوق نقدی':'پرداختنی مصارف محموله',0,c.afn)]);
  }
  for(const e of data.expenses||[]) post(`auto-expense-${e.id}`,e.date,`مصرف: ${e.name}`,[row('مصارف عملیاتی',e.amount,0),row('صندوق نقدی',0,e.amount)]);
  for(const p of data.payroll||[]) {
    const net=payrollAmounts(p).net;
    post(`auto-payroll-${p.id}`,p.date,`معاش ${p.employeeName||''}`,[row('مصارف معاشات',net,0),row('معاشات پرداختنی',0,net)]);
    if(p.status==='paid') post(`auto-payroll-paid-${p.id}`,p.paidDate||p.date,`پرداخت معاش ${p.employeeName||''}`,[row('معاشات پرداختنی',net,0),row('صندوق نقدی',0,net)]);
  }
  for(const m of data.cashEntries||[]) post(`auto-cash-${m.id}`,m.date,m.description,[row('صندوق نقدی',m.kind==='in'?m.amount:0,m.kind==='out'?m.amount:0),row(m.kind==='in'?'سرمایه مالک':'برداشت مالک',m.kind==='out'?m.amount:0,m.kind==='in'?m.amount:0)]);
  for(const s of data.settlements||[]) {
    const amount=s.afn;
    const clearing=s.viaCash?'صندوق نقدی':'تسویه خارج از صندوق';
    if(s.kind==='receive') post(`auto-settlement-${s.id}`,s.date,`دریافت علی‌الحساب ${s.party}`,[row(clearing,amount,0),row('حساب‌های دریافتنی',0,amount)]);
    if(s.kind==='pay') post(`auto-settlement-${s.id}`,s.date,`پرداخت علی‌الحساب ${s.party}`,[row('حساب‌های پرداختنی',amount,0),row(clearing,0,amount)]);
    if(s.kind==='debit') post(`auto-settlement-${s.id}`,s.date,`اصلاح دبیت ${s.party}`,[row(s.partyType==='supplier'?'حساب‌های پرداختنی':'حساب‌های دریافتنی',amount,0),row('تسویه اصلاح حسابات',0,amount)]);
    if(s.kind==='credit') post(`auto-settlement-${s.id}`,s.date,`اصلاح کریدیت ${s.party}`,[row('تسویه اصلاح حسابات',amount,0),row(s.partyType==='supplier'?'حساب‌های پرداختنی':'حساب‌های دریافتنی',0,amount)]);
  }
  for(const t of data.sarrafTransactions||[]) {
    const account=`حساب صراف — ${t.sarrafName} (${t.sarrafId})`;
    if(t.kind==='deposit') post(`sarraf-${t.id}`,t.date,`تحویل پول به صراف ${t.sarrafName}`,[row(account,t.afn,0),row('صندوق نقدی',0,t.afn)]);
    if(t.kind==='withdraw') post(`sarraf-${t.id}`,t.date,`دریافت پول از صراف ${t.sarrafName}`,[row('صندوق نقدی',t.afn,0),row(account,0,t.afn)]);
  }
  for(const j of data.journals||[]) post(`manual-${j.id}`,j.date,j.name||'سند دستی',j.rows||[]);
  entries.sort((a,b)=>afghanDateOrder(a.date)-afghanDateOrder(b.date)||String(a.id).localeCompare(String(b.id)));
  return entries.map((entry,index)=>({...entry,number:index+1}));
}
