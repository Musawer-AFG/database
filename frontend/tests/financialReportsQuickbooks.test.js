import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {reportDateRange,validReportRange,profitForRange,cashForRange,debtSnapshot,expenseCategories,monthlyFinancialTrends,reportTransactions} from '../src/services/reportInsights.js';

const stockData={
 products:[{id:'rice',name:'برنج',quantity:10,cost:100,price:150,warehouseId:'default'}],
 invoices:[
  {id:'s1',type:'sale',date:'1405/01/08',number:1,party:'احمد',total:300,paid:100,balance:200,items:[{product:'برنج',productId:'rice',quantity:2,price:150,discount:0}],payments:[{id:'p1',date:'1405/02/03',amount:50,viaCash:true}]},
  {id:'p1',type:'purchase',date:'1405/02/10',number:2,party:'فروشنده',total:400,paid:100,balance:300,items:[{product:'برنج',productId:'rice',quantity:4,price:100,discount:0}]},
 ],
 expenses:[{id:'e1',date:'1405/01/12',name:'کرایه',amount:20},{id:'e2',date:'1405/02/12',name:'برق',amount:10}],
 payroll:[{id:'pay',date:'1405/01/24',status:'paid',base:30,bonus:0,deduction:0,paidDate:'1405/02/04'}],
 cashEntries:[],shipments:[],stockMovements:[],settlements:[],
};

test('Dari period selector handles current month, year, custom and invalid ranges',()=>{
 assert.deepEqual(reportDateRange('today',{now:{year:1405,month:8,day:22}}),{from:'1405/08/22',to:'1405/08/22',label:'امروز'});
 assert.deepEqual(reportDateRange('month',{now:{year:1405,month:8,day:22}}),{from:'1405/08/01',to:'1405/08/30',label:'این ماه'});
 assert.deepEqual(reportDateRange('year',{year:1404}),{from:'1404/01/01',to:'1404/12/30',label:'سال 1404'});
 assert.equal(validReportRange('1405/08/22','1405/07/21'),'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.');
 assert.equal(validReportRange('bad','1405/08/22'),'تاریخ شروع معتبر نیست.');
});

test('period profit uses historic FIFO before selected date, not a filtered inventory queue',()=>{
 const jan=profitForRange(stockData,'1405/01/01','1405/01/31');
 assert.deepEqual([jan.sales,jan.cogs,jan.gross,jan.expenses,jan.wages,jan.net],[300,200,100,20,30,50]);
 const feb=profitForRange(stockData,'1405/02/01','1405/02/30');
 assert.equal(feb.sales,0);assert.equal(feb.cogs,0);assert.equal(feb.expenses,10);
 const full=profitForRange(stockData);
 assert.equal(full.net,40);
});

test('cash flow uses actual payment dates and distinguishes bill balance from money received',()=>{
 const jan=cashForRange(stockData,0,'1405/01/01','1405/01/31');
 assert.equal(jan.in,50); // 100 paid now minus 50 later
 assert.equal(jan.out,20); // wages paid in Thawr, not Hamal
 assert.equal(jan.net,30);
 const feb=cashForRange(stockData,0,'1405/02/01','1405/02/30');
 assert.equal(feb.in,50); assert.equal(feb.out,140); // purchase 100, wages 30, electricity 10
});

test('debts display current balances independent of date selection',()=>{
 const d=debtSnapshot(stockData);
 assert.equal(d.receivable,200);
 assert.equal(d.payable,300);
 assert.equal(d.sales.length,1);
 assert.equal(d.purchases.length,1);
});

test('expense category chart and monthly chart use Afghan months',()=>{
 const categories=expenseCategories(stockData,'1405/01/01','1405/01/31');
 assert.equal(categories.reduce((s,x)=>s+x.value,0),50);
 const monthly=monthlyFinancialTrends(stockData,1405,0);
 assert.equal(monthly.length,12);assert.equal(monthly[0].name,'حمل');assert.equal(monthly[0].profit,50);
 assert.equal(monthly[1].incoming,50);assert.equal(monthly[1].outgoing,140);
});

test('reports transactions are filtered, typed, ordered, and capped for readability',()=>{
 const rows=reportTransactions(stockData,'sales','1405/01/01','1405/01/31');
 assert.equal(rows.length,1);assert.equal(rows[0].kind,'بل فروش');
 assert.equal(reportTransactions(stockData,'expenses').length,3);
});

test('reports menu is wired to the new overview and accountant-only detail routes survive',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.ok(app.includes('if (page === "reports")'));
 assert.ok(app.includes('<FinancialReportsOverview'));
 assert.ok(app.includes('if (["trialBalance", "journalReport", "ledgerReport", "documentReport"].includes(page))'));
});
