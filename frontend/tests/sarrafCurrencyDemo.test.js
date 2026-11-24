import test from 'node:test';
import assert from 'node:assert/strict';
import {convertInvoiceToAfn,toAfn,fromAfn,currencyRate,upgradeInvoiceQuote,quoteUnits} from '../src/utils/currency.js';
import {convertTradeAmount,buildAccountingJournal,partyStatement,profitSummary} from '../src/services/tradeAccounting.js';
import {cashRegister} from '../src/services/cashRegister.js';
import {createSarraf,recordSarrafTransaction,sarrafStatement} from '../src/services/sarrafAccounts.js';
import {profitForRange} from '../src/services/reportInsights.js';
import {PAGE_PERMISSION,initialAccess,canOpenPage} from '../src/services/accessControl.js';
import {pageForPath,pathForPage} from '../src/utils/pageRoutes.js';
const d='1405/08/10';
const base=()=>({sarrafs:[{id:'s',name:'صراف کابل'}],sarrafTransactions:[],invoices:[{id:'p',type:'purchase',party:'عرضه‌کننده پاکستان',date:d,number:1,total:5000,balance:5000,paid:0,payments:[],items:[]},{id:'c',type:'sale',party:'مشتری',date:d,number:2,total:2000,balance:2000,paid:0,payments:[],items:[]} ]});
const tx=(data,fields)=>recordSarrafTransaction(data,{sarrafId:'s',date:d,currency:'AFN',amount:1000,reference:'ref-'+(data.sarrafTransactions.length+1),...fields},10000);
test('PKR quotes are per thousand, all other currencies remain per single unit',()=>{
 assert.equal(quoteUnits('PKR'),1000);assert.equal(currencyRate('PKR',{PKR:250}),.25);
 assert.equal(toAfn(100000,'PKR',{PKR:250}),25000);assert.equal(fromAfn(25000,'PKR',{PKR:250}),100000);
 assert.equal(toAfn(100,'USD',{USD:70}),7000);assert.equal(toAfn(100,'AED',{AED:19}),1900);assert.equal(toAfn(100,'EUR',{EUR:80}),8000);
 assert.equal(convertTradeAmount(100000,'PKR',250),25000);assert.throws(()=>toAfn(1000,'PKR',{PKR:0}),/نرخ/);
 const bill=convertInvoiceToAfn([{quantity:10,price:1000,discount:100}],4000,'PKR',{PKR:250},[{id:'e',description:'کرایه',amount:100}]);
 assert.equal(bill.total,2500);assert.equal(bill.paid,1000);assert.equal(bill.balance,1500);assert.equal(bill.extraExpensesTotal,25);
});
test('legacy invoice quote is upgraded once without rewriting AFN amounts',()=>{
 const old={pkrRate:.25,exchangeRate:.25,total:5000,paid:2000,balance:3000};const upgraded=upgradeInvoiceQuote(old);
 assert.equal(upgraded.pkrRate,250);assert.equal(upgraded.exchangeRate,.25);assert.equal(upgraded.total,5000);assert.equal(upgraded.balance,3000);assert.deepEqual(upgradeInvoiceQuote(upgraded),upgraded);
});
test('sarraf deposit and PKR supplier payment change cash only once and balance the journal',()=>{
 let data=tx(base(),{kind:'deposit',amount:6000});data=tx(data,{kind:'supplier',invoiceId:'p',currency:'PKR',amount:10000,rate:250});
 assert.equal(data.invoices[0].paid,2500);assert.equal(data.invoices[0].balance,2500);assert.equal(data.invoices[0].payments[0].viaCash,false);assert.equal(cashRegister(data,10000).balance,4000);assert.equal(sarrafStatement(data,'s').balance,3500);
 assert.equal(partyStatement(data,'supplier','عرضه‌کننده پاکستان').balance,-2500);
 const rows=buildAccountingJournal(data,10000).flatMap(j=>{assert.equal(j.debit,j.credit);return j.rows;});
 const acct=rows.filter(x=>x.account.startsWith('حساب صراف'));assert.equal(acct.reduce((s,x)=>s+x.debit-x.credit,0),3500);
 assert.equal(profitSummary(data).net,profitSummary(base()).net);assert.equal(profitForRange(data).net,profitForRange(base()).net);
});
test('customer receipt into sarraf and subsequent withdrawal settle debt, then increase cash',()=>{
 let data=tx(base(),{kind:'customer',invoiceId:'c',currency:'USD',amount:20,rate:70});assert.equal(data.invoices[1].balance,600);assert.equal(cashRegister(data,10000).balance,10000);assert.equal(sarrafStatement(data,'s').balance,1400);
 data=tx(data,{kind:'withdraw',amount:1000});assert.equal(cashRegister(data,10000).balance,11000);assert.equal(sarrafStatement(data,'s').balance,400);
});
test('reject unavailable funds, duplicate receipt, wrong bill type, overpayment and invalid rate',()=>{
 assert.throws(()=>tx(base(),{kind:'supplier',invoiceId:'p'}),/موجودی/);
 assert.throws(()=>tx(base(),{kind:'deposit',amount:10001}),/صندوق/);
 const data=tx(base(),{kind:'deposit',amount:6000,reference:'123'});
 assert.throws(()=>tx(data,{kind:'withdraw',reference:'123'}),/قبلاً/);
 assert.throws(()=>tx(data,{kind:'supplier',invoiceId:'c'}),/بل/);
 assert.throws(()=>tx(data,{kind:'supplier',invoiceId:'p',amount:5100}),/مانده/);
 assert.throws(()=>tx(data,{kind:'withdraw',currency:'PKR',rate:0}),/نرخ/);
 assert.throws(()=>tx(data,{kind:'supplier',invoiceId:'p',date:'1405/08/01'}),/تاریخ/);
 assert.throws(()=>createSarraf({name:'صراف کابل'},data),/قبلاً/);
});
test('new sarraf page has a stable accounting permission and route',()=>{
 assert.equal(PAGE_PERMISSION.sarrafs,'accounting.view');assert.equal(pageForPath(pathForPage('sarrafs')),'sarrafs');
 const access=initialAccess();assert.equal(canOpenPage(access,access.users[0].id,'sarrafs'),true);
});
