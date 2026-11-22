import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {convertInvoiceToAfn} from '../src/utils/currency.js';
import {totalExtras,validateExtras,normalizeExtraExpenses,newExtraExpense} from '../src/services/invoiceExtras.js';
import {inventoryState,DEFAULT_WAREHOUSE} from '../src/services/business.js';
const line=(quantity,price,discount=0)=>({product:'برنج',quantity,price,discount});

test('USD purchase includes truck freight and customs at per-bill rate',()=>{
  const expenses=[{id:'truck',type:'transport',description:'کرایه لاری',amount:20},{id:'customs',type:'customs',amount:5}];
  const invoice=convertInvoiceToAfn([line(10,100)],200,'USD',{USD:70,PKR:0},expenses);
  assert.equal(invoice.rate,70);
  assert.equal(invoice.lineSubtotal,70000);
  assert.equal(invoice.extraExpensesTotal,1750);
  assert.equal(invoice.total,71750);
  assert.equal(invoice.paid,14000);
  assert.equal(invoice.balance,57750);
  assert.equal(invoice.foreignTotal,1025);
  assert.equal(invoice.extraExpenses[0].sourceAmount,20);
  assert.equal(invoice.extraExpenses[0].amount,1400);
  assert.equal(invoice.extraExpenses[1].amount,350);
});

test('PKR bill uses its own conversion rate, not global settings',()=>{
  const purchase=convertInvoiceToAfn([line(100,200)],0,'PKR',{PKR:.25},[{id:'truck',type:'transport',amount:1000}]);
  assert.equal(purchase.total,5250);
  const second=convertInvoiceToAfn([line(100,200)],0,'PKR',{PKR:.24},[{id:'truck',type:'transport',amount:1000}]);
  assert.equal(second.total,5040);
});

test('AFN invoices still work without any USD or PKR rates',()=>{
  const invoice=convertInvoiceToAfn([line(2,300)],0,'AFN',{},[]);
  assert.equal(invoice.total,600);
  assert.equal(invoice.extraExpensesTotal,0);
  assert.equal(invoice.balance,600);
});

test('invalid or incomplete extra charges cannot be saved',()=>{
  assert.match(validateExtras([{type:'transport',amount:''}]),/مبلغ/);
  assert.match(validateExtras([{type:'transport',amount:-1}]),/مبلغ/);
  assert.match(validateExtras([{type:'transport',amount:'unreadable'}]),/مبلغ/);
  assert.match(validateExtras([{type:'unknown',amount:2}]),/مبلغ/);
  assert.equal(validateExtras([{type:'loading',amount:'12.50'}]),'');
  assert.equal(totalExtras([{amount:'10.50'},{amount:'2.25'}]),12.75);
  assert.equal(newExtraExpense().type,'other');
});

test('item total includes extra expenses while stock quantity only uses items',()=>{
  const product={id:1,name:'برنج',quantity:0,cost:100,warehouseId:DEFAULT_WAREHOUSE};
  const converted=convertInvoiceToAfn([line(10,250)],0,'AFN',{},[{id:1,type:'transport',amount:250}]);
  const records={products:[product],invoices:[{id:5,number:1,type:'purchase',warehouseId:DEFAULT_WAREHOUSE,items:converted.items.map(i=>({...i,productId:1})),total:converted.total,extraExpensesTotal:converted.extraExpensesTotal}],stockMovements:[]};
  assert.equal(converted.total,2750);
  assert.equal(inventoryState(records).total(1),10);
});

test('frontend retains customer/supplier/product creation features and national ID fields',()=>{
  const source=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  for(const marker of ['createPartyFromInvoice','createPartyFromInvoice','quickCreatePurchaseProduct','tazkiraIssuePlace','نمبر تذکره','مصارف اضافی بل','ثبت محصول جدید در همین بل','مشتری در فهرست نیست؟']) assert.ok(source.includes(marker),marker);
  const settings=source.split('function SettingsPage(')[1].split('function ProfilePage(')[0];
  assert.ok(!settings.includes('نرخ تبدیل به افغانی'));
  assert.ok(!settings.includes('setRates('));
});

test('theme controls and dark styles exist',()=>{
  const jsx=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
  const css=fs.readFileSync(new URL('../src/styles/theme.css',import.meta.url),'utf8');
  assert.match(jsx,/UI_THEME_KEY/);
  assert.match(jsx,/ThemeSettingsControls/);
  assert.doesNotMatch(jsx,/themeMenuOpen/);
  assert.match(css,/\[data-theme="dark"\]/);
  assert.match(css,/data-accent="violet"/);
});
