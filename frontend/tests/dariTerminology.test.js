import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, relative } from 'node:path';
import { AFGHAN_MONTHS, afghanDateOrder } from '../src/services/business.js';
const root=fileURLToPath(new URL('../src/',import.meta.url));
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)): /\.(js|jsx)$/.test(e.name)?[join(dir,e.name)]:[]);}
test('application source avoids the audited Iranian-style UI terms',()=>{
 const disallowed=['سامانه','سود','تراکنش','بارگذاری','ویرایش','نام کاربری','فروشگاه','پیش‌نمایش','سرفصل','بدهکار','بستانکار','هزینه'];
 for(const path of files(root)){
  const text=readFileSync(path,'utf8');
  for(const term of disallowed) assert.ok(!text.includes(term),`${relative(root,path)} contains ${term}`);
 }
});
test('Afghan month labels are displayed while historical Iranian aliases remain readable',()=>{
 assert.deepEqual(AFGHAN_MONTHS,['حمل','ثور','جوزا','سرطان','اسد','سنبله','میزان','عقرب','قوس','جدی','دلو','حوت']);
 assert.equal(afghanDateOrder('01 فروردین 1405'),afghanDateOrder('01 حمل 1405'));
});

test('original payroll wording remains visible in the navigation, page and help',()=>{
 const text=readFileSync(join(root,'App.jsx'),'utf8');
 assert.ok(text.includes('id: "payroll", label: "معاشات و دستمزد"'));
 assert.ok(text.includes('PageHeading title="معاشات و دستمزد"'));
 assert.ok(text.includes('title:"معاشات و دستمزد", icon:Wallet, target:"payroll"'));
});

 test('frontend demo keeps Afghan journal, ledger and Sarraf navigation',()=>{
 const text=readFileSync(join(root,'App.jsx'),'utf8');
 for(const word of ['روزنامچه','کهاته','صراف']) assert.ok(text.includes(word),word);
});
