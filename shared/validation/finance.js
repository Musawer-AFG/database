export const SUPPORTED_CURRENCIES=Object.freeze(['AFN','USD','PKR','AED','EUR']);
export function validCurrency(value){return SUPPORTED_CURRENCIES.includes(value);}
export function validExchangeRate(value){return Number.isFinite(Number(value))&&Number(value)>0;}
export function validMoney(value){return Number.isFinite(Number(value))&&Number(value)>=0;}
