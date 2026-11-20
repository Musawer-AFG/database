import { normalizeUsername, validUsername } from './demoAuth.js';
import { recoveryFields, clearRecoveryFields } from './demoRecovery.js';
import { normalizeScheduleFields } from './workHours.js';
// Local-only role-based access for the React client-preview. NOT an authentication/security boundary.
export const PERMISSION_GROUPS = [
  { name:'داشبورد', permissions:[['dashboard.view','دیدن داشبورد']] },
  { name:'بل‌های فروش', permissions:[['sales.view','دیدن بل‌های فروش'],['sales.manage','ایجاد و حذف بل فروش'],['sales.collect','ثبت دریافت پول از مشتری']] },
  { name:'بل‌های خرید و برگشتی', permissions:[['purchases.view','دیدن بل‌های خرید'],['purchases.manage','ایجاد و حذف بل خرید'],['returns.view','دیدن بل‌های برگشتی'],['returns.manage','ایجاد و حذف بل برگشتی']] },
  { name:'گدام', permissions:[['inventory.view','دیدن موجودی و گدام'],['inventory.manage','تغییر محصولات، گدام و انتقال اجناس']] },
  { name:'مشتریان و عرضه‌کنندگان', permissions:[['customers.view','دیدن مشتریان و قرضداری'],['customers.manage','افزودن و ویرایش مشتری و عرضه‌کننده']] },
  { name:'حسابداری', permissions:[['accounting.view','دیدن اسناد و مصارف'],['accounting.manage','ثبت و حذف اسناد و مصارف']] },
  { name:'منابع بشری', permissions:[['employees.view','دیدن کارمندان و حاضری'],['employees.manage','افزودن و ویرایش کارمندان'],['payroll.view','دیدن معاشات'],['payroll.manage','ساخت و حذف برگه معاش'],['payroll.pay','ثبت پرداخت معاش']] },
  { name:'گزارش‌ها', permissions:[['reports.view','دیدن و دریافت گزارش‌ها']] },
  { name:'تنظیمات و مدیریت', permissions:[['settings.view','دیدن تنظیمات'],['settings.manage','ویرایش تنظیمات فروشگاه و سال مالی'],['profile.edit','ویرایش پروفایل شخصی'],['roles.manage','مدیریت نقش‌ها و کاربران']] },
];
export const ALL_PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g=>g.permissions.map(([key])=>key));

export const PAGE_PERMISSION = {
  dashboard:'dashboard.view',sales:'sales.view',purchases:'purchases.view',returns:'returns.view',
  warehouseDashboard:'inventory.view',products:'inventory.view',groups:'inventory.view',warehouses:'inventory.view',
  customersDashboard:'customers.view',customers:'customers.view',debtors:'customers.view',suppliers:'customers.view',
  journal:'accounting.view',accounts:'accounting.view',expenses:'accounting.view',cashRegister:'accounting.view',traderAccounts:'accounting.view',shipments:'purchases.view',
  employees:'employees.view',attendance:'employees.view',payroll:'payroll.view',
  reports:'reports.view',trialBalance:'reports.view',journalReport:'reports.view',ledgerReport:'reports.view',documentReport:'reports.view',profitAnalysis:'reports.view',
  settings:'settings.view',roles:'roles.manage',profile:null,help:null,
};
export const ENTITY_MANAGE_PERMISSION = {
  products:'inventory.manage',groups:'inventory.manage',warehouses:'inventory.manage',
  customers:'customers.manage',suppliers:'customers.manage',
  employees:'employees.manage',accounts:'accounting.manage',
};
export const INVOICE_PERMISSIONS = {
  sale: {view:'sales.view',manage:'sales.manage'},
  purchase: {view:'purchases.view',manage:'purchases.manage'},
  return: {view:'returns.view',manage:'returns.manage'},
};

