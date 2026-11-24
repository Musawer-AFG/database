import {documentDesignChanged} from '../utils/documentDesigns.js';
// Summarize mutations before a settings password confirmation.
// Password verification must take place again for each requested action.
export function describeSettingsChanges(previous = {}, next = {}) {
  const updates = [];
  if (String(previous.shopName || '').trim() !== String(next.shopName ?? previous.shopName ?? '').trim()) {
    updates.push('تغییر نام عمده‌فروشی');
  }
  if (String(previous.shopLogo || '') !== String(next.shopLogo ?? previous.shopLogo ?? '')) {
    updates.push(next.shopLogo ? 'افزودن یا تغییر لوگوی عمده‌فروشی' : 'حذف لوگوی عمده‌فروشی');
  }
  if (next.fiscalYear != null && Number(previous.fiscalYear) !== Number(next.fiscalYear)) {
    updates.push(`تغییر سال مالی از ${previous.fiscalYear} به ${next.fiscalYear}`);
  }
  if (next.openingCash != null && Number(previous.openingCash || 0) !== Number(next.openingCash)) {
    updates.push(`تغییر موجودی آغازین صندوق نقدی از ${previous.openingCash || 0} به ${next.openingCash}`);
  }
  if (next.calendarMode !== undefined && next.calendarMode !== previous.calendarMode) updates.push(`تغییر نوع تقویم به ${next.calendarMode==='gregorian'?'میلادی':'شمسی'}`);
  for (const code of ['USD', 'PKR']) {
    if (next.rates && Number(previous.rates?.[code] || 0) !== Number(next.rates[code] || 0)) {
      updates.push(`تغییر نرخ تبدیل ${code} به افغانی`);
    }
  }
  if(next.billDesign!==undefined&&documentDesignChanged(previous.billDesign,next.billDesign)) updates.push('تغییر طرح چاپ بل‌های فروش و خرید');
  if(next.contractDesign!==undefined&&documentDesignChanged(previous.contractDesign,next.contractDesign)) updates.push('تغییر طرح چاپ قرارداد مشتریان');
  return updates;
}

export const DESTRUCTIVE_SETTINGS_ACTIONS = Object.freeze({
  clearTransactions: {
    title: 'پاک‌کردن معاملات',
    details: [
      'تمام معاملات، بل‌ها، مشتریان، اجناس، کارمندان و دیگر ریکاردهای کاری این نسخه پاک می‌شوند.',
      'حساب مدیر، نام عمده‌فروشی و تنظیمات عمومی باقی می‌مانند.',
      'این عمل قابل برگشت نیست. پیش از ادامه از معلومات خود نسخهٔ احتیاطی بگیرید.',
    ],
  },
  resetBusiness: {
    title: 'شروع دوباره از صفر',
    details: [
      'تمام معاملات، حساب‌های کاربران، رمزها، لوگو و تنظیمات همین نسخه پاک می‌شوند.',
      'برنامه به صفحهٔ ساخت حساب مدیر جدید برمی‌گردد.',
      'این عمل قابل برگشت نیست. پیش از ادامه از معلومات خود نسخهٔ احتیاطی بگیرید.',
    ],
  },
});
