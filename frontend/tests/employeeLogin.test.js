import test from 'node:test';
import assert from 'node:assert/strict';
import { initialAccess, saveUserRecord, setAccountPassword, normalizeAccess, canDo } from '../src/services/accessControl.js';
import { normalizeUsername, validUsername, proposeUsername, makeTemporaryPassword, makeDemoCredential, verifyDemoCredential } from '../src/services/demoAuth.js';

test('employee selection can propose an easy unique-style login',()=>{
  assert.equal(proposeUsername({id:55,employeeCode:'AHM-12',phone:'0799123456'}),'ahm-12');
  assert.equal(proposeUsername({id:55,employeeCode:'',phone:'0799123456'}),'staff799123456');
  assert.equal(validUsername('ahmad.01'),true);
  assert.equal(validUsername('احمد'),false);
  assert.equal(normalizeUsername(' Ahmad01 '),'ahmad01');
});
test('admin can link an employee and preserve the link and username across reloads',()=>{
  let a=initialAccess();
  a=saveUserRecord(a,{name:'احمد',employeeId:'415',title:'فروشنده',username:'ahmad01',roleId:'seller',active:true});
  const user=a.users.at(-1);
  assert.equal(user.employeeId,'415');
  assert.equal(canDo(a,user.id,'sales.manage'),true);
  assert.throws(()=>saveUserRecord(a,{name:'دیگر',employeeId:'415',username:'ahmad02',roleId:'viewer'}),/قبلاً حساب/);
  assert.throws(()=>saveUserRecord(a,{name:'دیگر',employeeId:'416',username:'ahmad01',roleId:'viewer'}),/تکراری/);
  a=normalizeAccess(JSON.parse(JSON.stringify(a)));
  assert.equal(a.users.find(u=>u.id===user.id).employeeId,'415');
  assert.equal(a.users.find(u=>u.id===user.id).username,'ahmad01');
  a=saveUserRecord(a,{id:user.id,name:'احمد',employeeId:'415',username:'ahmad01',roleId:'viewer',active:false});
  assert.equal(canDo(a,user.id,'sales.view'),false);
});
test('demo credential uses salted PBKDF2, rejects wrong password and preserves first-login reset',async()=>{
  const one=await makeDemoCredential('ExampleTestPass123!');
  const two=await makeDemoCredential('ExampleTestPass123!');
  assert.notEqual(one.passwordSalt,two.passwordSalt);
  assert.notEqual(one.passwordHash,two.passwordHash);
  assert.equal(await verifyDemoCredential('wrong',one),false);
  assert.equal(await verifyDemoCredential('ExampleTestPass123!',one),true);
  let a=initialAccess();
  a=setAccountPassword(a,'admin-user',one,{username:'shopadmin'});
  assert.equal(a.users[0].username,'shopadmin');
  a=saveUserRecord(a,{name:'زهرا',employeeId:'42',username:'zahra42',roleId:'accountant'});
  const employeeId=a.users.at(-1).id;
  a=setAccountPassword(a,employeeId,two,{mustChangePassword:true});
  const restored=normalizeAccess(JSON.parse(JSON.stringify(a)));
  assert.equal(restored.users.at(-1).mustChangePassword,true);
  assert.equal(await verifyDemoCredential('ExampleTestPass123!',restored.users.at(-1)),true);
  assert.throws(()=>saveUserRecord(restored,{name:'test',employeeId:'43',username:'shopadmin',roleId:'seller'}),/تکراری/);
});
test('temporary demo passwords are generated with adequate length',()=>{
  const password=makeTemporaryPassword();
  assert.equal(password.startsWith('Afg-'),true);
  assert.ok(password.length>=12);
});
