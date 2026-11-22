import test from 'node:test';
import assert from 'node:assert/strict';
import { inventoryState, saleStockError, payrollAmounts, reportSummary, afghanDateOrder, isInAfghanRange, journalBalances } from '../src/services/business.js';
const product = { id:1, name:'برنج', quantity:20, cost:500, price:600, reorder:5, warehouseId:'default' };
const base = { products:[product], warehouses:[{id:2,name:'گدام دوم'}], stockMovements:[], invoices:[],expenses:[],payroll:[],journals:[] };
const copy = () => structuredClone(base);
test('opening stock and value are derived correctly',()=>{
  const state=inventoryState(copy());
  assert.equal(state.get(1,'default'),20);
  assert.equal(state.value,10000);
});
test('purchases add stock and sales reduce stock; deleting bill reverses derived stock',()=>{
  const data=copy();
  const purchase={id:1,number:1,type:'purchase',date:'۲۱ عقرب ۱۴۰۵',warehouseId:'default',items:[{product:'برنج',quantity:10,price:500}]};
  const sale={id:2,number:2,type:'sale',date:'۲۲ عقرب ۱۴۰۵',warehouseId:'default',items:[{product:'برنج',quantity:4,price:600}]};
  data.invoices=[purchase,sale];
  assert.equal(inventoryState(data).total(1),26);
  data.invoices=[sale];
  assert.equal(inventoryState(data).total(1),16);
});
test('transfers preserve total stock and relocate to destination warehouse',()=>{
  const data=copy();
  data.stockMovements=[{id:7,productId:'1',kind:'transfer',fromWarehouseId:'default',toWarehouseId:'2',quantity:6}];
  const state=inventoryState(data);
  assert.equal(state.get(1,'default'),14);
  assert.equal(state.get(1,2),6);
  assert.equal(state.total(1),20);
});
test('duplicate sale lines cannot oversell a warehouse',()=>{
  const data=copy();
  assert.match(saleStockError(data,[{product:'برنج',quantity:12},{product:'برنج',quantity:9}],'default'),/کافی نیست/);
  assert.equal(saleStockError(data,[{product:'برنج',quantity:12}],'default'),'');
});
test('Afghan month names and digits sort and filter correctly',()=>{
  assert.equal(afghanDateOrder('۲۲ عقرب ۱۴۰۵'),14050822);
  assert.equal(afghanDateOrder('1405/08/21'),14050821);
  assert.equal(isInAfghanRange('۲۲ عقرب ۱۴۰۵','1405/08/21','1405/08/22'),true);
  assert.equal(isInAfghanRange('۲۲ عقرب ۱۴۰۵','1405/09/01',''),false);
});
test('payroll calculates gross, deduction, net and insurance',()=>{
  assert.deepEqual(payrollAmounts({base:10000,bonus:500,deduction:300,employerInsurance:50}),{
    gross:10500,deduction:300,net:10200,insurance:50
  });
});
test('report summary derives totals from invoices, expenses and paid payroll',()=>{
  const data=copy();
  data.invoices=[{id:1,type:'sale',date:'۲۲ عقرب ۱۴۰۵',total:2000,paid:500,balance:1500},
    {id:2,type:'purchase',date:'۲۲ عقرب ۱۴۰۵',total:700,paid:700,balance:0}];
  data.expenses=[{id:3,date:'۲۲ عقرب ۱۴۰۵',amount:120}];
  data.payroll=[{id:4,date:'۲۲ عقرب ۱۴۰۵',status:'paid',base:100,bonus:0,deduction:5}];
  const summary=reportSummary(data);
  assert.equal(summary.sales,2000);
  assert.equal(summary.receivable,1500);
  assert.equal(summary.purchases,700);
  assert.equal(summary.expenses,120);
  assert.equal(summary.paidPayroll,95);
});
test('trial balance aggregates debit and credit by account',()=>{
  const result=journalBalances([{rows:[{account:'کرایه',debit:200,credit:0},{account:'صندوق',debit:0,credit:200}]}]);
  assert.equal(result.length,2);
  assert.equal(result.reduce((s,r)=>s+r.debit,0),200);
  assert.equal(result.reduce((s,r)=>s+r.credit,0),200);
});
test('returns increase stock and old Iranian-labeled dates can still be filtered',()=>{
  const data=copy();
  data.invoices=[{id:2,number:2,type:'return',date:'۲۲ عقرب ۱۴۰۵',warehouseId:'default',items:[{product:'برنج',quantity:2,price:600}]}];
  assert.equal(inventoryState(data).total(1),22);
  assert.equal(afghanDateOrder('۲۲ آبان ۱۴۰۵'),14050822);
});
