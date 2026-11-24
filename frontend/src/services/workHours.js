// Browser demo only. A real server MUST enforce these rules using its own clock.
export const SHOP_TIMEZONE = 'Asia/Kabul';
export const DEFAULT_SHIFT_START = '08:00';
export const DEFAULT_SHIFT_END = '20:00';
const HM = /^([01]\d|2[0-3]):[0-5]\d$/;
const DATE_TIME = /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/;
export const validShiftTime = value => HM.test(String(value || ''));
export const validAfghanDateTime = value => DATE_TIME.test(String(value || '')) && !Number.isNaN(Date.parse(`${value}+04:30`));
export function kabulLocalDateTime(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-GB', {timeZone: SHOP_TIMEZONE, year:'numeric', month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit', hourCycle:'h23'}).formatToParts(date);
  const map = Object.fromEntries(parts.map(p=>[p.type,p.value]));
  return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}
export function normalizeScheduleFields(record={}) {
  const shiftStart = validShiftTime(record.shiftStart) ? record.shiftStart : DEFAULT_SHIFT_START;
  const shiftEnd = validShiftTime(record.shiftEnd) ? record.shiftEnd : DEFAULT_SHIFT_END;
  const extraUntil = validAfghanDateTime(record.extraUntil) ? record.extraUntil : '';
  return {shiftStart,shiftEnd,extraUntil};
}
export function isDuringShift(start, end, nowTime) {
  if (!validShiftTime(start) || !validShiftTime(end) || !validShiftTime(nowTime)) return false;
  if (start===end) return false;
  return start<end ? nowTime>=start && nowTime<end : nowTime>=start || nowTime<end;
}
export function employeeAccess(user, at=new Date()) {
  if (!user || user.active===false) return {allowed:false,reason:'حساب کاربر غیرفعال است.'};
  if(user.system) return {allowed:true,reason:'مدیر سیستم بدون محدودیت شیفت'};
  const schedule=normalizeScheduleFields(user);
  const current=kabulLocalDateTime(at);
  if(isDuringShift(schedule.shiftStart,schedule.shiftEnd,current.slice(11))) return {allowed:true,reason:'در وقت کاری'};
  if(schedule.extraUntil && current<=schedule.extraUntil) return {allowed:true,reason:`اجازهٔ اضافی تا ${schedule.extraUntil.replace('T',' ')}`};
  return {allowed:false,reason:`وقت کاری این حساب از ${schedule.shiftStart} تا ${schedule.shiftEnd} به وقت افغانستان است. برای دسترسی اضافی از مدیر اجازه بگیرید.`};
}

// In the admin's “test access” preview, evaluate the selected employee's working
// hours as well as their role. Previously this preview ignored shift restrictions.
export function effectiveDemoAccess(signedInUser, previewEmployee=null, at=new Date()) {
  const signedIn=employeeAccess(signedInUser,at);
  const preview=previewEmployee ? employeeAccess(previewEmployee,at) : null;
  return {allowed:signedIn.allowed && (!preview || preview.allowed),signedIn,preview};
}
