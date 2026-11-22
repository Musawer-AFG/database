import test from 'node:test';
import assert from 'node:assert/strict';
import {fifoStock,purchaseLineCosts} from '../src/services/stockLots.js';
import {inventoryState} from '../src/services/business.js';
import {profitSummary,buildAccountingJournal} from '../src/services/tradeAccounting.js';
import {convertInvoiceToAfn} from '../src/utils/currency.js';
import {afghanFromGregorian,gregorianFromAfghan} from '../src/utils/afghanCalendar.js';
import {attendanceOverviewForDates,recordAttendance} from '../src/services/attendanceLogic.js';
import {contractPrintHtml} from '../src/utils/invoicePrint.js';

const product={id:1,name:'برنج',warehouseId:'default',quantity:5,cost:100,price:150};
const purchase={id:2,number:1,type:'purchase',date:'1405/01/02',warehouseId:'default',items:[{productId:1,product:'برنج',quantity:5,price:200,discount:0,unitLandedCost:210,salePriceAfn:300}],total:1050,paid:0,balance:1050};
const sale={id:3,number:1,type:'sale',date:'1405/01/03',warehouseId:'default',items:[{productId:1,product:'برنج',quantity:6,price:175,discount:0}],total:1050,paid:0,balance:1050};
const goods=(invoices=[])=>({products:[product],invoices,warehouses:[],stockMovements:[],expenses:[],payroll:[]});

test('old stock gets old cost and sale price before newer expensive lots',()=>{
 const before=fifoStock(goods([purchase]));
 assert.equal(before.suggestedPrice(1,'default',3,999),150);
 assert.equal(before.suggestedPrice(1,'default',6,999),175);
 const after=fifoStock(goods([sale,purchase]));
 assert.equal(after.sales.get('3-0').cost,710); // 5 × 100 + 1 × 210
 assert.equal(after.suggestedPrice(1,'default',1),300);
 assert.equal(after.remaining(1,'default'),4);
 assert.equal(after.remainingValue(),840);
 assert.equal(inventoryState(goods([sale,purchase])).value,840);
 assert.equal(profitSummary(goods([sale,purchase])).cogs,710);
 assert.ok(buildAccountingJournal(goods([sale,purchase])).find(x=>x.id==='auto-cogs-3').rows.find(x=>x.account==='بهای اجناس فروش‌رفته'&&x.debit===710));
});

test('purchase total plus all extra expenses calculates landed unit cost',()=>{
 const rows=purchaseLineCosts([{quantity:10,price:100,discount:0}],200);
 assert.equal(rows[0].unitLandedCost,120);
 assert.equal(rows[0].goodsTotal,1000);
 assert.equal(rows[0].allocatedExpenses,200);
 const mixed=purchaseLineCosts([{quantity:10,price:100},{quantity:20,price:100}],300);
 assert.equal(mixed.reduce((s,x)=>s+x.allocatedExpenses,0),300);
 assert.equal(mixed[0].unitLandedCost,110);
 assert.equal(mixed[1].unitLandedCost,110);
});

test('total-of-line is authoritative even when per-unit would have fractional cents',()=>{
 const items=[{product:'برنج',quantity:3,price:100/3,lineTotal:100,enteredTotal:true,discount:0}];
 const result=convertInvoiceToAfn(items,0,'USD',{USD:70},[]);
 assert.equal(result.total,7000);
 assert.equal(result.items[0].lineTotalAfn,7000);
 const landed=purchaseLineCosts(result.items,0);
 assert.equal(landed[0].landedTotal,7000);
 assert.equal(Math.round(landed[0].unitLandedCost*3*100)/100,7000);
 assert.equal(result.balance,7000); // unpaid supplier invoice
});

test('warehouse transfers carry original historical stock costs',()=>{
 const data=goods([purchase]);data.stockMovements=[{id:4,date:'1405/01/03',kind:'transfer',productId:1,quantity:3,fromWarehouseId:'default',toWarehouseId:'w2'}];
 const fifo=fifoStock(data);
 assert.equal(fifo.remaining(1,'default'),7);
 assert.equal(fifo.remaining(1,'w2'),3);
 assert.equal(fifo.warehouseValue('w2'),300);
 assert.equal(fifo.warehouseValue('default'),1250);
 assert.equal(fifo.remainingValue(),1550);
});

test('Gregorian month attendance works across a Shamsi month boundary',()=>{
 const first=afghanFromGregorian('2026-11-01');
 const last=afghanFromGregorian('2026-11-30');
 assert.equal(gregorianFromAfghan(first),'2026-11-01');
 assert.equal(gregorianFromAfghan(last),'2026-11-30');
 const days=Array.from({length:30},(_,i)=>afghanFromGregorian(`2026-11-${String(i+1).padStart(2,'0')}`));
 let records=recordAttendance([],42,first,'absent','');
 const result=attendanceOverviewForDates(records,[{id:42,firstName:'احمد'}],days,last);
 assert.equal(result.rows.find(x=>x.date===first).status,'absent');
 assert.equal(result.rows.length,30);
 assert.ok(result.totals.off>=4); // Fridays across Gregorian November
});

test('printed contract describes agreement without price, quantity or bill balance',()=>{
 const html=contractPrintHtml({title:'قرارداد مشتری',company:'عمده فروشی',percent:25,days:28,customerName:'احمد',terms:'شرایط خاص معامله'},
  {type:'sale',date:'1405/01/03',total:123456,paid:98765,balance:24691,items:[{product:'برنج',quantity:4,price:30864}]});
 assert.ok(html.includes('شرایط خاص معامله'));
 assert.ok(html.includes('حداقل پیش‌پرداخت مورد توافق: 25٪'));
 for(const forbidden of ['123456','98765','24691','30864','برنج','مشخصات جنس و مبلغ معامله'])assert.ok(!html.includes(forbidden),forbidden);
});
