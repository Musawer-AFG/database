// UI dates may be Shamsi or Gregorian. Business records remain in Afghan Shamsi dates.
import {afghanDateOrder,afghanCalendarParts,toLatinDigits} from '../services/business.js';
const persian=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{timeZone:'UTC',year:'numeric',month:'numeric',day:'numeric'});
const cache=new Map();
function fromUTC(utc){const p=Object.fromEntries(persian.formatToParts(new Date(utc)).map(x=>[x.type,x.value]));return Number(p.year)*10000+Number(p.month)*100+Number(p.day);}
export function afghanFromGregorian(iso){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(String(iso||'')))return '';
 const date=new Date(`${iso}T12:00:00Z`);if(!Number.isFinite(+date)||date.toISOString().slice(0,10)!==iso)return '';
 const p=Object.fromEntries(persian.formatToParts(date).map(x=>[x.type,x.value]));
 return `${p.year}/${String(p.month).padStart(2,'0')}/${String(p.day).padStart(2,'0')}`;
}
export function gregorianFromAfghan(value){
 const target=afghanDateOrder(value);if(!target)return '';
 if(cache.has(target))return cache.get(target);
 const year=Math.floor(target/10000)+621;
 let low=Date.UTC(year-2,0,1),high=Date.UTC(year+2,11,31);
 while(low<=high){
  const midDay=Math.floor(((low+high)/2)/86400000)*86400000;
  const observed=fromUTC(midDay);
  if(observed===target){const result=new Date(midDay).toISOString().slice(0,10);cache.set(target,result);return result;}
  if(observed<target)low=midDay+86400000;else high=midDay-86400000;
 }
 return '';
}
export const normalizedCalendarMode=mode=>mode==='gregorian'?'gregorian':'shamsi';
export function formatCalendarDate(value,mode='shamsi'){
 if(!value)return '—';
 if(normalizedCalendarMode(mode)==='gregorian')return gregorianFromAfghan(value)||String(value);
 return String(value);
}
export function groupedNumber(value){
 if(value===null||value===undefined||value==='')return '';
 const raw=toLatinDigits(value).replaceAll(',','').replaceAll('٬','').replaceAll(' ','');
 const match=raw.match(/^(-?)(\d*)(\.?)(\d*)$/);if(!match)return String(value);
 const [,sign,whole,dot,fraction]=match;
 return sign+(whole?whole.replace(/\B(?=(\d{3})+(?!\d))/g,','):'')+(dot?'.'+fraction:'');
}
export const ungroupedNumber=value=>toLatinDigits(value).replace(/[٬,\s]/g,'');
