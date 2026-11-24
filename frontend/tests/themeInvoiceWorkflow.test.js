import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {newExtraExpense,validateExtras,normalizeExtraExpenses} from '../src/services/invoiceExtras.js';
import {convertInvoiceToAfn} from '../src/utils/currency.js';
const jsx=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles/theme.css',import.meta.url),'utf8');
const invoice=jsx.slice(jsx.indexOf('function InvoiceForm('),jsx.indexOf('function JournalForm('));

test('customer and supplier shortcut opens complete entity form and keeps unfinished invoice',()=>{
  assert.match(jsx,/function createPartyFromInvoice\(key\)/);
  assert.match(jsx,/setInvoicePartyReturn\(\{invoiceType:modal\.invoiceType, originPage:page, entityKey:key\}\)/);
  assert.match(jsx,/setModal\(\{type:'entity',key\}\)/);
  assert.match(jsx,/function cancelEntityForm\(/);
  assert.match(jsx,/setInvoiceForm\(prev=>\(\{\.\.\.prev,party:String\(entry\.name\|\|''\)\.trim\(\)\}\)\)/);
  assert.match(invoice,/onClick=\{onCreateCustomer\}/);
  assert.match(invoice,/onClick=\{onCreateSupplier\}/);
  assert.ok(!invoice.includes('setNewCustomer'));
  assert.ok(!invoice.includes('setNewSupplier'));
});

test('exchange rate only renders when USD or PKR selected and preserves pending draft',()=>{
  assert.match(invoice,/currency!==\s*'AFN'\s*&&\s*<div className="invoice-fx-box"/);
  assert.match(invoice,/\{quoteLabel\(currency\)\} = چند افغانی/);
  assert.match(invoice,/setPendingFx\(\{sourceCurrency:currency/);
  assert.match(invoice,/pendingFx\.sourceRate\/rate/);
  assert.ok(!invoice.includes('۱ USD = چند AFN؟'));
  assert.ok(!invoice.includes('۱ PKR = چند AFN؟'));
});

test('extra expenses use a description input with a positive amount, no preset dropdown',()=>{
  const fresh=newExtraExpense();
  assert.equal(fresh.type,'other');
  assert.match(validateExtras([{...fresh, amount:100}]),/نام یا شرح/);
  assert.equal(validateExtras([{...fresh,description:'کرایه موتر',amount:100}]),'');
  const saved=normalizeExtraExpenses([{...fresh,description:'کرایه موتر',amount:100}],amount=>amount*70);
  assert.equal(saved[0].amount,7000);
  assert.equal(saved[0].description,'کرایه موتر');
  assert.match(invoice,/نام و شرح مصرف/);
  assert.ok(!invoice.includes('<select value={extra.type'));
  const converted=convertInvoiceToAfn([{product:'برنج',quantity:2,price:100}],0,'USD',{USD:70},[{...fresh,description:'کرایه موتر',amount:20}]);
  assert.equal(converted.total,15400);
});

test('theme accent, hover, focus and dark surfaces styled for all colors',()=>{
  for(const name of ['blue','violet','green']) assert.match(css,new RegExp(`data-theme="dark"\\]\\[data-accent="${name}"`));
  for(const selector of ['.shortcut:hover','.side-nav-link:hover','.icon-btn:hover','.btn.primary:hover','.sidebar-brand .brand-mark','input:focus','.modal-body','.sidebar-year-menu'])
    assert.ok(css.includes(selector),selector);
  assert.match(css,/prefers-reduced-motion:no-preference/);
});
