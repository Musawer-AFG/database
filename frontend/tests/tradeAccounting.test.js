import test from 'node:test';
import assert from 'node:assert/strict';
import {createShipment,shipmentCost,convertTradeAmount,createSettlement,applySettlement,partyStatement,profitSummary,averageLandedCosts,buildAccountingJournal} from '../src/services/tradeAccounting.js';
import {cashRegister} from '../src/services/cashRegister.js';

const date='1405/08/25';
function sample(){return {
 products:[{id:1,name:'برنج کبیر',unit:'تن',quantity:0,cost:0,price:0}],
 customers:[{id:2,name:'احمد'}],suppliers:[{id:3,name:'مقرب'}],
 invoices:[{id:'buy1',number:1,date,type:'purchase',party:'مقرب',currency:'USD',exchangeRate:70,items:[{productId:1,product:'برنج کبیر',quantity:25,price:67200,discount:0}],total:1680000,paid:0,balance:1680000,payments:[],extraExpensesTotal:0}],
 expenses:[],payroll:[],cashEntries:[],settlements:[],shipments:[],journals:[]
};}
function shipmentRecord(data){return createShipment({purchaseInvoiceId:'buy1',reference:'کانتنر کبیر',date,containerCount:1,tonnes:25,origin:'بندر عباس',destination:'کابل',costs:[
 {description:'کرایه اول',amount:3284,currency:'USD',rate:70,paid:true},
 {description:'گمرک',amount:2504,currency:'USD',rate:70,paid:false},
 {description:'کرایه کابل',amount:2130,currency:'USD',rate:70,paid:false}
]},data);}
test('owner container sample 25 tonnes and $7,918 charges: no duplicate costs',()=>{
 const data=sample(),shipment=shipmentRecord(data);data.shipments=[shipment];
 const result=shipmentCost(data,shipment);
 assert.equal(result.purchase,1680000);assert.equal(result.additional,554260);assert.equal(result.total,2234260);
 assert.equal(result.perTonne,89370.4);assert.equal(result.paidCharges,229880);
 assert.equal(result.total/70,31918);assert.equal(result.total/(25*70),1276.72);
 assert.notEqual(result.total/(25*70),31918/24);// workbook displayed per-tonne uses /24 despite 25t recorded.
 assert.equal(averageLandedCosts(data).get('1'),89370.4);
 assert.throws(()=>createShipment({purchaseInvoiceId:'buy1',date,containerCount:1,tonnes:25,reference:'dup'},data),/قبلاً/);
});
test('cash movements include PAID shipment costs only; no extra purchase cost in cash until paid',()=>{
 const data=sample();data.shipments=[shipmentRecord(data)];
 const register=cashRegister(data,250000);
 assert.equal(register.balance,20120);
 assert.equal(register.entries.filter(x=>x.category==='مصارف محموله').length,1);
 assert.equal(register.outgoing,229880);
});
test('one linked customer settlement pays the invoice once, and third-party transfer can bypass cash',()=>{
 let data=sample();data.invoices.push({id:'s1',number:1,date,type:'sale',party:'احمد',items:[{productId:1,product:'برنج کبیر',quantity:1,price:1000}],total:1000,paid:0,balance:1000,payments:[]});
 const settlement=createSettlement({partyType:'customer',party:'احمد',kind:'receive',date,amount:10,currency:'USD',rate:70,invoiceId:'s1',viaCash:false,thirdParty:'داکتر آرین'},data);
 data=applySettlement(data,settlement);
 assert.equal(data.invoices.find(x=>x.id==='s1').balance,300);
 assert.equal(data.settlements.length,0);
 assert.equal(partyStatement(data,'customer','احمد').balance,300);
 assert.equal(cashRegister(data,100).balance,100);
 const journal=buildAccountingJournal(data,100);
 assert.equal(journal.filter(x=>x.id.startsWith('auto-payment-s1-')).length,1);
 assert.ok(journal.find(x=>x.name.includes('دریافت بل فروش')).rows.some(x=>x.account==='تسویه خارج از صندوق'));
});
test('on-account supplier settlement and auto ledger agree with cashRegister',()=>{
 let data=sample();data.shipments=[shipmentRecord(data)];
 const settlement=createSettlement({partyType:'supplier',party:'مقرب',kind:'pay',date,amount:100,currency:'AED',rate:19,viaCash:true,thirdParty:'صرافی'},data);
 data=applySettlement(data,settlement);
 const statement=partyStatement(data,'supplier','مقرب');
 assert.equal(statement.balance,-1678100);
 const opening=240000;
 const register=cashRegister(data,opening);
 assert.equal(register.balance,240000-229880-1900);
 const journal=buildAccountingJournal(data,opening);
 for(const doc of journal) assert.equal(doc.debit,doc.credit,doc.name);
 const cashJournal=journal.flatMap(j=>j.rows).filter(x=>x.account==='صندوق نقدی').reduce((s,x)=>s+x.debit-x.credit,0);
 assert.equal(Math.round(cashJournal*100)/100,register.balance);
});
test('source price and landed cost drive gross profit while operating expenses stay separate',()=>{
 const data=sample();const shipment=shipmentRecord(data);data.shipments=[shipment];
 data.invoices.push({id:'s1',number:1,date,type:'sale',party:'احمد',shipmentId:shipment.id,soldTonnes:10,items:[{productId:1,product:'برنج کبیر',quantity:10,price:100000}],total:1000000,paid:1000000,balance:0,payments:[]});
 data.expenses=[{id:33,name:'برق',date,amount:400}];
 const result=profitSummary(data);
 assert.equal(result.sales,1000000);assert.equal(result.cogs,893704);assert.equal(result.gross,106296);
 assert.equal(result.net,105896);
 assert.ok(result.estimates);
});
test('validate AED/EUR rates and financial transactions, invalid currency is blocked',()=>{
 assert.equal(convertTradeAmount(100,'AED',19.1),1910);
 assert.equal(convertTradeAmount(40,'EUR',83.25),3330);
 assert.throws(()=>convertTradeAmount(1,'AED',0),/نرخ/);
 assert.throws(()=>convertTradeAmount(5,'BTC',3),/واحد/);
});
test('all trade workflows have routes and permissions, with no spreadsheet upload page',async()=>{
 const {PAGE_PATHS}=await import('../src/utils/pageRoutes.js');
 for(const page of ['traderAccounts','shipments','profitAnalysis'])assert.ok(PAGE_PATHS[page]);
 const {PAGE_PERMISSION}=await import('../src/services/accessControl.js');
 for(const page of ['traderAccounts','shipments','profitAnalysis'])assert.ok(PAGE_PERMISSION[page]);
 assert.equal(PAGE_PATHS.excelReview,undefined);
 assert.equal(PAGE_PERMISSION.excelReview,undefined);
});

test('AED and EUR invoice conversion and calculated purchases do not use admin global rates',async()=>{
 const {convertInvoiceToAfn,currencyRate}=await import('../src/utils/currency.js');
 const aed=convertInvoiceToAfn([{product:'برنج',quantity:2,price:100,discount:0}],0,'AED',{AED:19.3});
 assert.equal(aed.total,3860);assert.equal(aed.rate,19.3);
 const eur=convertInvoiceToAfn([{product:'برنج',quantity:1,price:100,discount:0}],0,'EUR',{EUR:83.5});
 assert.equal(eur.total,8350);assert.equal(currencyRate('AFN',{}),1);
});
