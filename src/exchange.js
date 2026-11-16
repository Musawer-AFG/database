// Manual FX conversion for the client preview; AFN is the accounting/base currency.
export const CURRENCY_LABELS = {AFN:'افغانی (AFN)',USD:'دالر امریکایی (USD)',PKR:'روپیه پاکستانی (PKR)'};
export const CURRENCIES = Object.keys(CURRENCY_LABELS);
export const DEFAULT_RATES = {USD:0,PKR:0};
export function validExchangeRate(value) {
  return Number.isFinite(Number(value)) && Number(value)>0 && Number(value)<=1000000;
}
export function normalizeRates(source) {
  const value=source && typeof source==='object'?source:{};
  return {USD:validExchangeRate(value.USD)?Number(value.USD):0,PKR:validExchangeRate(value.PKR)?Number(value.PKR):0};
}
export const roundMoney = value => Math.round((Number(value)+Number.EPSILON)*100)/100;
export function currencyRate(currency,rates) {
  if(currency==='AFN') return 1;
  if(!['USD','PKR'].includes(currency)) throw Error('واحد پول معتبر نیست.');
  const rate=normalizeRates(rates)[currency];
  if(!rate) throw Error(`نرخ ${currency} را ابتدا در تنظیمات وارد کنید.`);
  return rate;
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
export function convertInvoiceToAfn(items,paid,currency,rates) {
  const rate=currencyRate(currency,rates);
  const totalSource=items.reduce((sum,item)=>sum+Number(item.quantity)*Number(item.price)-Number(item.discount||0),0);
  if(!Number.isFinite(totalSource)||totalSource<0) throw Error('مجموع بل معتبر نیست.');
  const total=toAfn(totalSource,currency,rates);
  const amountPaid=toAfn(paid,currency,rates);
  if(amountPaid>total) throw Error('پرداخت بیشتر از مجموع بل است.');
  return {
    rate,total,paid:amountPaid,balance:roundMoney(total-amountPaid),foreignTotal:roundMoney(totalSource),foreignPaid:roundMoney(paid),
    items:items.map(item=>({...item,sourcePrice:Number(item.price),sourceDiscount:Number(item.discount||0),price:toAfn(item.price,currency,rates),discount:toAfn(item.discount||0,currency,rates)})),
  };
}
