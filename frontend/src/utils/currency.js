import {totalExtras,normalizeExtraExpenses} from "../services/invoiceExtras.js";
// Manual FX conversion for the client preview; AFN is the accounting/base currency.
export const CURRENCY_LABELS = {AFN:'افغانی (AFN)',USD:'دالر امریکایی (USD)',PKR:'روپیه پاکستانی (PKR)',AED:'درهم امارات (AED)',EUR:'یورو (EUR)'};
export const CURRENCIES = Object.keys(CURRENCY_LABELS);
export const DEFAULT_RATES = {USD:0,PKR:0,AED:0,EUR:0};
export const rateFieldFor = code => ({USD:'usdRate',PKR:'pkrRate',AED:'aedRate',EUR:'eurRate'})[code] || ''; 
export function validExchangeRate(value) {
  return Number.isFinite(Number(value)) && Number(value)>0 && Number(value)<=1000000;
}
export function normalizeRates(source) {
  const value=source && typeof source==='object'?source:{};
  return Object.fromEntries(Object.keys(DEFAULT_RATES).map(code=>[code,validExchangeRate(value[code])?Number(value[code]):0]));
}
export const roundMoney = value => Math.round((Number(value)+Number.EPSILON)*100)/100;
export const quoteUnits = currency => currency === "PKR" ? 1000 : 1;
export const quoteLabel = currency => `${currency === "PKR" ? "۱۰۰۰" : "۱"} ${currency}`;
// Existing invoices stored PKR quotes per rupee. Only the quote changes, never saved AFN amounts.
export function upgradeInvoiceQuote(invoice) {
  if(invoice.fxQuoteVersion === 2) return invoice;
  return {...invoice, pkrRate: Number(invoice.pkrRate||(invoice.currency==='PKR'?invoice.exchangeRate:0)||0)*1000, fxQuoteVersion:2};
}
export function currencyRate(currency,rates) {
  if(currency==='AFN') return 1;
  if(!Object.hasOwn(DEFAULT_RATES,currency)) throw Error('واحد پول معتبر نیست.');
  const rate=normalizeRates(rates)[currency];
  if(!rate) throw Error(`نرخ ${currency} را در همین بل یا فورم وارد کنید.`);
  return rate / quoteUnits(currency);
}
export function toAfn(amount,currency='AFN',rates={}) {
  const numeric=Number(amount);
  if(!Number.isFinite(numeric)||numeric<0) throw Error('مبلغ باید عدد مثبت یا صفر باشد.');
  return roundMoney(numeric*currencyRate(currency,rates));
}
export function fromAfn(amount,currency='AFN',rates={}) {
  const numeric=Number(amount);
  if(!Number.isFinite(numeric)||numeric<0) throw Error('مبلغ معتبر نیست.');
  return roundMoney(numeric/currencyRate(currency,rates));
}
export function convertInvoiceToAfn(items,paid,currency,rates,extraExpenses=[]) {
  const rate=currencyRate(currency,rates);
  const totalSource=items.reduce((sum,item)=>sum+(item.enteredTotal?Number(item.lineTotal):Number(item.quantity)*Number(item.price))-Number(item.discount||0),0);
  if(!Number.isFinite(totalSource)||totalSource<0) throw Error('مجموع بل معتبر نیست.');
  const expensesSource=totalExtras(extraExpenses);
  const total=toAfn(roundMoney(totalSource+expensesSource),currency,rates);
  const amountPaid=toAfn(paid,currency,rates);
  if(amountPaid>total) throw Error('پرداخت بیشتر از مجموع بل است.');
  return {
    rate,total,paid:amountPaid,balance:roundMoney(total-amountPaid),foreignTotal:roundMoney(totalSource+expensesSource),foreignPaid:roundMoney(paid),
    lineSubtotal:toAfn(totalSource,currency,rates),extraExpensesTotal:toAfn(expensesSource,currency,rates),
    extraExpenses:normalizeExtraExpenses(extraExpenses,amount=>toAfn(amount,currency,rates)),
    items:items.map(item=>({...item,sourcePrice:Number(item.price),sourceLineTotal:item.enteredTotal?Number(item.lineTotal):undefined,
      lineTotalAfn:toAfn(item.enteredTotal?Number(item.lineTotal):Number(item.price)*Number(item.quantity),currency,rates),
      sourceDiscount:Number(item.discount||0),price:toAfn(item.price,currency,rates),discount:toAfn(item.discount||0,currency,rates)})),
  };
}
