import test from 'node:test';
import assert from 'node:assert/strict';
import {describeSettingsChanges,DESTRUCTIVE_SETTINGS_ACTIONS} from '../src/settingsSecurity.js';
import {makeDemoCredential,verifyDemoCredential} from '../src/demoAuth.js';

const original={shopName:'عمده فروشی کابل',shopLogo:'',fiscalYear:1405,rates:{USD:70,PKR:0.25}};
test('settings preview lists only settings being changed',()=>{
 assert.deepEqual(describeSettingsChanges(original,{...original}),[]);
 assert.deepEqual(describeSettingsChanges(original,{...original,shopName:'عمده فروشی بلخ'}),['تغییر نام عمده‌فروشی']);
 assert.deepEqual(describeSettingsChanges(original,{...original,shopLogo:'data:image/png;base64,xyz'}),['افزودن یا تغییر لوگوی عمده‌فروشی']);
 assert.deepEqual(describeSettingsChanges(original,{...original,fiscalYear:1404}),['تغییر سال مالی از 1405 به 1404']);
 assert.deepEqual(describeSettingsChanges(original,{...original,rates:{USD:75,PKR:0.25}}),['تغییر نرخ تبدیل USD به افغانی']);
 assert.equal(describeSettingsChanges(original,{...original,shopName:'عمده فروشی بلخ',rates:{USD:75,PKR:0.5}}).length,3);
});
test('dangerous actions describe lost records before password entry',()=>{
 for(const k of ['clearTransactions','resetBusiness']) {
  const action=DESTRUCTIVE_SETTINGS_ACTIONS[k];
  assert.ok(action.title);
  assert.ok(action.details.length>=3);
  assert.ok(action.details.some(x=>x.includes('برگشت')));
 }
});
test('administrator password verification denies incorrect password',async()=>{
 const admin=await makeDemoCredential('CorrectAdminPassword123');
 assert.equal(await verifyDemoCredential('BadPassword',admin),false);
 assert.equal(await verifyDemoCredential('CorrectAdminPassword123',admin),true);
});
