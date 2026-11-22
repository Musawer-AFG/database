// Small, plain-language summaries of the *filtered* reports.
// This is presentation logic only: no extra financial transactions are created.
const amount = n => Number.isFinite(Number(n)) ? Number(n) : 0;
const rounded = n => Math.round(n * 100) / 100;
export function everydayReportSummary(business={}) {
  const sales=rounded(amount(business.sales));
  const purchases=rounded(amount(business.purchases));
  const received=rounded(amount(business.received));
  const receivable=rounded(amount(business.receivable));
  const runningCosts=rounded(amount(business.expenses)+amount(business.paidPayroll));
  const paymentBase=Math.max(0,received)+Math.max(0,receivable);
  const paidPercent=paymentBase>0?Math.min(100,Math.max(0,Math.round(100*Math.max(0,received)/paymentBase))):0;
  return {sales,purchases,received,receivable,runningCosts,paymentBase,paidPercent};
}
export function accountingReportSummary({page='journalReport',journals=[],balances=[],ledgerLines=[]}={}) {
  // Filtering one ledger account should show that account's totals, not the totals of every account.
  const lines=page==='ledgerReport'?ledgerLines:balances;
  const debit=rounded(lines.reduce((sum,line)=>sum+amount(line.debit),0));
  const credit=rounded(lines.reduce((sum,line)=>sum+amount(line.credit),0));
  const difference=rounded(Math.abs(debit-credit));
  return {documentCount:journals.length,lineCount:ledgerLines.length,debit,credit,difference,balanced:difference<0.01};
}
