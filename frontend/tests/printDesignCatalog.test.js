import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {normalizeDocumentDesign,resolveDocumentDesign} from '../src/utils/documentDesigns.js';
import {describeSettingsChanges} from '../src/services/settingsSecurity.js';
import {updateInvoiceLine,refreshCatalogPrices} from '../src/services/catalogPricing.js';
import {contractSnapshot} from '../src/services/customerContracts.js';
import {invoicePrintHtml,contractPrintHtml} from '../src/utils/invoicePrint.js';
const shopLogo='data:image/png;base64,AAAA',billLogo='data:image/png;base64,BBBB',contractLogo='data:image/png;base64,CCCC';
const prefs={shopName:'فروشگاه نمونه',shopLogo,billDesign:{color:'#165f4c',logo:billLogo,logoMode:'custom'},contractDesign:{color:'#574180',logo:contractLogo,logoMode:'custom'}};
const bill={type:'sale',number:1,date:'1405/08/28',items:[],total:100,paid:50,balance:50};
const customer={name:'مشتری نمونه',saleContract:{enabled:true,percent:50,days:28,terms:'مهلت توافقی',guarantorScan:{id:'private-scan-test',name:'private-file-test.pdf',mime:'application/pdf'}}};
test('designs resolve independently; shop fallback, no-logo mode and validation work',()=>{
 assert.deepEqual(resolveDocumentDesign(prefs,'bill'),{color:'#165f4c',logo:billLogo});
 assert.deepEqual(resolveDocumentDesign(prefs,'contract'),{color:'#574180',logo:contractLogo});
 assert.equal(resolveDocumentDesign({shopLogo},'bill').logo,shopLogo);
 assert.equal(resolveDocumentDesign({...prefs,billDesign:{logoMode:'none'}},'bill').logo,'');
 assert.equal(normalizeDocumentDesign({color:'red',logo:'javascript:bad',logoMode:'bad'}).logo,'');
});
test('design changes are recognized by password-protected settings confirmation',()=>{
 assert.equal(describeSettingsChanges(prefs,prefs).length,0);
 assert.deepEqual(describeSettingsChanges(prefs,{billDesign:{...prefs.billDesign,color:'#333333'}}),['تغییر طرح چاپ بل‌های فروش و خرید']);
 assert.deepEqual(describeSettingsChanges(prefs,{contractDesign:{...prefs.contractDesign,logoMode:'none'}}),['تغییر طرح چاپ قرارداد مشتریان']);
});
test('actual bill and contract HTML uses independent designs and never includes the guarantor attachment',()=>{
 const snapshot=contractSnapshot(customer,prefs,bill);assert.equal(snapshot.guarantorScan,undefined);assert.equal(snapshot.guarantorCopy,true);
 const html=invoicePrintHtml({...bill,saleContract:snapshot},{},prefs);const contract=contractPrintHtml(snapshot,bill,'shamsi',prefs);
 assert.ok(html.includes(billLogo));assert.ok(html.includes('#165f4c'));assert.ok(!html.includes(contractLogo));
 assert.ok(contract.includes(contractLogo));assert.ok(contract.includes('#574180'));assert.ok(!contract.includes(billLogo));
 for(const text of [html,contract,JSON.stringify(snapshot)]){assert.ok(!text.includes('private-scan-test'));assert.ok(!text.includes('private-file-test.pdf'));}
 assert.ok(contractPrintHtml(snapshot,bill,'shamsi',{...prefs,contractDesign:{logoMode:'none',color:'#333333'}}).includes('#333333'));
 assert.ok(!contractPrintHtml(snapshot,bill,'shamsi',{...prefs,contractDesign:{logoMode:'none',color:'#333333'}}).includes(contractLogo));
});
test('editing a customer agreement does not modify historical payment terms',()=>{
 const record=structuredClone(customer);const original=contractSnapshot(record,prefs,bill);record.saleContract.percent=35;record.saleContract.terms='توافق جدید';
 assert.equal(contractSnapshot(record,prefs,bill).percent,35);assert.equal(original.percent,50);assert.equal(original.terms,'مهلت توافقی');
});
const products=[{name:'برنج',price:'7000',cost:'6000'},{name:'آرد',price:3500},{name:'رایگان',price:0}];
test('sale catalog pricing autofills, switches products, converts currencies, retains manual overrides',()=>{
 const rice=updateInvoiceLine({quantity:1},'product','برنج','sale',products,1);assert.equal(rice.price,'7000');
 assert.equal(updateInvoiceLine(rice,'product','آرد','sale',products,1).price,'3500');
 assert.equal(refreshCatalogPrices([rice],70)[0].price,'100');assert.equal(refreshCatalogPrices([rice],.25)[0].price,'28000');
 const manual=updateInvoiceLine(rice,'price','6500','sale',products,1);assert.equal(refreshCatalogPrices([manual],70)[0].price,'6500');
 assert.equal(updateInvoiceLine(rice,'product','missing','sale',products,1).price,'');
 assert.equal(updateInvoiceLine({},'product','رایگان','sale',products,1).price,'0');
 const waiting=updateInvoiceLine({},'product','برنج','sale',products,0);assert.equal(waiting.price,'');assert.equal(refreshCatalogPrices([waiting],70)[0].price,'100');
 assert.equal(updateInvoiceLine({price:'450'},'product','برنج','purchase',products,1).price,'450');
});
test('new settings and customer editor are connected, journal lines keep generic editor',()=>{
 const src=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 for(const token of ['<DocumentDesignSettings kind="bill"','<DocumentDesignSettings kind="contract"','onSave({[field]:normalizeDocumentDesign(draft)})','سکن تذکره تضمین‌کننده (داخلی)','ویرایش قرارداد','updateInvoiceLine(item,key,value,type,data.products,currentRate)']) assert.ok(src.includes(token),token);
 assert.ok(!src.slice(src.indexOf('function JournalForm(')).includes('updateInvoiceLine('));
 assert.ok(!src.includes('customer-contract-logo'));
});

