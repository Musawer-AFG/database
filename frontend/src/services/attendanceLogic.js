import { afghanDateOrder } from './business.js';
export const ATTENDANCE_OPTIONS=[
  {value:'present',label:'حاضر'},
  {value:'late',label:'تأخیر'},
  {value:'absent',label:'غایب'},
  {value:'off',label:'رخصتی'},
];
export const attendanceKey=(year,month,day)=>`${year}/${String(month).padStart(2,'0')}/${String(day).padStart(2,'0')}`;
export const attendanceDays=(year,month)=>month<=6?31:month===12? (year%33===1||year%33===5||year%33===9||year%33===13||year%33===17||year%33===22||year%33===26||year%33===30 ? 30:29):30;
export function recordAttendance(rows=[],employeeId,date,status,notes='') {
  if(!afghanDateOrder(date)) throw Error('تاریخ معتبر انتخاب کنید.');
  if(!employeeId) throw Error('کارمند انتخاب کنید.');
  if(status && !ATTENDANCE_OPTIONS.some(s=>s.value===status)) throw Error('وضعیت حاضری معتبر نیست.');
  const others=rows.filter(row=>!(String(row.employeeId)===String(employeeId)&&row.date===date));
  if(!status) return others;
  return [...others,{id:`${employeeId}-${date}`,employeeId:String(employeeId),date,status,notes:String(notes||'').slice(0,220)}];
}
export function attendanceTotals(rows=[],employeeIds=[],year,month) {
  const ids=new Set(employeeIds.map(String));
  const values={present:0,late:0,absent:0,off:0};
  for(const row of rows) if(ids.has(String(row.employeeId))&&row.date?.startsWith(`${year}/${String(month).padStart(2,'0')}/`)&&Object.hasOwn(values,row.status)) values[row.status]++;
  return values;
}

// Calculates Afghanistan's calendar weekday without relying on the user's device time zone.
// Friday = day 5 in JavaScript. Search Gregorian noon dates by their Solar Hijri parts.
const persianKabul=new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn',{
  timeZone:'Asia/Kabul',year:'numeric',month:'numeric',day:'numeric'
});
const weekdayCache=new Map();
function dateNumber(timestamp){
  const parts=Object.fromEntries(persianKabul.formatToParts(timestamp).map(p=>[p.type,p.value]));
  return Number(parts.year)*10000+Number(parts.month)*100+Number(parts.day);
}
export function afghanWeekday(value){
  const valueNumber=afghanDateOrder(value);
  if(!valueNumber)return null;
  if(weekdayCache.has(valueNumber))return weekdayCache.get(valueNumber);
  const year=Math.floor(valueNumber/10000);
  const start=Date.UTC(year+621,2,17,12);
  let low=0,high=370;
  while(low<=high){
    const middle=Math.floor((low+high)/2);
    const d=start+middle*86400000;
    const number=dateNumber(d);
    if(number===valueNumber){
      const weekday=new Date(d).getUTCDay();
      weekdayCache.set(valueNumber,weekday);
      return weekday;
    }
    if(number<valueNumber)low=middle+1;
    else high=middle-1;
  }
  return null;
}
export const isAfghanFriday=value=>afghanWeekday(value)===5;
export function afghanKabulToday(date=new Date()){
  const parts=Object.fromEntries(persianKabul.formatToParts(date).map(p=>[p.type,p.value]));
  return attendanceKey(Number(parts.year),Number(parts.month),Number(parts.day));
}
// Default presence is a *provisional assumption*, not verified proof of attendance.
// A manager's explicitly recorded status always wins, including work performed on Friday.
export function resolvedAttendance(record,date,today=afghanKabulToday(),employee={}){
  const order=afghanDateOrder(date);
  if(!order)return {status:'',automatic:false};
  const started=afghanDateOrder(employee.startDate);
  const ended=afghanDateOrder(employee.endDate);
  if((started&&order<started)||(ended&&order>ended)||employee.status==='غیرفعال')return {status:'',automatic:false};
  if(record?.status)return {...record,automatic:false};
  if(isAfghanFriday(date))return {status:'off',automatic:true,notes:'جمعه — رخصتی عمومی'};
  if(order<=afghanDateOrder(today))return {status:'present',automatic:true,notes:'حاضر به شکل خودکار؛ نیازمند تأیید مسوول'};
  return {status:'',automatic:false};
}
export function attendanceOverview(rows=[],employees=[],year,month,today=afghanKabulToday()){
  const byKey=new Map(rows.map(r=>[`${r.employeeId}|${r.date}`,r]));
  const totals={present:0,late:0,absent:0,off:0};
  const expanded=[];
  for(const employee of employees){
    for(let day=1;day<=attendanceDays(year,month);day++){
      const date=attendanceKey(year,month,day);
      const result=resolvedAttendance(byKey.get(`${employee.id}|${date}`),date,today,employee);
      if(!result.status)continue;
      totals[result.status]++;
      expanded.push({employeeId:String(employee.id),employeeName:[employee.firstName,employee.lastName].filter(Boolean).join(' '),date,status:result.status,automatic:result.automatic,notes:result.notes||''});
    }
  }
  return {totals,rows:expanded};
}

// Calendar selectors may be Gregorian, but persisted attendance dates stay Shamsi.
// Conversion is provided by the caller to keep this module free of UI dependencies.
export function attendanceOverviewForDates(rows=[],employees=[],dates=[],today=afghanKabulToday()){
  const byKey=new Map(rows.map(r=>[`${r.employeeId}|${r.date}`,r]));
  const totals={present:0,late:0,absent:0,off:0},expanded=[];
  for(const employee of employees)for(const date of dates){
    const result=resolvedAttendance(byKey.get(`${employee.id}|${date}`),date,today,employee);
    if(!result.status)continue;
    totals[result.status]++;
    expanded.push({employeeId:String(employee.id),employeeName:[employee.firstName,employee.lastName].filter(Boolean).join(' '),date,status:result.status,automatic:result.automatic,notes:result.notes||''});
  }
  return {totals,rows:expanded};
}
