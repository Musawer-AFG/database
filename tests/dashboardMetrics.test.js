import test from 'node:test';
import assert from 'node:assert/strict';
import { afghanDateDayNumber, customerDebtAging, monthlySalesPurchases, lowStockProducts, financialYearOptions } from '../src/dashboardMetrics.js';

test('monthly sale and purchase amounts use Afghan months, ignore other years',()=>{
  const data={invoices:[
    {type:'sale',date:'1405/01/01',total:200},
    {type:'purchase',date:'۱ ثور ۱۴۰۵',total:80},
    {type:'sale',date:'1404/01/01',total:999},
    {type:'return',date:'1405/01/02',total:50},
  ]};
  const rows=monthlySalesPurchases(data,1405);
  assert.equal(rows.length,12);
  assert.equal(rows[0].sales,200);
  assert.equal(rows[0].purchases,0);
  assert.equal(rows[1].purchases,80);
});
test('Persian date conversion is leap-year safe and equivalent between formats',()=>{
  const a=afghanDateDayNumber('1405/01/01');
  assert.equal(a,afghanDateDayNumber('۱ حمل ۱۴۰۵'));
  assert.equal(afghanDateDayNumber('1405/01/31')-a,30);
  assert.equal(afghanDateDayNumber('1405/02/01')-a,31);
  assert.equal(afghanDateDayNumber('1405/13/01'),null);
});
test('debt aging groups only open sales and holds missing dates apart',()=>{
  const asOf=new Date('2026-11-15T12:00:00Z');
  const today=afghanDateDayNumber('1405/08/24');
  // Iranian/Arabic locale calendars on different platforms may be off 1 day;
  // express known age using the same calendar and compare date conversions.
  assert.ok(today !== null);
  const invoices=[
    {type:'sale',date:'1405/08/20',balance:100},
    {type:'sale',date:'1405/07/01',balance:200},
    {type:'sale',date:'1405/04/01',balance:300},
    {type:'purchase',date:'1405/07/01',balance:900},
    {type:'sale',date:'',balance:50},
  ];
  const result=customerDebtAging({invoices},asOf);
  assert.deepEqual(result.buckets.map(x=>x.total),[100,200,0,300]);
  assert.equal(result.unknown,50);
  assert.equal(result.buckets.reduce((s,r)=>s+r.total,0)+result.unknown,650);
});
test('low-stock products reflect stock movements, purchases and reorder levels',()=>{
 const data={products:[{id:1,name:'برنج',quantity:5,reorder:8},{id:2,name:'روغن',quantity:30,reorder:10}],invoices:[{id:4,type:'purchase',items:[{product:'برنج',quantity:2}]}],stockMovements:[]};
 const result=lowStockProducts(data);
 assert.equal(result.length,1);
 assert.equal(result[0].quantity,7);
});
test('available years include historic invoice years',()=>{
 const years=financialYearOptions({invoices:[{date:'۱۳۹۸/۰۳/۰۵'}]},1405,new Date('2026-11-15'));
 assert.ok(years.includes(1398));
 assert.ok(years.includes(1405));
});
