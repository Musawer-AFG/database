import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {afghanFromGregorian,gregorianFromAfghan,formatCalendarDate,groupedNumber,ungroupedNumber} from '../src/calendarDisplay.js';
import {everydayReportSummary,accountingReportSummary} from '../src/reportSimple.js';
import {describeSettingsChanges} from '../src/settingsSecurity.js';

test('Gregorian and Shamsi dates round-trip without changing canonical saved dates',()=>{
 for(const greg of ['2026-11-18','2026-03-21','2025-01-01','2024-02-29','2030-07-10']){
  const canonical=afghanFromGregorian(greg);
  assert.match(canonical,/^\d{4}\/\d{2}\/\d{2}$/);
  assert.equal(gregorianFromAfghan(canonical),greg);
  assert.equal(formatCalendarDate(canonical,'gregorian'),greg);
  assert.equal(formatCalendarDate(canonical,'shamsi'),canonical);
 }
 assert.equal(gregorianFromAfghan('not a date'),'');
 assert.equal(afghanFromGregorian('2026-02-30'),'');
});
test('Numbers show grouping while calculations retain unformatted strings',()=>{
 assert.equal(groupedNumber('123456789.50'),'123,456,789.50');
 assert.equal(groupedNumber('1000.'),'1,000.');
 assert.equal(groupedNumber('۱۲۳۴۵.۶'),'12,345.6');
 assert.equal(ungroupedNumber('۱,۲۳۴,۵۶۷.۵۰'),'1234567.50');
 assert.equal(Number(ungroupedNumber(groupedNumber('1234567.50'))),1234567.5);
});
test('General report shows everyday financial figures without mixing sales with cash',()=>{
 const stats=everydayReportSummary({sales:20000,received:12000,receivable:8000,purchases:9000,expenses:700,paidPayroll:300});
 assert.equal(stats.sales,20000);
 assert.equal(stats.received,12000);
 assert.equal(stats.receivable,8000);
 assert.equal(stats.paidPercent,60);
 assert.equal(stats.runningCosts,1000);
 assert.equal(stats.purchases,9000);
});
test('Simple summaries show zero for an empty new business',()=>{
 const stats=everydayReportSummary({});
 assert.equal(stats.paidPercent,0);
 assert.equal(stats.paymentBase,0);
 const accounting=accountingReportSummary({});
 assert.equal(accounting.documentCount,0);
 assert.equal(accounting.balanced,true);
});
test('Debit and credit are summed from the accounting lines, not relabeled as cash',()=>{
 const accounting=accountingReportSummary({page:'trialBalance',journals:[{id:1}],balances:[{debit:500,credit:200},{debit:200,credit:500}]});
 assert.equal(accounting.documentCount,1);
 assert.equal(accounting.debit,700);
 assert.equal(accounting.credit,700);
 assert.equal(accounting.difference,0);
 assert.equal(accounting.balanced,true);
});
test('Ledger account summary respects the selected account filter',()=>{
 const accounting=accountingReportSummary({page:'ledgerReport',journals:[{id:1}],balances:[{debit:999,credit:999}],ledgerLines:[{debit:300,credit:100},{debit:0,credit:75}]});
 assert.equal(accounting.lineCount,2);
 assert.equal(accounting.debit,300);
 assert.equal(accounting.credit,175);
 assert.equal(accounting.difference,125);
});
test('Invoice rows no longer receive a blue background or outline on hover',()=>{
 const source=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 const css=readFileSync(new URL('../src/reportUpgrade.css',import.meta.url),'utf8');
 assert.ok(source.includes('invoice-list-table'));
 assert.ok(!source.includes('className="invoice-clickable-row"'));
 assert.ok(css.includes('.invoice-list-table tbody tr:hover'));
 assert.ok(css.includes('background:transparent!important'));
 assert.ok(source.includes('setSelectedInvoiceId(row.id)'));
 assert.ok(source.includes('گزارش در یک نگاه'));
 assert.ok(!source.includes('<ReportVisualChart'));
});
test('Changing calendar preference is password-confirmed like other settings',()=>{
 const text=describeSettingsChanges({calendarMode:'shamsi'},{calendarMode:'gregorian'});
 assert.ok(text.some(s=>s.includes('میلادی')));
});
test('Both invoice lists include a details action and breakdown for goods and every expense',()=>{
 const source=readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
 for(const text of ['function InvoiceDetails','جزئیات بل','مجموع قیمت اجناس','مصارف اضافی — تفکیک هر مصرف','مجموع نهایی بل','setSelectedInvoiceId(row.id)'])
  assert.ok(source.includes(text),text);
});
