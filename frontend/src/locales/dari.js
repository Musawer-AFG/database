// Afghan Dari localization for the frontend demo. These are UI choices, not legal/tax rules.
import { AFGHAN_MONTHS, afghanDateOrder } from '../services/business.js';

export const AFGHAN_PROVINCES = Object.freeze([
  'ارزگان', 'بادغیس', 'بامیان', 'بدخشان', 'بغلان', 'بلخ',
  'پروان', 'پکتیا', 'پکتیکا', 'پنجشیر', 'تخار', 'جوزجان',
  'خوست', 'دایکندی', 'زابل', 'سرپل', 'سمنگان', 'غزنی',
  'غور', 'فاریاب', 'فراه', 'کابل', 'کاپیسا', 'کندهار',
  'کندز', 'کنر', 'لغمان', 'لوگر', 'میدان وردک', 'ننگرهار',
  'نیمروز', 'نورستان', 'هرات', 'هلمند'
].sort((a,b)=>a.localeCompare(b,'fa-AF')));

export const AFGHAN_FIELD_CHOICES = Object.freeze({
  customerType: ['شخصی', 'دکان', 'شرکت', 'مؤسسه'],
  accountType: ['دارایی', 'بدهی', 'سرمایه', 'درآمد', 'مصرف'],
  gender: ['مرد', 'زن'],
  marital: ['مجرد', 'متأهل', 'بیوه', 'طلاق‌شده'],
  status: ['فعال', 'غیرفعال'],
  contract: ['دایمی', 'موقت', 'قراردادی', 'روزمزد'],
  education: ['بی‌سواد', 'ابتدایی', 'متوسطه', 'لیسه', 'پوهنتون', 'ماستری', 'دوکتورا']
});

// Both new numeric entries and old saved records such as '۲۲ عقرب ۱۴۰۵' are accepted.
export function dateChoiceParts(value) {
  const valueNumber = afghanDateOrder(value);
  if (!valueNumber) return null;
  return {
    year: Math.floor(valueNumber / 10000),
    month: Math.floor(valueNumber / 100) % 100,
    day: valueNumber % 100
  };
}

export function buildAfghanDate({year,month,day}) {
  const y=Number(year), m=Number(month), d=Number(day);
  const maxDay=m<=6?31:30;
  if (!Number.isInteger(y) || y<1300 || y>1600 || !Number.isInteger(m) || m<1 || m>12 || !Number.isInteger(d) || d<1 || d>maxDay) return '';
  return `${String(y).padStart(4,'0')}/${String(m).padStart(2,'0')}/${String(d).padStart(2,'0')}`;
}

export { AFGHAN_MONTHS };