test('both print settings always render their upload control and automatically select the uploaded logo',()=>{
 const src=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 const section=src.slice(src.indexOf('function DocumentDesignSettings('),src.indexOf('function ProfilePage('));
 assert.ok(section.includes('بارگذاری لوگوی بل‌های فروش و خرید'));
 assert.ok(section.includes('بارگذاری لوگوی قرارداد'));
 assert.ok(section.includes('<BusinessLogoPicker inputId={`print-logo-${kind}`}'));
 assert.ok(!section.includes("draft.logoMode==='custom'&&<BusinessLogoPicker"));
 assert.ok(section.includes('onChange={setPrintLogo}'));
 assert.ok(section.includes("logoMode:logo?'custom':preferences.shopLogo?'shop':'none'"));
 assert.ok(section.includes('پیش‌نمایش سربرگ چاپ'));
});
test('sales and purchase print headers use the chosen bill logo; all contract prints use the chosen contract logo',()=>{
 for(const type of ['sale','purchase']){
  const html=invoicePrintHtml({...bill,type},{},prefs);
  assert.ok(html.includes(`src="${billLogo}"`));
  assert.ok(!html.includes(contractLogo));
  assert.ok(invoicePrintHtml({...bill,type},{},{...prefs,billDesign:{logoMode:'shop'}}).includes(`src="${shopLogo}"`));
  assert.ok(!invoicePrintHtml({...bill,type},{},{...prefs,billDesign:{logoMode:'none'}}).includes('class="logo"'));
 }
 const snapshot=contractSnapshot(customer,prefs,bill);
 for(const invoice of [null,bill]){
  assert.ok(contractPrintHtml(snapshot,invoice,'shamsi',prefs).includes(`src="${contractLogo}"`));
  assert.ok(contractPrintHtml(snapshot,invoice,'shamsi',{...prefs,contractDesign:{logoMode:'shop'}}).includes(`src="${shopLogo}"`));
  assert.ok(!contractPrintHtml(snapshot,invoice,'shamsi',{...prefs,contractDesign:{logoMode:'none'}}).includes('class="logo"'));
 }
});
