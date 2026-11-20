import {afghanDateOrder} from './business.js';
const value=x=>Number(x)||0;
const top=(rows,limit=7)=>rows.filter(r=>r.a||r.b).sort((x,y)=>(y.a+y.b)-(x.a+x.b)).slice(0,limit);
export function reportChartData(page,{invoices=[],business={},balances=[],journalLines=[],ledgerLines=[],documents=[]}={}){
 if(page==='reports'){
  const months=new Map();
  for(const invoice of business.invoices||invoices){
   const key=afghanDateOrder(invoice.date);if(!key)continue;
   const month=`${Math.floor(key/10000)}/${String(Math.floor(key/100)%100).padStart(2,'0')}`;
   const row=months.get(month)||{label:month,a:0,b:0};
   if(invoice.type==='sale')row.a+=value(invoice.total);
   if(invoice.type==='purchase')row.b+=value(invoice.total);
   months.set(month,row);
  }
  return {title:'فروشات و خریداری‌ها به تفکیک ماه',legend:['فروشات','خریداری‌ها'],rows:[...months.values()].sort((a,b)=>a.label.localeCompare(b.label)).slice(-8)};
 }
 if(page==='trialBalance')return {title:'بیشترین گردش حساب‌ها',legend:['دیبیت','کریدیت'],rows:top(balances.map(x=>({label:x.account||'حساب نامشخص',a:value(x.debit),b:value(x.credit)})))};
 if(page==='documentReport')return {title:'گردش اسناد حسابداری',legend:['دیبیت','کریدیت'],rows:top(documents.map(x=>({label:`#${x.number} ${x.name||''}`,a:value(x.debit),b:value(x.credit)})))};
 if(page==='ledgerReport'){
  const grouped=new Map();for(const x of ledgerLines){const row=grouped.get(x.account)||{label:x.account||'بدون سرفصل',a:0,b:0};row.a+=value(x.debit);row.b+=value(x.credit);grouped.set(x.account,row);}
  return {title:'گردش حساب در گزارش کل',legend:['دیبیت','کریدیت'],rows:top([...grouped.values()])};
 }
 const byDate=new Map();for(const x of journalLines){const row=byDate.get(x.date)||{label:x.date||'بدون تاریخ',a:0,b:0};row.a+=value(x.debit);row.b+=value(x.credit);byDate.set(x.date,row);}
 return {title:'گردش روزانه دیبیت و کریدیت',legend:['دیبیت','کریدیت'],rows:[...byDate.values()].sort((a,b)=>afghanDateOrder(a.label)-afghanDateOrder(b.label)).slice(-8)};
}
