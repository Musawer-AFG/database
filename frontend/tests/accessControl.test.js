import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initialAccess, normalizeAccess, canDo, canOpenPage, saveRoleRecord, removeRoleRecord,
  saveUserRecord, removeUserRecord, ALL_PERMISSION_KEYS
} from '../src/services/accessControl.js';
import { financialYearRecordCount, financialYearOptions } from '../src/services/dashboardMetrics.js';

test('protected main admin retains all permissions',()=>{
  const access=initialAccess();
  assert.equal(access.roles[0].id,'admin');
  for(const permission of ALL_PERMISSION_KEYS) assert.equal(canDo(access,'admin-user',permission),true);
  assert.equal(canOpenPage(access,'admin-user','roles'),true);
});
test('seller has limited menus and cannot record payroll or edit accounting',()=>{
  const a=saveUserRecord(initialAccess(),{name:'احمد',title:'فروشنده',roleId:'seller'});
  const u=a.users.at(-1);
  assert.equal(canOpenPage(a,u.id,'sales'),true);
  assert.equal(canDo(a,u.id,'sales.collect'),true);
  assert.equal(canOpenPage(a,u.id,'payroll'),false);
  assert.equal(canDo(a,u.id,'payroll.pay'),false);
  assert.equal(canOpenPage(a,u.id,'roles'),false);
  assert.equal(canDo(a,u.id,'accounting.manage'),false);
  assert.equal(canOpenPage(a,u.id,'unknownPage'),false);
});
test('admin can create, rename, change permissions and assign roles to staff',()=>{
  let a=initialAccess();
  a=saveRoleRecord(a,{name:'معاون',permissions:['sales.view']});
  const id=a.roles.at(-1).id;
  a=saveUserRecord(a,{name:'فاطمه',roleId:id,title:'معاون فروش'});
  const userId=a.users.at(-1).id;
  assert.equal(canOpenPage(a,userId,'sales'),true);
  assert.equal(canDo(a,userId,'sales.manage'),false);
  a=saveRoleRecord(a,{id,name:'سرپرست',permissions:['sales.view','sales.manage']});
  assert.equal(canDo(a,userId,'sales.manage'),true);
  assert.equal(a.roles.find(r=>r.id===id).name,'سرپرست');
  a=saveUserRecord(a,{id:userId,name:'فاطمه',title:'حسابدار',roleId:'accountant'});
  assert.equal(canDo(a,userId,'accounting.manage'),true);
});
test('role removal preserves assigned users and protects system admin',()=>{
  let a=initialAccess();
  a=saveUserRecord(a,{name:'سارا',roleId:'viewer'});
  assert.throws(()=>removeRoleRecord(a,'viewer'),/کاربران/);
  assert.throws(()=>removeRoleRecord(a,'admin'),/قابل حذف/);
  assert.throws(()=>removeUserRecord(a,'admin-user'),/قابل حذف/);
  a=removeUserRecord(a,a.users.at(-1).id);
  a=removeRoleRecord(a,'viewer');
  const normalized=normalizeAccess(a);
  assert.equal(normalized.roles.some(r=>r.id==='viewer'),false,'deleted preset must stay deleted');
  assert.equal(normalized.roles.some(r=>r.id==='admin'),true);
});
test('normalizer filters unknown permissions and forbids overwriting system role',()=>{
  const a=normalizeAccess({roles:[{id:'admin',name:'مخرب',permissions:[]},{id:'temp',name:'آزمایشی',permissions:['sales.view','root']},{id:'temp',name:'تکراری',permissions:[]}],users:[{id:'admin-user',name:'مدیر',roleId:'temp'}]});
  assert.equal(a.roles[0].name,'مدیر سیستم');
  assert.equal(a.users[0].roleId,'admin');
  assert.deepEqual(a.roles.find(r=>r.id==='temp').permissions,['sales.view']);
});
test('empty financial year has zero records; existing years count Afghan named dates and payroll periods',()=>{
  const data={invoices:[{date:'10 حمل 1405',type:'sale'},{date:'۱۴۰۳/۰۸/۱۳',type:'purchase'}],expenses:[{date:'1404/02/01'}],payroll:[{year:1402,month:6}]};
  assert.equal(financialYearRecordCount(data,1405),1);
  assert.equal(financialYearRecordCount(data,1404),1);
  assert.equal(financialYearRecordCount(data,1402),1);
  assert.equal(financialYearRecordCount(data,1399),0);
  assert.equal(financialYearOptions(data,1405).includes(1402),true);
});
