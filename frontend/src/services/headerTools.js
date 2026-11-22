// Header quick-search is intentionally read-only and searches browser-local demo data.
// Filtering by permission happens before results are shown.
import { canOpenPage } from './accessControl.js';
import { afghanDateOrder } from './business.js';
const clean = value => String(value ?? '')
  .replace(/[يى]/g, 'ی').replace(/ك/g, 'ک')
  .replace(/[۰-۹]/g, d => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
  .replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
  .replace(/[\u064b-\u065f]/g, '')
  .trim().toLowerCase();

export function quickSearch(data, text, access, userId, limit=14) {
  const query=clean(text);
  if(query.length<2) return [];
  const result=[];
  const add=(page,label,caption,match,fields) => {
    if(!canOpenPage(access,userId,page)) return;
    if(!fields.some(v=>clean(v).includes(query))) return;
    result.push({page,label,caption,match:String(match || label)});
  };
  for(const p of data?.products || []) add('products',p.name || 'محصول',`محصول • ${p.code || 'بدون کد'}`,p.name,[p.name,p.code,p.group,p.unit,p.sstid]);
  for(const c of data?.customers || []) add('customers',c.name || 'مشتری',`مشتری • ${c.phone || ''}`,c.name,[c.name,c.phone,c.mobile,c.economicNumber,c.province]);
  for(const s of data?.suppliers || []) add('suppliers',s.name || 'عرضه‌کننده',`عرضه‌کننده • ${s.phone || ''}`,s.name,[s.name,s.phone,s.mobile,s.province]);
  for(const e of data?.employees || []) {
    const name=[e.firstName,e.lastName].filter(Boolean).join(' ');
    add('employees',name || 'کارمند',`کارمند • ${e.position || e.employeeCode || ''}`,e.firstName || e.lastName,[name,e.firstName,e.lastName,e.employeeCode,e.position,e.phone]);
  }
  for(const invoice of data?.invoices || []) {
    const page=invoice.type==='purchase'?'purchases':invoice.type==='return'?'returns':'sales';
    add(page,invoice.title || invoice.party || 'بل',`بل • ${invoice.party||''} • ${invoice.date||''}`,invoice.title||invoice.party,[invoice.id,invoice.title,invoice.party,invoice.date,invoice.notes]);
  }
  for(const warehouse of data?.warehouses || []) add('warehouses',warehouse.name||'گدام',`گدام • ${warehouse.location||''}`,warehouse.name,[warehouse.name,warehouse.location,warehouse.manager]);
  return result.slice(0,Math.max(1,limit));
}
export function transactionsForDay(data,date) {
  const chosen=afghanDateOrder(date);
  if(!chosen) return [];
  const rows=[];
  for(const inv of data?.invoices || []) if(afghanDateOrder(inv.date)===chosen)
    rows.push({page:inv.type==='purchase'?'purchases':inv.type==='return'?'returns':'sales',label:inv.title||inv.party||'بل',kind:inv.type==='purchase'?'خرید':inv.type==='return'?'برگشتی':'فروش',amount:Number(inv.total||0)});
  for(const x of data?.expenses || []) if(afghanDateOrder(x.date)===chosen)
    rows.push({page:'expenses',label:x.name||x.title||x.description||'مصرف',kind:'مصرف / درآمد',amount:Number(x.amount||0)});
  for(const x of data?.journals || []) if(afghanDateOrder(x.date)===chosen)
    rows.push({page:'journal',label:x.name||x.title||'سند حسابداری',kind:'سند',amount:0});
  return rows;
}
