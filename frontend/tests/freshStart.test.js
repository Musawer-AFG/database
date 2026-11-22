import test from 'node:test';
import assert from 'node:assert/strict';
import { FRESH_STORAGE_KEYS, validateFirstSetup, clearFreshStorage } from '../src/services/freshSetup.js';
import { initialAccess } from '../src/services/accessControl.js';
import { makeDemoCredential, verifyDemoCredential } from '../src/services/demoAuth.js';

test('fresh setup uses isolated storage keys and does not touch an older prototype', () => {
  const oldKeys=['afghan-wholesale-ui-data','afghan-wholesale-ui-preferences','afghan-wholesale-ui-access'];
  for(const key of Object.values(FRESH_STORAGE_KEYS)) assert.ok(!oldKeys.includes(key));
  const local=new Map([...oldKeys.map(k=>[k,'old-shop-data']),...[FRESH_STORAGE_KEYS.data,FRESH_STORAGE_KEYS.preferences,FRESH_STORAGE_KEYS.access].map(k=>[k,'new-shop-data'])]);
  const session=new Map([[FRESH_STORAGE_KEYS.session,'admin-user']]);
  clearFreshStorage({removeItem:k=>local.delete(k)},{removeItem:k=>session.delete(k)});
  for(const key of oldKeys) assert.equal(local.get(key),'old-shop-data');
  for(const key of [FRESH_STORAGE_KEYS.data,FRESH_STORAGE_KEYS.preferences,FRESH_STORAGE_KEYS.access]) assert.equal(local.has(key),false);
  assert.equal(session.has(FRESH_STORAGE_KEYS.session),false);
});

test('new business setup requires business name, administrator name, username and password', () => {
  const input={shopName:'عمده فروشی کابل',adminName:'احمد احمدی',username:'admin',password:'ExamplePass123',confirmPassword:'ExamplePass123'};
  assert.deepEqual(validateFirstSetup(input),{ok:true,username:'admin',profile:{shopName:input.shopName,adminName:input.adminName}});
  for (const field of ['shopName','adminName']) assert.equal(validateFirstSetup({...input,[field]:''}).ok,false);
  assert.equal(validateFirstSetup({...input,username:'عمده'}).ok,false);
  assert.equal(validateFirstSetup({...input,password:'short'}).ok,false);
  assert.equal(validateFirstSetup({...input,confirmPassword:'different'}).ok,false);
});

test('empty first-run admin can receive salted credentials and authenticate', async () => {
  const fresh=initialAccess('حسابدار','مدیر سیستم');
  assert.equal(fresh.users.length,1);
  assert.equal(fresh.users[0].passwordHash,undefined);
  const credential=await makeDemoCredential('ExamplePass123');
  const admin={...fresh.users[0],...credential,username:'admin',name:'احمد احمدی'};
  assert.equal(await verifyDemoCredential('ExamplePass123',admin),true);
  assert.equal(await verifyDemoCredential('incorrect',admin),false);
});
