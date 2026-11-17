import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { cashRegister, canAffordCash, buildManualCashEntry } from '../src/cashRegister.js';
import { attendanceKey, attendanceDays, attendanceTotals, recordAttendance } from '../src/attendanceLogic.js';
import { THEME_PRESETS, themeColors, addCustomColor, normalizeAppearance } from '../src/themePalette.js';
import { saveIdentityScan } from '../src/idDocuments.js';
const date='1405/08/26';
const empty={invoices:[],payroll:[],expenses:[],cashEntries:[]};

test('opening cash set during new shop setup, without fictitious sales',()=>{
  const value=cashRegister(empty,120000);
  assert.equal(value.opening,120000);
  assert.equal(value.balance,120000);
  assert.equal(value.entries.length,0);
});

test('cash sales added, purchases subtracted, extra invoice costs already part of invoice total',()=>{
  const data={...empty,invoices:[
    {id:1,type:'sale',number:1,date,total:50000,paid:25000,payments:[]},
    {id:2,type:'purchase',number:2,date,total:20000,paid:10000,payments:[]},
  ]};
  const cash=cashRegister(data,100000);
  assert.equal(cash.incoming,25000);
  assert.equal(cash.outgoing,10000);
  assert.equal(cash.balance,115000);
});

test('credit invoices do not move cash until payment and partial payments counted once',()=>{
  const data={...empty,invoices:[
    {id:1,type:'sale',number:1,date,total:50000,paid:15000,balance:35000,payments:[{id:1,date,amount:15000}]},
    {id:2,type:'purchase',number:1,date,total:20000,paid:7000,balance:13000,payments:[{id:2,date,amount:7000}]},
  ]};
  const register=cashRegister(data,0);
  assert.equal(register.incoming,15000);
  assert.equal(register.outgoing,7000);
  assert.equal(register.balance,8000);
  assert.equal(register.entries.length,2);
});

test('salary, expenses, supplier payments and manual owner contributions reconcile',()=>{
  const data={...empty,
    invoices:[{id:8,type:'purchase',date,paid:1000,payments:[]}],
    expenses:[{id:1,date,name:'کرایه موتر',amount:500}],
    payroll:[{id:1,employeeName:'احمد',date,paidDate:date,status:'paid',base:15000,bonus:0,deduction:1000}],
    cashEntries:[{id:1,date,kind:'in',amount:10000,description:'سرمایه مالک'},{id:2,date,kind:'out',amount:800,description:'برداشت مالک'}]
  };
  const result=cashRegister(data,30000);
  assert.equal(result.balance,30000-1000-500-14000+10000-800);
  assert.equal(result.outgoing,16300);
  assert.equal(result.incoming,10000);
  assert.ok(result.entries.every(x=>typeof x.balance==='number'));
});

test('duplicate salary payment record is not double-counted and unpaid slip ignored',()=>{
  const data={...empty,payroll:[
    {id:1,status:'paid',date,net:9000},
    {id:2,status:'draft',date,net:9000},
  ]};
  assert.equal(cashRegister(data,10000).balance,1000);
});

test('manual cash validation and available money check',()=>{
  assert.equal(canAffordCash(empty,100,100),true);
  assert.equal(canAffordCash(empty,100,100.01),false);
  assert.throws(()=>buildManualCashEntry({date,kind:'out',amount:-1,description:'test'}));
  assert.throws(()=>buildManualCashEntry({date,kind:'in',amount:1,description:''}));
  assert.equal(buildManualCashEntry({date,kind:'in',amount:100,description:'سرمایه'}).amount,100);
});

test('attendance starts unmarked, can set and overwrite statuses by day',()=>{
  const k=attendanceKey(1405,8,26);
  let rows=recordAttendance([], 'e1', k, 'present');
  assert.equal(rows.length,1);
  rows=recordAttendance(rows,'e1',k,'late','۱۵ دقیقه');
  assert.equal(rows.length,1);
  assert.equal(rows[0].status,'late');
  rows=recordAttendance(rows,'e1',k,'');
  assert.equal(rows.length,0);
});

test('attendance totals respect year, month and employee filter',()=>{
  let rows=recordAttendance([],'e1',attendanceKey(1405,8,1),'present');
  rows=recordAttendance(rows,'e2',attendanceKey(1405,8,2),'absent');
  rows=recordAttendance(rows,'e1',attendanceKey(1405,9,2),'late');
  assert.deepEqual(attendanceTotals(rows,['e1'],1405,8),{present:1,late:0,absent:0,off:0});
  assert.equal(attendanceTotals(rows,['e1','e2'],1405,8).absent,1);
  assert.equal(attendanceDays(1405,1),31);
  assert.equal(attendanceDays(1405,8),30);
});

test('custom colors and light/dark mode valid',()=>{
  assert.ok(THEME_PRESETS.length>=6);
  const next=addCustomColor(normalizeAppearance({mode:'dark'}),'#112233');
  assert.equal(next.accent,'#112233');
  assert.equal(next.customColors.length,1);
  assert.match(themeColors(next.accent,'dark').soft,/^#[0-9a-f]{6}$/);
  assert.notEqual(themeColors(next.accent,'dark').soft,themeColors(next.accent,'light').soft);
  assert.throws(()=>addCustomColor(next,'red'));
});

test('identity document uploader rejects dangerous types and excessive sizes before storage',async()=>{
  await assert.rejects(saveIdentityScan({type:'text/html',size:5,name:'id.html'}),/JPG/);
  await assert.rejects(saveIdentityScan({type:'image/jpeg',size:9*1024*1024,name:'large.jpg'}),/۸/);
});

test('source wires cash, editable attendance, document scans, and settings theme',()=>{
  const source=fs.readFileSync(new URL('../src/main.jsx', import.meta.url),'utf8');
  const permission=fs.readFileSync(new URL('../src/accessControl.js',import.meta.url),'utf8');
  for(const term of ['CashRegisterPage','openingCash','cashRegister','IdentityScanField','saveIdentityScan','ThemeSettingsControls','attendanceByKey','saveAttendanceRecord']) assert.ok(source.includes(term),term);
  assert.ok(permission.includes("cashRegister:'accounting.view'"));
  assert.ok(!source.includes('themeMenuOpen'));
  assert.ok(source.includes('onSaveAppearance={saveAppearance}'));
});
