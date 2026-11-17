import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {afghanWeekday,isAfghanFriday,resolvedAttendance,attendanceOverview,recordAttendance} from '../src/attendanceLogic.js';
import {themeColors,THEME_PRESETS} from '../src/themePalette.js';
const minDay='1405/08/26';
test('Friday in Afghanistan calendar is holiday by default',()=>{
  assert.equal(afghanWeekday('1405/08/22'),5); // Friday 13 Nov 2026
  assert.equal(isAfghanFriday('1405/08/22'),true);
  assert.equal(resolvedAttendance(null,'1405/08/22',minDay).status,'off');
  assert.equal(resolvedAttendance(null,'1405/08/21',minDay).status,'present');
});
test('working days auto-present only until today; days before hire or after contract not auto-counted',()=>{
  assert.equal(resolvedAttendance(null,'1405/08/25','1405/08/24').status,'');
  assert.equal(resolvedAttendance(null,'1405/08/20',minDay,{startDate:'1405/08/21'}).status,'');
  assert.equal(resolvedAttendance(null,'1405/08/26',minDay,{status:'غیرفعال'}).status,'');
});
test('supervisor saved absence overrides default presence and explicit Friday work overrides holiday',()=>{
  let rows=recordAttendance([],'e1','1405/08/21','absent','حاضر نشد');
  rows=recordAttendance(rows,'e1','1405/08/22','present','در روز جمعه کار کرد');
  let info=attendanceOverview(rows,[{id:'e1',firstName:'احمد'}],1405,8,minDay);
  assert.ok(info.rows.find(x=>x.date==='1405/08/21'&&x.status==='absent'&&!x.automatic));
  assert.ok(info.rows.find(x=>x.date==='1405/08/22'&&x.status==='present'&&!x.automatic));
  assert.ok(info.rows.find(x=>x.date==='1405/08/23'&&x.status==='present'&&x.automatic));
  assert.ok(info.rows.find(x=>x.date==='1405/08/29'&&x.status==='off'&&x.automatic));
});
const lum=hex=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
test('all primary theme colors use white text on accessible darkened buttons',()=>{
  for(const hex of [...THEME_PRESETS.map(x=>x.hex),'#ffff00','#fefefe','#00ff00','#112233']){
    for(const mode of ['light','dark']){
      const c=themeColors(hex,mode);
      assert.equal(c.buttonText,'#ffffff');
      assert.ok((1.05)/(lum(c.buttonBg)+.05)>=4.5,`${hex}: ${c.buttonBg}`);
      assert.ok((1.05)/(lum(c.buttonHover)+.05)>=4.5);
    }
  }
});
test('navbar mode toggle and full entity detail controls are wired',()=>{
  const main=fs.readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
  assert.ok(main.includes('display-mode-toggle'));
  assert.ok(main.includes('setAppearance(prev=>({...prev,mode:'));
  assert.ok(main.includes('function EntityDetails('));
  assert.ok(main.includes('function IdentityScanReadOnly('));
  assert.ok(main.includes('attendanceOverview(data.attendance,employees,year,month)'));
});
