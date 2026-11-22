// Read-only business insights. All figures are AFN and derived from saved transactions.
// Profit remains an estimate until inventory costs, returns, and journals are reconciled.
import { AFGHAN_MONTHS, afghanCalendarParts, afghanDateOrder, isInAfghanRange, cash, payrollAmounts } from './business.js';
import { cashRegister } from './cashRegister.js';
import { fifoStock } from './stockLots.js';
import { shipmentCost } from './tradeAccounting.js';

const amount = value => Number(value) || 0;
export const REPORT_TABS = Object.freeze([
  {id:'profit',label:'مفاد و ضرر'}, {id:'sales',label:'فروشات'},
  {id:'cash',label:'جریان پول'}, {id:'expenses',label:'مصارف'}, {id:'debts',label:'طلبات و قرض‌ها'}
]);

export function reportDateRange(mode, {year = afghanCalendarParts().year, now = afghanCalendarParts(), from = '', to = ''} = {}) {
  const mm = String(now.month).padStart(2,'0'), dd = String(now.day).padStart(2,'0');
  const last = now.month <= 6 ? 31 : 30;
  if (mode === 'today') return {from:`${now.year}/${mm}/${dd}`,to:`${now.year}/${mm}/${dd}`, label:'امروز'};
  if (mode === 'month') return {from:`${now.year}/${mm}/01`,to:`${now.year}/${mm}/${last}`,label:'این ماه'};
  if (mode === 'year') return {from:`${year}/01/01`,to:`${year}/12/30`,label:`سال ${year}`};
  if (mode === 'custom') return {from,to,label:'دورهٔ انتخاب‌شده'};
  return {from:'',to:'',label:'تمام دوره‌ها'};
}

export function validReportRange(from, to) {
  if (from && !afghanDateOrder(from)) return 'تاریخ شروع معتبر نیست.';
  if (to && !afghanDateOrder(to)) return 'تاریخ پایان معتبر نیست.';
  if (from && to && afghanDateOrder(from) > afghanDateOrder(to)) return 'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.';
  return '';
}

const inRange = (row, from, to, field = 'date') => isInAfghanRange(row[field], from, to);

function costOfSale(data, invoice, fifo) {
  const shipment = (data.shipments||[]).find(sh => String(sh.id)===String(invoice.shipmentId) && Number(invoice.soldTonnes)>0);
  if (shipment) return {cost: shipmentCost(data,shipment).perTonne * Number(invoice.soldTonnes), missing:0};
  let cost=0,missing=0;
  for (const [index,line] of (invoice.items||[]).entries()) {
    const matched=fifo.sales.get(`${invoice.id}-${index}`);
    if (!matched || matched.missing > 0) missing++;
    cost += amount(matched?.cost);
  }
  return {cost,missing};
}

// Use full historical purchases and stock movements when pricing sales in the selected period.
// Filtering source invoices before FIFO processing would misstate costs.
export function profitForRange(data, from = '', to = '', precomputedFifo = null) {
  const fifo=precomputedFifo || fifoStock(data);
  let sales=0,returns=0,cogs=0,missingCostLines=0;
  for (const inv of data.invoices||[]) {
    if (!inRange(inv,from,to)) continue;
    if(inv.type==='sale') {
      sales += amount(inv.total);
      const cost = costOfSale(data,inv,fifo);
      cogs += cost.cost; missingCostLines += cost.missing;
    } else if (inv.type==='return') returns += amount(inv.total);
  }
  const expenses=cash((data.expenses||[]).filter(row=>inRange(row,from,to)).reduce((sum,row)=>sum+amount(row.amount),0));
  // Same accrual basis as the existing profit engine: payroll is an expense of its recorded period.
  const wages=cash((data.payroll||[]).filter(row=>inRange(row,from,to)).reduce((sum,row)=>sum+payrollAmounts(row).net,0));
  const gross=cash(sales-returns-cogs);
  return {sales:cash(sales),returns:cash(returns),netSales:cash(sales-returns),cogs:cash(cogs),gross,expenses,wages,net:cash(gross-expenses-wages),missingCostLines,estimate:true};
}

