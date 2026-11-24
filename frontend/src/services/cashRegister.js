// Cash-register totals are derived from actual recorded payments, not invoice face values.
// This prevents duplicate deductions and correctly handles credit invoices and partial settlements.
import { afghanDateOrder, cash } from './business.js';

export function cashRegister(data={}, openingCash=0) {
  const opening = cash(Math.max(0, Number(openingCash) || 0));
  const entries=[];
  const add = (id, date, label, signedAmount, category, ref='') => {
    const amount = Number(signedAmount);
    if (!Number.isFinite(amount) || !amount) return;
    entries.push({id:String(id),date:String(date||''),label:String(label||''),amount:cash(amount),category,ref});
  };
  for(const invoice of data.invoices||[]) {
    const sign=invoice.type==='sale'?1:-1;
    const kind=invoice.type==='sale'?'فروش نقدی':invoice.type==='purchase'?'پرداخت بل خرید':'بازپرداخت بل برگشتی';
    add(`bill-${invoice.id}`,invoice.date,`${kind} #${invoice.number||invoice.id}${invoice.party?` — ${invoice.party}`:''}`,sign*Number(invoice.paid||0) - (invoice.payments||[]).reduce((s,p)=>s+sign*Number(p.amount||0),0),kind,invoice.id);
    for(const payment of invoice.payments||[]) {
      const isSale=invoice.type==='sale';
      if(payment.viaCash===false) continue;
      add(`payment-${invoice.id}-${payment.id}`,payment.date,`${isSale?'دریافت قرض مشتری':'پرداخت قرض عرضه‌کننده'} — بل #${invoice.number||invoice.id}`,sign*Number(payment.amount||0),isSale?'دریافت قرض مشتری':'پرداخت قرض عرضه‌کننده',invoice.id);
    }
  }
  // Shipment charges paid from the cash register (not included in the invoice amount).
  for(const shipment of data.shipments||[]) for(const charge of shipment.costs||[]) if(charge.paid)
    add(`shipment-${shipment.id}-${charge.id}`,shipment.date,`مصرف محموله ${shipment.reference}: ${charge.description}`,-Number(charge.afn||0),'مصارف محموله',shipment.id);
  // Payments between traders can be outside the shop cash register.
  for(const settlement of data.settlements||[]) if(settlement.viaCash && !settlement.invoiceId && ['receive','pay'].includes(settlement.kind))
    add(`settlement-${settlement.id}`,settlement.date,`${settlement.kind==='receive'?'دریافت':'پرداخت'} علی‌الحساب: ${settlement.party}`,settlement.kind==='receive'?Number(settlement.afn||0):-Number(settlement.afn||0),'تصفیه حساب',settlement.id);
  for(const expense of data.expenses||[]) add(`expense-${expense.id}`,expense.date,`مصرف: ${expense.name||'مصرف'}`,-Number(expense.amount||0),'مصارف',expense.id);
  for(const salary of data.payroll||[]) if(salary.status==='paid') {
    const net=Math.max(0,Number(salary.net??(Number(salary.base||0)+Number(salary.bonus||0)-Number(salary.deduction||0))));
    add(`salary-${salary.id}`,salary.paidDate||salary.date,`معاش: ${salary.employeeName||'کارمند'}`,-net,'معاشات',salary.id);
  }
  // Only cash handed over or received affects the cash register. Invoice settlement
  // through the sarraf is already recorded as a non-cash payment.
  for(const t of data.sarrafTransactions||[]) {
    if(t.kind==='deposit'||t.kind==='withdraw')add(`sarraf-${t.id}`,t.date,`${t.kind==='deposit'?'سپردن پول به صراف':'گرفتن پول از صراف'} — ${t.sarrafName}`,t.kind==='deposit'?-Number(t.afn):Number(t.afn),'صرافان',t.id);
  }
  for(const item of data.cashEntries||[]) {
    add(`manual-${item.id}`,item.date,item.description||'حرکت دستی صندوق',item.kind==='in'?Number(item.amount||0):-Number(item.amount||0),item.kind==='in'?'افزودن پول مالک':'برداشت پول مالک',item.id);
  }
  // Process transactions in date order, retaining stable insertion ordering for same-day entries.
  entries.sort((a,b)=>afghanDateOrder(a.date)-afghanDateOrder(b.date)||a.id.localeCompare(b.id));
  let balance=opening;
  const history=entries.map(entry=>{balance=cash(balance+entry.amount);return {...entry,balance};});
  const incoming=cash(entries.reduce((s,x)=>s+Math.max(0,x.amount),0));
  const outgoing=cash(entries.reduce((s,x)=>s+Math.max(0,-x.amount),0));
  return {opening,incoming,outgoing,balance:cash(balance),entries:history.reverse()};
}

export function canAffordCash(data,openingCash,amount) {
  const number=Number(amount);
  return Number.isFinite(number) && number>=0 && cashRegister(data,openingCash).balance + 0.001 >= number;
}

export function buildManualCashEntry(input) {
  const amount=Number(input?.amount);
  if(!Number.isFinite(amount)||amount<=0) throw Error('مبلغ باید بیشتر از صفر باشد.');
  if(!['in','out'].includes(input?.kind)) throw Error('نوع حرکت صندوق معتبر نیست.');
  const description=String(input?.description||'').trim();
  if(!description) throw Error('توضیح منبع پول یا برداشت ضروری است.');
  if(!afghanDateOrder(input?.date)) throw Error('تاریخ افغانی معتبر انتخاب کنید.');
  return {id:`${Date.now()}-${Math.random().toString(36).slice(2,8)}`,kind:input.kind,amount:cash(amount),date:input.date,description};
}
