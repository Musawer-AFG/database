import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {contractDraft,contractPresets,selectContractPreset,validateContract,dueDate,requiredDownPayment,paymentContractError,requiredDownPaymentSource,contractSnapshot} from '../src/services/customerContracts.js';
import {invoicePrintHtml,contractPrintHtml,escapeHtml} from '../src/utils/invoicePrint.js';
import {convertInvoiceToAfn} from '../src/utils/currency.js';
import {attendanceOverview,recordAttendance} from '../src/services/attendanceLogic.js';
const invoice={id:1,number:7,type:'sale',party:'احمد',date:'1405/08/28',total:12000,paid:6000,balance:6000,currency:'USD',exchangeRate:60,foreignTotal:200,items:[{product:'برنج',quantity:10,unit:'بوجی',weightPerUnit:25,price:1000,sourcePrice:1000/60,discount:0}],lineSubtotal:10000,extraExpensesTotal:2000,extraExpenses:[{description:'کرایه موتر',amount:1500,sourceAmount:25},{description:'بارگیری',amount:500,sourceAmount:500/60}],payments:[],notes:'توضیحات <script>bad()</script>'};
const customer={name:'احمد',mobile:'0700000000',tazkira:'نمونه',address:'کابل',saleContract:{enabled:true,preset:'half',percent:50,days:28,guarantor:'ضامن نمونه',father:'ولد نمونه',terms:'شرایط توافقی نمونه'}};
const prefs={shopName:'عمده فروشی نمونه'};
test('cash, 50%, 25%, credit and custom terms use correct down payment and reject underpayment',()=>{
 for(const [preset,[percent,days]] of Object.entries(contractPresets)){
  const c=contractDraft({enabled:true,preset,percent,days});assert.equal(validateContract(c),'');
  const min=requiredDownPayment(12000,c);assert.equal(min,12000*percent/100);assert.equal(paymentContractError(12000,min,c,invoice.date),'');if(min>0)assert.ok(paymentContractError(12000,min-.01,c,invoice.date));
 }
 assert.equal(paymentContractError(100,0,null,invoice.date),'');
 assert.ok(validateContract({enabled:true,percent:110,days:28}));assert.ok(validateContract({enabled:true,percent:25,days:0}));
});
test('28-day due date is calculated across Afghan calendar month boundaries',()=>{
 assert.equal(dueDate('1405/08/28',28),'1405/09/26');assert.equal(dueDate('28 عقرب 1405',28),'1405/09/26');assert.equal(dueDate('1405/08/28',0),'1405/08/28');assert.equal(dueDate('invalid',28),'');assert.equal(dueDate(invoice.date,NaN),'');
});
test('FX down payment shortcut satisfies the actual AFN threshold including rounding',()=>{
 for(const rate of [0.25,0.3,60,70.58])for(const percent of [25,50,100])for(const total of [0.01,0.03,123.45,200]){
  const c={enabled:true,percent,days:percent===100?0:28};const paid=requiredDownPaymentSource(total,c,rate);const converted=convertInvoiceToAfn([{quantity:1,price:total,discount:0}],paid,'USD',{USD:rate});assert.equal(paymentContractError(converted.total,converted.paid,c,invoice.date),'');
 }
});
test('sale contract snapshots customer terms, guarantor, date and initial payment; edited customer cannot change signed terms',()=>{
 const person=structuredClone(customer);const snapshot=contractSnapshot(person,prefs,invoice);person.saleContract.percent=100;person.saleContract.guarantor='جدید';assert.equal(snapshot.percent,50);assert.equal(snapshot.guarantor,'ضامن نمونه');assert.equal(snapshot.paid,6000);assert.equal(snapshot.due,'1405/09/26');assert.equal(snapshot.contractNumber,'S-7');assert.equal(snapshot.minimum,6000);
});
test('print HTML for purchases and sales includes every charge, line details and payment history; escapes unsafe text',()=>{
 for(const type of ['sale','purchase']){const html=invoicePrintHtml({...invoice,type,paid:7000,balance:5000,payments:[{date:'1405/08/29',amount:1000,notes:'پرداخت دوم'}]}, {},prefs,'gregorian');for(const text of ['کرایه موتر','بارگیری','مجموع قیمت اجناس','مجموع مصارف اضافی','مجموع نهایی بل','سوابق پرداخت‌ها','پرداخت دوم','قیمت اصلی اجناس','USD','2026-11-19','&lt;script&gt;'])assert.ok(html.includes(text),text);assert.ok(!html.includes('<script>'));assert.ok(!html.includes('app-shell'));}
 assert.equal(escapeHtml('<b>'), '&lt;b&gt;');
});
test('printable customer contract contains terms, guarantor and signatures but never sales figures',()=>{
 const snapshot=contractSnapshot(customer,prefs,invoice);
 const html=contractPrintHtml(snapshot,invoice);
 for(const text of ['مشخصات خریدار و طرف قرارداد','شرایط عمومی و تعهدات خریدار','مشخصات تضمین‌کننده','تعهدات و تأیید نهایی','شصت ضامن','شاهد اول','شاهد دوم','کاپی تذکره ضامن','شرایط توافقی نمونه'])assert.ok(html.includes(text),text);
 for(const excluded of ['مشخصات جنس و مبلغ معامله','قیمت واحد (AFN)','مبلغ پرداخت‌شده','باقی‌داری</th>','وزن فی بوجی','کرایه موتر'])assert.ok(!html.includes(excluded),excluded);
 assert.equal(contractPrintHtml(snapshot),html);
});
test('attendance changes persist for the particular employee and day; Friday remains a holiday',()=>{
 const staff=[{id:'a',firstName:'احمد'},{id:'b',firstName:'کریم'}];let rows=recordAttendance([],'a','1405/08/21','absent','غایب');const summary=attendanceOverview(rows,staff,1405,8,'1405/08/28');assert.equal(summary.rows.find(x=>x.employeeId==='a'&&x.date==='1405/08/21').status,'absent');assert.equal(summary.rows.find(x=>x.employeeId==='b'&&x.date==='1405/08/21').status,'present');assert.equal(summary.rows.find(x=>x.employeeId==='a'&&x.date==='1405/08/22').status,'off');
});
test('attendance grid opens editor and invoice print actions point to isolated document, not full app',()=>{
 const source=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');for(const token of ['openAttendanceCell(e,dateAtDay)','attendance-cell-editor','monthlyGrid=useMemo','printHtml(invoicePrintHtml(row,data,preferences,calendarMode))','<CustomerContractEditor','paymentContractError(subtotal,initialPaid','contractSnapshot(contractCustomer,preferences,invoice)'])assert.ok(source.includes(token),token);
});

test('custom payment option accepts a manually entered percentage and preserves the deadline',()=>{
 const c=selectContractPreset(contractDraft({enabled:true,preset:'half',percent:50,days:45}),'custom');
 assert.equal(c.percent,'');assert.equal(c.days,45);assert.ok(validateContract(c));
 for(const percent of [0,17,35,37.5,72.25,100]){
  const custom={...c,percent:String(percent)};assert.equal(validateContract(custom),'');
  const min=requiredDownPayment(20000,custom);assert.equal(min,20000*percent/100);
  assert.equal(paymentContractError(20000,min,custom,invoice.date),'');
  if(min>0)assert.ok(paymentContractError(20000,min-.01,custom,invoice.date));
  assert.equal(selectContractPreset(custom,'custom').percent,String(percent));
  const snap=contractSnapshot({...customer,saleContract:custom},prefs,invoice);assert.equal(snap.percent,String(percent));assert.ok(contractPrintHtml(snap,invoice).includes(`حداقل پیش‌پرداخت مورد توافق: ${percent}٪`));
 }
 for(const percent of [-1,101,'',' ',null])assert.ok(validateContract({...c,percent}));
 assert.equal(selectContractPreset(c,'quarter').percent,25);
 assert.equal(selectContractPreset({...c,preset:'cash',days:0},'custom').days,28);
});
test('customer contract form offers a clearly labelled custom percentage input',()=>{
 const source=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.ok(source.includes('فیصدی دلخواه (وارد کردن دستی)'));
 assert.ok(source.includes("c.preset==='custom'?<label>فیصدی دلخواه"));
 assert.ok(source.includes('inputMode="decimal" min="0" max="100" step="0.01" required'));
});
