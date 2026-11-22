import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
 initialAccess,normalizeAccess,canDo,saveUserRecord,saveRoleRecord,
 ENTITY_ACTION_PERMISSION,INVOICE_PERMISSIONS,PRIVILEGED_ACTION_KEYS
} from '../src/services/accessControl.js';

test('admin can edit and delete every record type',()=>{
 const access=initialAccess();
 for(const type of Object.values(INVOICE_PERMISSIONS)) {
   assert.ok(canDo(access,'admin-user',type.edit));
   assert.ok(canDo(access,'admin-user',type.delete));
 }
 for(const type of Object.values(ENTITY_ACTION_PERMISSION)) {
   assert.ok(canDo(access,'admin-user',type.edit));
   assert.ok(canDo(access,'admin-user',type.delete));
 }
});
test('employees may create routine records but never edit/delete old records by default',()=>{
 for(const roleId of ['seller','accountant','keeper','viewer']) {
   const access=saveUserRecord(initialAccess(),{name:'کارمند',roleId});
   const id=access.users.at(-1).id;
   for(const key of PRIVILEGED_ACTION_KEYS) assert.equal(canDo(access,id,key),false,`${roleId} unexpected ${key}`);
 }
 const seller=saveUserRecord(initialAccess(),{name:'احمد',roleId:'seller'});
 const sid=seller.users.at(-1).id;
 assert.equal(canDo(seller,sid,'sales.manage'),true); // creation remains possible
 assert.equal(canDo(seller,sid,'sales.delete'),false);
 assert.equal(canDo(seller,sid,'sales.edit'),false);
});
test('administrator can grant a single employee a single exceptional permission then revoke it',()=>{
 let a=initialAccess();
 a=saveUserRecord(a,{name:'احمد',roleId:'seller',grants:['sales.edit','invalid','roles.manage']});
 a=saveUserRecord(a,{name:'فاطمه',roleId:'seller'});
 const ahmad=a.users.at(-2),fatima=a.users.at(-1);
 assert.deepEqual(ahmad.grants,['sales.edit']);
 assert.equal(canDo(a,ahmad.id,'sales.edit'),true);
 assert.equal(canDo(a,ahmad.id,'sales.delete'),false);
 assert.equal(canDo(a,fatima.id,'sales.edit'),false);
 a=normalizeAccess(a);
 assert.equal(canDo(a,ahmad.id,'sales.edit'),true,'grants survive reload');
 a=saveUserRecord(a,{id:ahmad.id,name:ahmad.name,roleId:'seller',grants:[]});
 assert.equal(canDo(a,ahmad.id,'sales.edit'),false,'admin can revoke grants');
});
test('role-wide edit permission remains separate from account-specific override',()=>{
 let a=saveUserRecord(initialAccess(),{name:'کارمند',roleId:'accountant'});
 const id=a.users.at(-1).id;
 a=saveRoleRecord(a,{id:'accountant',name:'حسابدار',permissions:[...a.roles.find(r=>r.id==='accountant').permissions,'accounting.delete']});
 assert.equal(canDo(a,id,'accounting.delete'),true);
 assert.equal(canDo(a,id,'payroll.delete'),false);
});
test('employee cannot become the protected administrator by role assignment',()=>{
 const a=initialAccess();
 assert.throws(()=>saveUserRecord(a,{name:'مهاجم',roleId:'admin'}),/مدیر/);
 const raw={...a,users:[...a.users,{id:'user-z',name:'کارمند',roleId:'admin'}]};
 assert.equal(normalizeAccess(raw).users.some(x=>x.id==='user-z'),false);
});
test('record CRUD and invoice edit/delete UI use separate permissions',()=>{
 const code=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.ok(code.includes("ENTITY_ACTION_PERMISSION[page]?.edit"));
 assert.ok(code.includes("ENTITY_ACTION_PERMISSION[page]?.delete"));
 assert.ok(code.includes("INVOICE_PERMISSIONS[existing.type]?.delete"));
 assert.ok(code.includes("INVOICE_PERMISSIONS[modal.invoiceType]?.[editingInvoice?'edit':'create']"));
 assert.ok(code.includes('اجازه‌های اختصاصی برای همین کارمند'));
 assert.ok(code.includes('function openEditInvoice(invoice)'));
 assert.ok(code.includes('onEdit={can(INVOICE_PERMISSIONS['));
});
