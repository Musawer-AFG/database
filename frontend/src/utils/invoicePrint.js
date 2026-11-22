import {formatCalendarDate} from './afghanCalendar.js';
import {safeBusinessLogo} from './businessLogo.js';
import {contractDraft} from '../services/customerContracts.js';
import {themeColors} from './themePalette.js';
import {resolveDocumentDesign} from './documentDesigns.js';
export const escapeHtml=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const e=escapeHtml;
const n=v=>new Intl.NumberFormat('fa-AF',{maximumFractionDigits:4}).format(Number(v||0));
const m=v=>`${n(v)} AFN`;
const row=(...cells)=>`<tr>${cells.map(c=>`<td>${e(c)}</td>`).join('')}</tr>`;
const table=(headers,rows)=>`<table><thead><tr>${headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
const logo=src=>safeBusinessLogo(src)?`<img class="logo" src="${e(src)}" alt="لوگو">`:'';
const heading=(title,name,img)=>`<header><div class="header-copy">${logo(img)}<div><span class="title-badge">سند قابل ویرایش</span><h1>${e(title)}</h1><p>${e(name)}</p></div></div></header>`;
const pair=(key,value)=>row(key,value);
export function documentHtml(title,body,color='#214661'){const accent=themeColors(/^#[0-9a-f]{6}$/i.test(color)?color:'#214661','light').buttonBg;const soft=themeColors(/^#[0-9a-f]{6}$/i.test(color)?color:'#214661','light').buttonHover;return `<!doctype html><html lang="fa-AF" dir="rtl"><head><meta charset="utf-8"><title>${e(title)}</title><style>@page{size:A4;margin:10mm}*{box-sizing:border-box}body{font:14px/1.7 Tahoma,Arial,sans-serif;color:#17232e;background:white;margin:0;padding:0}.page{border:2.5px solid ${accent};padding:14px 16px 18px;background:white}header{display:flex;align-items:center;justify-content:space-between;gap:18px;border-bottom:3px solid ${accent};padding:0 0 12px;margin-bottom:14px}.header-copy{display:flex;align-items:center;gap:16px}.title-badge{display:inline-block;background:${accent};color:#fff;padding:6px 12px;border-radius:999px;font-size:12px;print-color-adjust:exact;-webkit-print-color-adjust:exact}header h1{font-size:22px;margin:0}header p{margin:4px 0 0}.logo{width:76px;height:76px;object-fit:contain;border:1px solid #d7e0e7;border-radius:10px;padding:4px;background:white}h2{font-size:15px;color:${accent};margin:16px 0 6px;padding-bottom:4px;border-bottom:1px solid ${soft}}table{border-collapse:collapse;width:100%;margin:6px 0 12px;table-layout:auto}th,td{border:1px solid #b8c2cb;padding:7px 8px;text-align:right;vertical-align:top;overflow-wrap:anywhere}th{background:${accent};color:white;print-color-adjust:exact;-webkit-print-color-adjust:exact}tr{break-inside:avoid}thead{display:table-header-group}tbody tr:nth-child(even){background:#f7fafc;print-color-adjust:exact;-webkit-print-color-adjust:exact}p{white-space:pre-wrap;overflow-wrap:anywhere;margin:8px 0}.sign{min-height:70px}.total{font-weight:bold}.draft{border:1px solid #555;padding:5px}.footer-note{margin-top:16px;padding-top:10px;border-top:1px dashed #aab7c3;color:#475569;font-size:12px}@media print{body{padding:0}}</style></head><body><div class="page">${body}</div></body></html>`;}
export function invoicePrintHtml(invoice,data={},prefs={},mode='shamsi'){
 const date=v=>formatCalendarDate(v,mode);const currency=invoice.currency||'AFN';const extras=invoice.extraExpenses||[];const items=invoice.items||[];const goods=invoice.lineSubtotal??items.reduce((s,i)=>s+Number(i.quantity||0)*Number(i.price||0)-Number(i.discount||0),0);const exTotal=invoice.extraExpensesTotal??extras.reduce((s,i)=>s+Number(i.amount||0),0);const payments=invoice.payments||[];const initial=Math.max(0,Number(invoice.paid||0)-payments.reduce((s,p)=>s+Number(p.amount||0),0));const title=invoice.type==='purchase'?'بل خرید':invoice.type==='return'?'بل برگشتی':'بل فروش';
 const design=resolveDocumentDesign(prefs,'bill');
 let body=heading(`${title} #${invoice.number}`,prefs.shopName||'',design.logo)+table(['مشخصات','جزئیات'],[pair('نام بل',invoice.title),pair('تاریخ',date(invoice.date)),pair(invoice.type==='purchase'?'عرضه‌کننده':'مشتری',invoice.party),pair('گدام',(data.warehouses||[]).find(w=>String(w.id)===String(invoice.warehouseId))?.name||'گدام عمومی'),pair('واحد پول و نرخ',currency==='AFN'?'AFN':`1 ${currency} = ${n(invoice.exchangeRate)} AFN`),pair('وضعیت',invoice.status),...(invoice.shipmentId?[pair('محموله',(data.shipments||[]).find(w=>String(w.id)===String(invoice.shipmentId))?.containerNumber||invoice.shipmentId),pair('وزن فروخته‌شده (تن)',invoice.soldTonnes)]:[])]);
 body+='<h2>جزئیات اجناس</h2>'+table(['جنس','تعداد','قیمت واحد AFN','تخفیف AFN','مجموع AFN'],items.map(i=>row(i.product,`${n(i.quantity)} ${i.unit||''}`,n(i.price),n(i.discount),n((invoice.type==='purchase'&&i.lineTotalAfn!=null?Number(i.lineTotalAfn):Number(i.quantity||0)*Number(i.price||0))-Number(i.discount||0)))))+'<h2>مصارف اضافی</h2>'+table(['شرح مصرف','مبلغ اصلی','مبلغ AFN'],extras.length?extras.map(x=>row(x.description,x.sourceAmount!=null?`${n(x.sourceAmount)} ${currency}`:'—',n(x.amount))):[row('مصرف اضافی ثبت نشده','—','۰')]);
 if(invoice.type==='purchase' && items.some(i=>i.unitLandedCost!=null))body+='<h2>قیمت تمام‌شده اجناس با مصارف</h2>'+table(['جنس','سهم مصارف AFN','قیمت تمام‌شده فی واحد AFN'],items.map(i=>row(i.product,n(i.allocatedExpenses),n(i.unitLandedCost))));
 if(currency!=='AFN')body+='<h2>قیمت اصلی اجناس</h2>'+table(['جنس',`قیمت واحد (${currency})`,`تخفیف (${currency})`],items.map(i=>row(i.product,n(i.sourcePrice??Number(i.price)/Number(invoice.exchangeRate||1)),n(i.sourceDiscount??Number(i.discount||0)/Number(invoice.exchangeRate||1)))));
 body+='<h2>خلاصه حساب</h2>'+table(['شرح','مبلغ'],[pair('مجموع قیمت اجناس',m(goods)),pair('مجموع مصارف اضافی',m(exTotal)),pair('مجموع نهایی بل',m(invoice.total)),...(currency!=='AFN'?[pair('مجموع در ارز اصلی',`${n(invoice.foreignTotal??Number(invoice.total)/Number(invoice.exchangeRate||1))} ${currency}`)]:[]),pair('پرداخت‌شده',m(invoice.paid)),pair('باقی‌داری',m(invoice.balance))]);
 body+='<h2>سوابق پرداخت‌ها</h2>'+table(['تاریخ','شرح','مبلغ AFN'],[...(initial>0?[row(date(invoice.date),'پرداخت اولیه',n(initial))]:[]),...payments.map(p=>row(date(p.date),`${p.notes||'پرداخت'}${p.currency&&p.currency!=='AFN'?` (${n(p.sourceAmount)} ${p.currency})`:''}`,n(p.amount)))].concat(initial===0&&!payments.length?[row('—','پرداخت ثبت نشده','۰')]:[]));
 if(invoice.saleContract)body+=`<p>قرارداد: ${e(invoice.saleContract.contractNumber)} — پیش‌پرداخت ${e(invoice.saleContract.percent)}٪ — تاریخ نهایی پرداخت ${e(date(invoice.saleContract.due))}</p>`;if(invoice.notes)body+=`<h2>ملاحظات</h2><p>${e(invoice.notes)}</p>`;body+=`<div class=\"footer-note\">طرح انتخاب‌شده: بل ۱ (Minimal Navy). رنگ، لوگو و محتوای بل از داخل برنامه قابل تغییر است.</div>`;return documentHtml(title,body,design.color);
}
export function contractPrintHtml(contract,invoice=null,mode='shamsi',prefs=null){
 const c={...contractDraft(contract),...(prefs?.contractDesign?resolveDocumentDesign(prefs,'contract',contract):{})};
 const blank='........................';
 // Customer agreement is a standing agreement, NOT a duplicate of a sales invoice.
 // Prices, goods quantities, amount paid, and invoice balance never appear here.
 let body=heading(c.title,c.company||'',c.logo);
 body+=`<p>${e(c.intro)}</p><h2>۱. مشخصات خریدار و طرف قرارداد</h2>`;
 body+=table(['مشخصات','معلومات'],[
  pair('نام و تخلص / نام دکان',c.customerName||blank),
  pair('شماره تماس و آدرس',[c.customerPhone,c.customerAddress].filter(Boolean).join(' / ')||blank),
  pair('نوع و نمبر تذکره',[c.tazkiraType,c.customerIdNumber].filter(Boolean).join(' / ')||blank),
  pair('شماره قرارداد',c.contractNumber||blank)
 ]);
 body+='<h2>۲. شرایط عمومی و تعهدات خریدار</h2>';
 body+=`<p>حداقل پیش‌پرداخت مورد توافق: ${e(c.percent)}٪. مهلت پرداخت باقی‌داری: ${e(c.days)} روز پس از معامله.</p>`;
 body+=`<p>${e(c.terms)}</p><p>${e(c.payment)}</p>`;
 body+='<h2>۳. مشخصات تضمین‌کننده</h2>';
 body+=table(['اسم و ولد','نمبر تذکره','شماره تماس','وظیفه / کار'],[row([c.guarantor,c.father].filter(Boolean).join(' / ')||blank,c.guarantorId||blank,c.guarantorPhone||blank,c.guarantorJob||blank)]);
 body+=`<p>${e(c.guarantee)} — شصت ضامن: (                         )</p>`;
 body+='<h2>۴. تعهدات و تأیید نهایی</h2>';
 body+=`<p>${e(c.delivery)}</p><p>${e(c.final)}</p>`;
 body+=table(['نماینده شرکت','خریدار','ضامن','شاهد اول','شاهد دوم'],[
  row(c.representative||blank,c.customerName||blank,c.guarantor||blank,c.witness1||blank,c.witness2||blank),
  row('امضا: '+blank,'امضا: '+blank,'امضا: '+blank,'امضا: '+blank,'امضا: '+blank)
 ]);
 body+=`<p>ضمیمه‌ها: ${c.customerCopy?'☑':'☐'} کاپی تذکره خریدار　${c.guarantorCopy?'☑':'☐'} کاپی تذکره ضامن</p>`;
 body+=`<div class=\"footer-note\">طرح انتخاب‌شده: قرارداد ۱ (Clean Blue). لوگو، رنگ و متن قرارداد قابل تغییر است.</div>`;
 return documentHtml(c.title,body,c.color);
}

export function printHtml(html){const w=window.open('','_blank');if(!w){window.alert('برای چاپ، اجازه باز شدن پنجره جدید را در مرورگر بدهید.');return false;}w.opener=null;w.document.open();w.document.write(html);w.document.close();const ready=()=>{w.focus();w.print();};Promise.all(Array.from(w.document.images).map(img=>img.decode?.().catch(()=>{})||Promise.resolve())).then(ready);return true;}
