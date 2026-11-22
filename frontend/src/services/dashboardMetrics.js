// Derived dashboard information from local demo records; all amounts are AFN.
import { AFGHAN_MONTHS, afghanCalendarParts, afghanDateOrder, inventoryState, cash } from './business.js';

export function financialYearOptions(data, chosenYear, now = new Date()) {
  const current = afghanCalendarParts(now).year;
  const years = new Set([Number(chosenYear), ...Array.from({length: 9}, (_,index) => current + 2 - index)]);
  for (const collection of [data.invoices, data.expenses, data.payroll, data.journals, data.stockMovements, data.attendance]) {
    for (const record of collection || []) {
      const d = afghanDateOrder(record.date || (record.year && record.month ? `${record.year}/${String(record.month).padStart(2,'0')}/01` : ''));
      if (d) years.add(Math.floor(d / 10000));
    }
  }
  return [...years].filter(y => Number.isInteger(y) && y >= 1300 && y <= 1600).sort((a,b) => b-a);
}

export function monthlySalesPurchases(data, year) {
  const rows = AFGHAN_MONTHS.map((name, index) => ({name, month:index+1, sales:0, purchases:0}));
  for (const invoice of data.invoices || []) {
    const date = afghanDateOrder(invoice.date);
    if (!date || Math.floor(date/10000) !== Number(year)) continue;
    const row = rows[Math.floor(date/100)%100 - 1];
    if (!row) continue;
    if (invoice.type === 'sale') row.sales += Number(invoice.total || 0);
    if (invoice.type === 'purchase') row.purchases += Number(invoice.total || 0);
  }
  return rows.map(row => ({...row, sales:cash(row.sales), purchases:cash(row.purchases)}));
}

const dayMs = 86400000;
const persianFormatter = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
  timeZone:'UTC', year:'numeric',month:'numeric',day:'numeric'
});
function persianOrderForUtcDay(day) {
  const parts = Object.fromEntries(persianFormatter.formatToParts(new Date(day*dayMs)).map(part => [part.type,part.value]));
  return Number(parts.year)*10000+Number(parts.month)*100+Number(parts.day);
}
// Binary search in the native Persian-calendar formatter so leap years remain accurate.
export function afghanDateDayNumber(value) {
  const order = afghanDateOrder(value);
  if (!order) return null;
  const year = Math.floor(order / 10000);
  let low = Math.floor(Date.UTC(year+620,0,1)/dayMs);
  let high = Math.floor(Date.UTC(year+623,0,1)/dayMs);
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const date = persianOrderForUtcDay(mid);
    if (date === order) return mid;
    if (date < order) low = mid + 1;
    else high = mid - 1;
  }
  return null;
}

export function customerDebtAging(data, asOf = new Date()) {
  const buckets = [
    {key:'0-30', label:'۰ تا ۳۰ روز', total:0, count:0},
    {key:'31-60', label:'۳۱ تا ۶۰ روز', total:0, count:0},
    {key:'61-90', label:'۶۱ تا ۹۰ روز', total:0, count:0},
    {key:'90+', label:'بیشتر از ۹۰ روز', total:0, count:0},
  ];
  // Format "now" at UTC midnight so local time-zone offsets do not shift aging buckets.
  const today = Math.floor(Date.UTC(asOf.getFullYear(), asOf.getMonth(), asOf.getDate())/dayMs);
  let unknown = 0;
  let unknownCount = 0;
  for (const inv of data.invoices || []) {
    if (inv.type !== 'sale') continue;
    const balance = Number(inv.balance ?? (Number(inv.total||0)-Number(inv.paid||0)));
    if (!(balance > 0)) continue;
    const invoiceDay = afghanDateDayNumber(inv.date);
    if (invoiceDay == null) {unknown += balance; unknownCount++; continue;}
    const days = Math.max(0, today-invoiceDay);
    const row = buckets[days <= 30 ? 0 : days <= 60 ? 1 : days <= 90 ? 2 : 3];
    row.total += balance;
    row.count++;
  }
  return {buckets:buckets.map(x => ({...x,total:cash(x.total)})), unknown:cash(unknown), unknownCount};
}

export function lowStockProducts(data) {
  return inventoryState(data).rows.filter(item => Number(item.reorder||0)>0 && Number(item.quantity||0)<=Number(item.reorder||0))
    .sort((a,b) => Number(a.quantity||0)/Number(a.reorder||1)-Number(b.quantity||0)/Number(b.reorder||1));
}

// Used to block a year switch that would otherwise lead to an empty dashboard.
export function financialYearRecordCount(data, year) {
  const wanted=Number(year);
  if(!Number.isInteger(wanted)) return 0;
  let count=0;
  for(const collection of ['invoices','expenses','payroll','journals','stockMovements','attendance']) {
    for(const record of data?.[collection] || []) {
      const date=afghanDateOrder(record.date || (collection==='payroll' && record.year && record.month ? `${record.year}/${String(record.month).padStart(2,'0')}/01` : ''));
      if(date && Math.floor(date/10000)===wanted) count++;
    }
  }
  return count;
}
