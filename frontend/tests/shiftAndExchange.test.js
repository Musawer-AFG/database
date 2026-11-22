import test from 'node:test';
import assert from 'node:assert/strict';
import {validShiftTime, normalizeScheduleFields, isDuringShift, employeeAccess, kabulLocalDateTime} from '../src/services/workHours.js';
import {toAfn,fromAfn,normalizeRates,convertInvoiceToAfn,currencyRate} from '../src/utils/currency.js';
import {initialAccess,normalizeAccess,saveUserRecord} from '../src/services/accessControl.js';

test('schedule defaults 8am to 8pm Afghanistan time',()=>{
  assert.deepEqual(normalizeScheduleFields(),{shiftStart:'08:00',shiftEnd:'20:00',extraUntil:''});
  assert.equal(isDuringShift('08:00','20:00','19:59'),true);
  assert.equal(isDuringShift('08:00','20:00','20:00'),false);
  assert.equal(isDuringShift('20:00','04:00','02:00'),true);
  assert.equal(isDuringShift('20:00','04:00','12:00'),false);
  assert.equal(validShiftTime('25:00'),false);
});
test('admin can access at any hour, employee locked after shift',()=>{
  const evening=new Date('2026-11-16T15:31:00.000Z'); // 20:01 in Kabul
  assert.equal(kabulLocalDateTime(evening),'2026-11-16T20:01');
  assert.equal(employeeAccess({system:true},evening).allowed,true);
  assert.equal(employeeAccess({system:false,active:true},evening).allowed,false);
  assert.equal(employeeAccess({system:false,active:true,extraUntil:'2026-11-16T23:59'},evening).allowed,true);
  assert.equal(employeeAccess({system:false,active:true,extraUntil:'2026-11-16T20:00'},evening).allowed,false);
});
test('saved employee accounts preserve shift and expiry through normalization',()=>{
  const base=initialAccess();
  const saved=saveUserRecord(base,{name:'Test',title:'seller',roleId:'seller',username:'tester001',employeeId:'55',active:true,shiftStart:'07:30',shiftEnd:'20:00',extraUntil:'2026-11-16T23:59'});
  const reloaded=normalizeAccess(saved);
  assert.equal(reloaded.users[1].shiftStart,'07:30');
  assert.equal(reloaded.users[1].extraUntil,'2026-11-16T23:59');
});
test('FX manual rates and AFN base storage',()=>{
  const rates={USD:70,PKR:0.25};
  assert.equal(toAfn(10,'USD',rates),700);
  assert.equal(toAfn(400,'PKR',rates),100);
  assert.equal(fromAfn(700,'USD',rates),10);
  assert.equal(toAfn(300,'AFN',rates),300);
  assert.equal(currencyRate('AFN',rates),1);
  assert.throws(()=>toAfn(10,'USD',{}),/نرخ/);
  assert.deepEqual(normalizeRates({USD:-1,PKR:'0.25'}),{USD:0,PKR:0.25,AED:0,EUR:0});
});
test('invoice source currency is converted once into accounting AFN',()=>{
  const result=convertInvoiceToAfn([{product:'Rice',quantity:2,price:10,discount:0}],5,'USD',{USD:70,PKR:0.25});
  assert.equal(result.total,1400);
  assert.equal(result.paid,350);
  assert.equal(result.balance,1050);
  assert.equal(result.foreignTotal,20);
  assert.equal(result.items[0].price,700);
  assert.equal(result.items[0].sourcePrice,10);
});

// Regression: administrator preview must not bypass the selected employee's shift.
import {effectiveDemoAccess} from '../src/services/workHours.js';
test('admin preview of employee after shift is locked, but admin alone stays allowed',()=>{
  const late=new Date('2026-11-16T16:00:00.000Z'); // 20:30 Kabul
  const admin={id:'admin-user',system:true,active:true};
  const employee={id:'user-1',system:false,active:true,shiftStart:'08:00',shiftEnd:'20:00'};
  assert.equal(effectiveDemoAccess(admin,null,late).allowed,true);
  assert.equal(effectiveDemoAccess(admin,employee,late).allowed,false);
  assert.equal(effectiveDemoAccess(employee,null,late).allowed,false);
  assert.equal(effectiveDemoAccess(admin,employee,new Date('2026-11-16T12:00:00.000Z')).allowed,true);
});
test('editing a shift persists changes and disables ordinary after-hours access',()=>{
  const now=new Date('2026-11-16T16:00:00.000Z');
  let access=initialAccess();
  access=saveUserRecord(access,{name:'Samir',roleId:'seller',username:'samir001',employeeId:'123',shiftStart:'08:00',shiftEnd:'23:00'});
  assert.equal(employeeAccess(access.users[1],now).allowed,true);
  access=saveUserRecord(access,{...access.users[1],shiftEnd:'20:00',extraUntil:''});
  assert.equal(employeeAccess(access.users[1],now).allowed,false);
  const reloaded=normalizeAccess(JSON.parse(JSON.stringify(access)));
  assert.equal(employeeAccess(reloaded.users[1],now).allowed,false);
});
test('explicit extra access still allows a worker after shift until expiry',()=>{
  const user={name:'Samir',active:true,shiftStart:'08:00',shiftEnd:'20:00',extraUntil:'2026-11-16T22:00'};
  assert.equal(employeeAccess(user,new Date('2026-11-16T16:00:00.000Z')).allowed,true);
  assert.equal(employeeAccess(user,new Date('2026-11-16T17:31:00.000Z')).allowed,false);
});
