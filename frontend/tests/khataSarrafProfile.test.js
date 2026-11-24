import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createSarraf,updateSarrafProfile,sarrafStatement} from '../src/services/sarrafAccounts.js';
import {accountStatementHtml} from '../src/utils/accountStatementPrint.js';
import {PAGE_PATHS,pageForPath} from '../src/utils/pageRoutes.js';
import {partyStatement} from '../src/services/tradeAccounting.js';
const d='1405/08/10';
test('only the existing traders route is the Khata menu; old duplicate route redirects',()=>{
 const app=readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 assert.match(app,/id: "traderAccounts", label: "کهاته"/);
 assert.doesNotMatch(app,/id: "ledgerReport", label: "کهاته"/);
 assert.equal(PAGE_PATHS.ledgerReport,undefined);
 assert.equal(pageForPath('/accounting/traders'),'traderAccounts');
 assert.match(app,/<Route path="\/reports\/ledger" element=\{<Navigate to=\{pathForPage\('traderAccounts'\)\} replace/);
});
test('Sarraf registration stores full business address and contact information as text',()=>{
 const record=createSarraf({name:' صراف احمد ',shopName:'صرافی احمد',market:'سرای شهزاده',shopNumber:'001-A',floor:'۲',country:'افغانستان',city:'کابل',location:'آدرس مکمل',phone:'0700123456',mobile:'0790000000',licenseNumber:'001',contactPerson:'احمد',notes:'نمونه'},{});
 assert.equal(record.name,'صراف احمد');assert.equal(record.shopNumber,'001-A');assert.equal(record.market,'سرای شهزاده');assert.equal(record.shopName,'صرافی احمد');assert.equal(record.phone,'0700123456');assert.equal(record.licenseNumber,'001');assert.equal(record.country,'افغانستان');assert.equal(record.city,'کابل');
});
test('editing older Sarraf profiles keeps identity and historic balance',()=>{
 const data={sarrafs:[{id:'old',name:'صراف کابل',location:'کابل',phone:'001'}],sarrafTransactions:[{id:'1',sarrafId:'old',kind:'deposit',afn:100,date:d}]};
 const updated=updateSarrafProfile(data,'old',{name:'different',shopName:'دکان الف',market:'مارکیت الف',shopNumber:'01'});
 assert.equal(updated.id,'old');assert.equal(updated.name,'صراف کابل');assert.equal(updated.location,'کابل');assert.equal(updated.shopNumber,'01');assert.equal(updated.shopName,'دکان الف');assert.deepEqual(sarrafStatement({...data,sarrafs:[updated]},'old'),sarrafStatement(data,'old'));
 assert.throws(()=>updateSarrafProfile(data,'missing',{}),/صراف/);
});
test('printable Khata statement uses original account totals and escapes all entered text',()=>{
 const st=partyStatement({invoices:[{id:'p',type:'purchase',party:'A',date:d,total:5000,paid:1500,payments:[]}]},'supplier','A');
 const html=accountStatementHtml({partyName:'<script>alert(1)</script>',partyType:'عرضه‌کننده',shopName:'عمده فروشی',shopLogo:'javascript:alert(1)',date:d,debit:st.debit,credit:st.credit,balance:st.balance,details:[['نمبر دکان','<img>']],headers:['تاریخ','شرح','مانده'],rows:st.lines.map(x=>[x.date,x.description,x.balance])});
 assert.match(html,/dir="rtl"/);assert.match(html,/A4 landscape/);assert.match(html,/1,500 AFN/);assert.match(html,/5,000 AFN/);assert.match(html,/-3,500 AFN/);assert.match(html,/&lt;script&gt;/);assert.match(html,/&lt;img&gt;/);assert.doesNotMatch(html,/<script>|javascript:/);assert.match(html,/امضای حسابدار/);
});
test('both selected-account pages use dedicated printable statements',()=>{
 for(const file of ['TradeWorkflows.jsx','SarrafPage.jsx']){
 const text=readFileSync(new URL('../src/pages/Accounting/'+file,import.meta.url),'utf8');assert.match(text,/printHtml\(accountStatementHtml\(/);assert.match(text,/onClick=\{printStatement\}/);
 }
});
