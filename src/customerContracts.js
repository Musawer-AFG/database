import { afghanFromGregorian, gregorianFromAfghan } from './calendarDisplay.js';
import { roundMoney } from './exchange.js';
import { resolveDocumentDesign } from './documentDesigns.js';
export const contractPresets={cash:[100,0],half:[50,28],credit:[0,28],quarter:[25,28],custom:[25,28]};
export const defaultClauses={intro:'این قرارداد میان شرکت و خریدار زیر، با شرایط مندرج این سند، منعقد گردید.',payment:'خریدار اقرار می‌نماید جنس و مبلغ فوق را دریافت نموده و متعهد است باقی‌داری را در موعد تعیین‌شده بدون تأخیر به شرکت بپردازد. هرگونه تمدید مهلت فقط با موافقت کتبی شرکت معتبر است.',guarantee:'ضامن سر و مال میباشد.',delivery:'خریدار با امضای این سند، دریافت مقدار و نوع جنس درج‌شده را تأیید نموده و اقرار می‌کند که جنس را بررسی کرده است. این قرارداد در دو نسخه با اعتبار یکسان ترتیب گردیده است.',final:'طرفین در اقرار خود صادق میباشد.'};
export function contractDraft(value={}){return {enabled:false,preset:'half',percent:50,days:28,title:'قرارداد فروش جنس به‌صورت نقد و اوگرایی',color:'#214661',logo:'',tazkiraType:'',guarantor:'',father:'',guarantorId:'',guarantorPhone:'',guarantorJob:'',representative:'',witness1:'',witness2:'',terms:'',receipt:false,guarantorCopy:false,guarantorScan:null,...defaultClauses,...value};}
// Preserve the agreed deadline when switching to a manually entered percentage.
export function selectContractPreset(value,preset){
 const c=contractDraft(value);
 if(!Object.prototype.hasOwnProperty.call(contractPresets,preset))return c;
 if(preset==='custom')return {...c,preset,percent:c.preset==='custom'?c.percent:'',days:Number(c.days)>0?c.days:28};
 const [percent,days]=contractPresets[preset];return {...c,preset,percent,days};
}
export function validateContract(value){if(!value?.enabled)return ''; const c=contractDraft(value); if(c.percent==null||String(c.percent).trim()===''||!Number.isFinite(Number(c.percent))||Number(c.percent)<0||Number(c.percent)>100)return 'فیصدی پیش‌پرداخت باید بین صفر و صد باشد.'; if(c.days===''||!Number.isInteger(Number(c.days))||Number(c.days)<0||Number(c.days)>3650||(Number(c.percent)<100&&Number(c.days)<1))return 'مهلت پرداخت باقی‌داری را به تعداد روز معتبر وارد کنید.'; if(!/^#[0-9a-f]{6}$/i.test(c.color))return 'رنگ قرارداد معتبر نیست.'; if(!String(c.title).trim())return 'عنوان قرارداد ضروری است.'; return '';}
export function dueDate(date,days){const iso=gregorianFromAfghan(date);if(!iso||!Number.isInteger(Number(days))||Number(days)<0||Number(days)>3650)return '';const d=new Date(iso+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+Number(days));return afghanFromGregorian(d.toISOString().slice(0,10));}
export function requiredDownPayment(total,contract){return contract?.enabled?roundMoney(Number(total)*Number(contract.percent)/100):0;}
// Calculate the minimum in the invoice currency so cent rounding cannot create a false shortfall after FX conversion.
export function requiredDownPaymentSource(total,contract,rate=1){
  if(!contract?.enabled)return 0;
  const fx=Number(rate)>0?Number(rate):1;
  const rounded=roundMoney(total);
  if(Number(contract.percent)===100)return rounded;
  const required=requiredDownPayment(roundMoney(rounded*fx),contract);
  return Math.min(rounded,Math.ceil((required/fx-1e-9)*100)/100);
}
export function paymentContractError(total,paid,contract,date){if(!contract?.enabled)return '';const error=validateContract(contract);if(error)return error;if(!dueDate(date,Number(contract.days)))return 'تاریخ قرارداد معتبر نیست.';if(Number(paid)<requiredDownPayment(total,contract))return 'مبلغ پرداخت اولیه کمتر از پیش‌پرداخت تعیین‌شده در قرارداد مشتری است.';return '';}
export function contractSnapshot(customer,preferences,invoice){if(!customer?.saleContract?.enabled)return null;const {guarantorScan,...c}=contractDraft(customer.saleContract);return {...c,...resolveDocumentDesign(preferences,'contract',c),guarantorCopy:!!guarantorScan||c.guarantorCopy,company:preferences.shopName,customerName:customer.name,customerPhone:customer.mobile||customer.phone||'',customerAddress:[customer.province,customer.district,customer.address].filter(Boolean).join('، '),customerIdNumber:customer.tazkira||'',customerCopy:!!customer.identityScan,contractNumber:`S-${invoice.number}`,date:invoice.date,due:dueDate(invoice.date,Number(invoice.balance)>0?Number(c.days):0),total:invoice.total,paid:invoice.paid,balance:invoice.balance,minimum:requiredDownPayment(invoice.total,c)};}