export const DEFAULT_ROLES = [
  {id:'admin',name:'مدیر سیستم',system:true,permissions:ALL_PERMISSION_KEYS},
  {id:'accountant',name:'حسابدار',permissions:[
    'dashboard.view','sales.view','sales.collect','purchases.view','returns.view',
    'customers.view','inventory.view','accounting.view','accounting.manage',
    'reports.view','employees.view','payroll.view','payroll.manage','payroll.pay','profile.edit',
  ]},
  {id:'seller',name:'فروشنده',permissions:[
    'dashboard.view','sales.view','sales.manage','sales.collect','returns.view','returns.manage',
    'customers.view','customers.manage','inventory.view','profile.edit',
  ]},
  {id:'keeper',name:'مسئول گدام',permissions:[
    'dashboard.view','inventory.view','inventory.manage','purchases.view','purchases.manage','profile.edit',
  ]},
  {id:'viewer',name:'فقط مشاهده',permissions:[
    'dashboard.view','sales.view','purchases.view','returns.view','inventory.view','customers.view','reports.view','profile.edit',
  ]},
];
export function initialAccess(displayName='حسابدار',title='مدیر سیستم') {
  return {
    roles: DEFAULT_ROLES.map(role=>({...role,permissions:[...role.permissions]})),
    users:[{id:'admin-user',name:displayName,title,roleId:'admin',system:true,username:'admin',active:true}],
  };
}
function safeCredential(record) {
  const h=String(record?.passwordHash||'');
  const s=String(record?.passwordSalt||'');
  return /^[0-9a-f]{64}$/.test(h) && /^[0-9a-f]{32}$/.test(s) ? {passwordHash:h,passwordSalt:s}:{};
}
export function normalizeAccess(raw,displayName='حسابدار',title='مدیر سیستم') {
  const defaults=initialAccess(displayName,title);
  if (!raw || typeof raw!=='object') return defaults;
  const roles=[...defaults.roles.filter(r=>r.system)];
  const seen=new Set(roles.map(r=>r.id));
  for (const r of Array.isArray(raw.roles) ? raw.roles : []) {
    if (!r || typeof r.id!=='string' || !r.id.trim() || seen.has(r.id)) continue;
    const name=String(r.name||'').trim().slice(0,60);
    if (!name) continue;
    roles.push({id:r.id,name,permissions:[...new Set((Array.isArray(r.permissions)?r.permissions:[]).filter(k=>ALL_PERMISSION_KEYS.includes(k)))]});
    seen.add(r.id);
  }
  const users=[defaults.users[0]];
  const adminRaw=(Array.isArray(raw.users)?raw.users:[]).find(u=>u?.id==='admin-user');
  if(adminRaw) users[0]={...users[0],name:String(adminRaw.name||displayName).trim().slice(0,60)||displayName,title:String(adminRaw.title||title).trim().slice(0,60)||title,username:validUsername(adminRaw.username)?normalizeUsername(adminRaw.username):'admin',...safeCredential(adminRaw),...recoveryFields(adminRaw),active:true};
  const userIds=new Set(['admin-user']);
  const usernames=new Set([normalizeUsername(users[0].username)]);
  const employeeIds=new Set();
  for(const u of Array.isArray(raw.users) ? raw.users : []) {
    if (!u || typeof u.id!=='string' || !u.id.trim()) continue;
    if (u.id==='admin-user') continue;
    if(userIds.has(u.id) || !seen.has(u.roleId)) continue;
    const name=String(u.name||'').trim().slice(0,60);
    if(!name) continue;
    const username=validUsername(u.username)?normalizeUsername(u.username):'';
    const employeeId=String(u.employeeId||'');
    if(username && usernames.has(username)) continue;
    if(employeeId && employeeIds.has(employeeId)) continue;
    users.push({id:u.id,name,title:String(u.title||'').trim().slice(0,60),roleId:u.roleId,username,employeeId,active:u.active!==false,mustChangePassword:u.mustChangePassword===true,...normalizeScheduleFields(u),...safeCredential(u),...recoveryFields(u)});
    if(username) usernames.add(username);
    if(employeeId) employeeIds.add(employeeId);
    userIds.add(u.id);
  }
  return {roles,users};
}
export function canDo(access,userId,permission) {
  if (!permission) return true;
  if (!ALL_PERMISSION_KEYS.includes(permission)) return false;
  const user=access?.users?.find(u=>u.id===userId);
  if(!user || user.active===false) return false;
  const role=access?.roles?.find(r=>r.id===user.roleId);
  return !!role?.permissions?.includes(permission);
}
export function canOpenPage(access,userId,page) {
  return Object.hasOwn(PAGE_PERMISSION,page) && canDo(access,userId,PAGE_PERMISSION[page]);
}
export function availablePages(access,userId) {
  return Object.keys(PAGE_PERMISSION).filter(page=>canOpenPage(access,userId,page));
}
export function saveRoleRecord(access,record) {
  const name=String(record?.name||'').trim().slice(0,60);
  if(!name) throw Error('نام نقش ضروری است.');
  if(access.roles.some(r=>r.name===name && r.id!==record.id)) throw Error('این نام نقش قبلاً موجود است.');
  if(record.id==='admin') throw Error('نقش مدیر سیستم قابل تغییر نیست.');
  const permissions=[...new Set((record.permissions||[]).filter(k=>ALL_PERMISSION_KEYS.includes(k)))];
  const id=record.id || `role-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  if(access.roles.some(r=>r.id===id && r.system)) throw Error('نقش سیستمی قابل تغییر نیست.');
  const roles=access.roles.some(r=>r.id===id)
    ? access.roles.map(r=>r.id===id?{id,name,permissions}:r)
    : [...access.roles,{id,name,permissions}];
  return {...access,roles};
}
export function removeRoleRecord(access,id) {
  if(id==='admin' || access.roles.find(r=>r.id===id)?.system) throw Error('نقش مدیر سیستم قابل حذف نیست.');
  if(access.users.some(u=>u.roleId===id)) throw Error('ابتدا نقش کاربران مربوط را تغییر دهید.');
  return {...access,roles:access.roles.filter(r=>r.id!==id)};
}
export function saveUserRecord(access,record) {
  const name=String(record?.name||'').trim().slice(0,60);
  if(!name) throw Error('نام کاربر ضروری است.');
  if(!access.roles.some(r=>r.id===record.roleId)) throw Error('یک نقش معتبر انتخاب کنید.');
  if(record.id==='admin-user') throw Error('نقش مدیر اصلی از این بخش قابل تغییر نیست.');
  const id=record.id || `user-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const existing=access.users.find(u=>u.id===id);
  const username=normalizeUsername(record.username || existing?.username);
  if(username && !validUsername(username)) throw Error('نام کاربری باید ۳ تا ۳۲ حرف انگلیسی، عدد، نقطه، - یا _ باشد.');
  if(username && access.users.some(u=>u.id!==id && normalizeUsername(u.username)===username)) throw Error('نام کاربری تکراری است.');
  const employeeId=String(record.employeeId ?? existing?.employeeId ?? '');
  if(employeeId && access.users.some(u=>u.id!==id && String(u.employeeId||'')===employeeId)) throw Error('برای این کارمند قبلاً حساب ساخته شده است.');
  const credential=record.passwordHash ? safeCredential(record) : safeCredential(existing);
  const user={id,name,title:String(record.title||'').trim().slice(0,60),roleId:record.roleId,
    username,employeeId,active:record.active!==false,
    ...normalizeScheduleFields({...existing,...record}),
    mustChangePassword:record.mustChangePassword != null ? !!record.mustChangePassword : !!existing?.mustChangePassword,
    ...credential,...(record.passwordHash ? clearRecoveryFields() : recoveryFields(existing))};
  return {...access,users:existing ? access.users.map(u=>u.id===id?user:u):[...access.users,user]};
}
export function setAccountPassword(access,id,credential,{mustChangePassword=false,username}={}) {
  const user=access.users.find(u=>u.id===id);
  if(!user) throw Error('کاربر یافت نشد.');
  const valid=safeCredential(credential);
  if(!valid.passwordHash) throw Error('رمز معتبر نیست.');
  const candidate=normalizeUsername(username ?? user.username);
  if(!validUsername(candidate)) throw Error('نام کاربری باید حداقل ۳ حرف لاتین داشته باشد.');
  if(access.users.some(u=>u.id!==id&&normalizeUsername(u.username)===candidate)) throw Error('این نام کاربری قبلاً ثبت شده است.');
  return {...access,users:access.users.map(u=>u.id===id?{...u,...valid,...clearRecoveryFields(),username:candidate,mustChangePassword}:u)};
}
export function removeUserRecord(access,id) {
  if(id==='admin-user') throw Error('مدیر اصلی قابل حذف نیست.');
  return {...access,users:access.users.filter(u=>u.id!==id)};
}

export function setRecoveryRecord(access,id,record) {
  const fields=recoveryFields(record);
  if(!fields.recoveryHash || !access.users.some(u=>u.id===id)) throw Error('کد بازیابی معتبر نیست.');
  return {...access,users:access.users.map(u=>u.id===id?{...u,...fields}:u)};
}