export function cashForRange(data, openingCash=0, from='',to='') {
  const register=cashRegister(data,openingCash);
  const entries=register.entries.filter(row=>inRange(row,from,to));
  return {in:cash(entries.reduce((s,r)=>s+Math.max(0,amount(r.amount)),0)),out:cash(entries.reduce((s,r)=>s+Math.max(0,-amount(r.amount)),0)),entries,closingBalance:register.balance,net:cash(entries.reduce((s,r)=>s+amount(r.amount),0))};
}

export function debtSnapshot(data) {
  const sale=(data.invoices||[]).filter(x=>x.type==='sale'&&amount(x.balance)>0).map(x=>({...x,kind:'طلب مشتری'}));
  const purchase=(data.invoices||[]).filter(x=>x.type==='purchase'&&amount(x.balance)>0).map(x=>({...x,kind:'قرض عرضه‌کننده'}));
  return {receivable:cash(sale.reduce((s,x)=>s+amount(x.balance),0)),payable:cash(purchase.reduce((s,x)=>s+amount(x.balance),0)),sales:sale,purchases:purchase};
}

export function expenseCategories(data,from='',to='') {
  const grouped=new Map();
  for(const row of data.expenses||[]) if(inRange(row,from,to)) {
    const name=String(row.category||row.name||'مصارف دیگر').trim()||'مصارف دیگر';
    grouped.set(name,cash((grouped.get(name)||0)+amount(row.amount)));
  }
  for(const row of data.payroll||[]) if(inRange(row,from,to))
    grouped.set('معاشات',cash((grouped.get('معاشات')||0)+payrollAmounts(row).net));
  return [...grouped].map(([name,value])=>({name,value})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
}

export function monthlyFinancialTrends(data,year,openingCash=0) {
  const fifo=fifoStock(data);
  const register=cashRegister(data,openingCash);
  return AFGHAN_MONTHS.map((name,index)=>{
    const month=index+1,from=`${year}/${String(month).padStart(2,'0')}/01`;
    const to=`${year}/${String(month).padStart(2,'0')}/${month<=6?31:30}`;
    const profit=profitForRange(data,from,to,fifo);
    const entries=register.entries.filter(row=>inRange(row,from,to));
    return {month,name,sales:profit.netSales,expenses:cash(profit.expenses+profit.wages),gross:profit.gross,profit:profit.net,
      incoming:cash(entries.reduce((s,r)=>s+Math.max(0,amount(r.amount)),0)),
      outgoing:cash(entries.reduce((s,r)=>s+Math.max(0,-amount(r.amount)),0))};
  });
}

export function reportTransactions(data,tab,from='',to='',{limit=100}={}) {
  const invoices=(data.invoices||[]).filter(x=>inRange(x,from,to));
  let rows=[];
  if(tab==='cash') rows=cashForRange(data,0,from,to).entries.map(x=>({id:x.id,date:x.date,kind:x.category,name:x.label,amount:x.amount}));
  else if(tab==='debts') rows=[...debtSnapshot(data).sales,...debtSnapshot(data).purchases].map(x=>({id:x.id,date:x.date,kind:x.kind,name:x.party||'—',amount:x.balance}));
  else if(tab==='expenses') rows=[...(data.expenses||[]).filter(x=>inRange(x,from,to)).map(x=>({id:`expense-${x.id}`,date:x.date,kind:x.category||'مصرف',name:x.name||'—',amount:x.amount})),
    ...(data.payroll||[]).filter(x=>inRange(x,from,to)).map(x=>({id:`payroll-${x.id}`,date:x.date,kind:'معاش',name:x.employeeName||'—',amount:payrollAmounts(x).net}))];
  else rows=invoices.filter(x=>tab==='sales'?['sale','return'].includes(x.type):true).map(x=>({id:`inv-${x.id}`,date:x.date,kind:x.type==='sale'?'بل فروش':x.type==='purchase'?'بل خرید':'بل برگشتی',name:x.party||x.title||'—',amount:x.total}));
  const sorted=rows.sort((a,b)=>afghanDateOrder(b.date)-afghanDateOrder(a.date));
  return limit>0 ? sorted.slice(0,limit) : sorted;
}
