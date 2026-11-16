import test from 'node:test';
import assert from 'node:assert/strict';
import { quickSearch,transactionsForDay } from '../src/headerTools.js';
import { createRecoveryCode, createRecoveryRecord, verifyRecoveryCode } from '../src/demoRecovery.js';
import { initialAccess, setRecoveryRecord, setAccountPassword, normalizeAccess } from '../src/accessControl.js';
import { makeDemoCredential } from '../src/demoAuth.js';
const data={
  products:[{id:'p1',name:'برنج هرات',code:'ABC11'}],
  customers:[{id:'c1',name:'احمد',phone:'0791234567'}],
  suppliers:[{id:'s1',name:'شرکت بلخ'}],
  employees:[{id:'e1',firstName:'حمید',lastName:'اکبری',position:'فروشنده'}],
  warehouses:[{id:'w1',name:'گدام مرکزی'}],
  invoices:[{id:'i1',type:'sale',party:'احمد',title:'بل فروش ۱۹',date:'1405/08/25',total:2500},
    {id:'i2',type:'purchase',party:'شرکت بلخ',title:'خرید برنج',date:'1405/08/25',total:3200}],
  expenses:[{id:'x1',date:'1405/08/25',description:'کرایه گدام',amount:200}],
  journals:[],
};
test('global search finds products and matches Iranian/Arabic letter variants',()=>{
  const access=initialAccess();
  assert.equal(quickSearch(data,'برنج',access,'admin-user').length,2);
  assert.equal(quickSearch(data,'احمد',access,'admin-user').length,2);
  assert.equal(quickSearch(data,'078',access,'admin-user').length,0);
  assert.equal(quickSearch(data,'0791234',access,'admin-user')[0].page,'customers');
  assert.equal(quickSearch(data,'کَری',access,'admin-user').length,0);
});
test('quick search checks permissions before showing hits',()=>{
  const access=initialAccess();
  access.users.push({id:'test',name:'Test',roleId:'seller',active:true,username:'seller'});
  const items=quickSearch(data,'حمید',access,'test');
  assert.deepEqual(items,[]);
  assert.equal(quickSearch(data,'برنج',access,'test').some(x=>x.page==='products'),true);
});
test('calendar matches Afghan dates regardless of format',()=>{
  const rows=transactionsForDay(data,'25 عقرب 1405');
  assert.equal(rows.length,3);
  assert.deepEqual(rows.map(x=>x.page),['sales','purchases','expenses']);
  assert.deepEqual(transactionsForDay(data,'1405/08/26'),[]);
});
test('recovery codes validate and expire and are removed after password change',async()=>{
  const code=createRecoveryCode();
  assert.match(code,/^AF-[A-Z2-9]{4}(-[A-Z2-9]{4}){3}$/);
  const record=await createRecoveryRecord(code,{now:1000,days:1});
  assert.equal('passwordHash' in record,false);
  assert.equal('recoveryHash' in record,true);
  let access=initialAccess();
  access=setRecoveryRecord(access,'admin-user',record);
  const restored=normalizeAccess(access);
  assert.equal(await verifyRecoveryCode(code,restored.users[0],1000+500),true);
  assert.equal(await verifyRecoveryCode('AF-AAAA-AAAA-AAAA-AAAA',restored.users[0],1000+500),false);
  assert.equal(await verifyRecoveryCode(code,restored.users[0],1000+86400001),false);
  const credential=await makeDemoCredential('password124');
  const reset=setAccountPassword(restored,'admin-user',credential);
  assert.equal(await verifyRecoveryCode(code,reset.users[0],1000+500),false);
});
