import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DOCUMENT_TEMPLATES,DOCUMENT_DEFAULT_CONTENT,normalizeDocumentDesign,resolveDocumentContent,resolveDocumentDesign} from '../src/utils/documentDesigns.js';
import {contractDraft,contractSnapshot} from '../src/services/customerContracts.js';
import {invoicePrintHtml,contractPrintHtml} from '../src/utils/invoicePrint.js';
import {describeSettingsChanges} from '../src/services/settingsSecurity.js';

const bill={type:'sale',number:12,party:'احمد',date:'1405/08/29',title:'بل نمونه',items:[{product:'برنج',quantity:1,price:700,discount:0}],total:700,paid:500,balance:200};
const logo='data:image/png;base64,AAAA';

test('design 1 and design 4 are distinct named templates with unrestricted valid HEX colours',()=>{
 const b=normalizeDocumentDesign();
 const c=normalizeDocumentDesign({},'contract');
 assert.equal(b.template,DOCUMENT_TEMPLATES.bill);assert.equal(c.template,DOCUMENT_TEMPLATES.contract);
 for(const chosen of ['#ffffff','#000000','#ff1493','#7f3a08','#00ff00']){
  assert.equal(normalizeDocumentDesign({color:chosen},'bill').color,chosen);
  assert.equal(normalizeDocumentDesign({color:chosen},'contract').color,chosen);
 }
 assert.equal(normalizeDocumentDesign({color:'url(invalid)'}).color,b.color);
});

test('templates preserve editable text while rejecting unknown keys and untrusted logos',()=>{
 const raw={template:DOCUMENT_TEMPLATES.contract,color:'#ab18cf',logoMode:'custom',logo,content:{defaultTitle:'تعهدنامه جدید',footer:'متن جدید',unknownKey:'discard'}};
 const normalized=normalizeDocumentDesign(raw);
 assert.equal(normalized.color,'#ab18cf');assert.equal(normalized.logo,logo);
 assert.equal(normalized.content.defaultTitle,'تعهدنامه جدید');
 assert.equal(normalized.content.unknownKey,undefined);
 assert.equal(normalizeDocumentDesign({...raw,logo:'javascript:alert(1)'}).logo,'');
 assert.equal(normalizeDocumentDesign({...raw,content:{intro:'a'.repeat(4000)}}).content.intro.length,3000);
});

test('bill document layout 1 prints edited labels, custom colour, logo, and proper escaping',()=>{
 const prefs={shopName:'عمده‌فروشی نمونه',billDesign:{color:'#fb00f3',logo,logoMode:'custom',content:{saleTitle:'بل اختصاصی',subtitle:'بخش فروش <script>',itemsHeading:'لست اجناس',totalsHeading:'حساب نهایی',footer:'سپاس از خرید شما'}}};
 const html=invoicePrintHtml(bill,{},prefs);
 for(const v of ['print-bill','بل اختصاصی','لست اجناس','حساب نهایی','سپاس از خرید شما','#fb00f3',logo,'dir="rtl"','size:A4']) assert.ok(html.includes(v),v);
 assert.ok(html.includes('&lt;script&gt;'));assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<main class="print-page print-contract"'));
 assert.equal(resolveDocumentContent(prefs,'contract').defaultTitle,DOCUMENT_DEFAULT_CONTENT.contract.defaultTitle);
});

test('contract document layout 4 uses editable terms and header, but not sale prices or quantities',()=>{
 const prefs={shopName:'عمده‌فروشی نمونه',contractDesign:{color:'#ff6020',logoMode:'custom',logo,content:{defaultTitle:'توافق‌نامه مشتری',subtitle:'سند تعهدات',intro:'متن مقدمه شخصی',payment:'موافقت پرداخت',guarantee:'تعهدات ضامن',delivery:'موافقت طرفین',final:'قبول شد',footer:'نسخه دوم معتبر است'}}};
 const customer={name:'احمد',saleContract:{enabled:true,percent:25,days:28}};
 const snapshot=contractSnapshot(customer,prefs,bill);
 const html=contractPrintHtml(snapshot,bill,'shamsi',prefs);
 for(const v of ['print-contract','توافق‌نامه مشتری','سند تعهدات','متن مقدمه شخصی','موافقت پرداخت','تعهدات ضامن','موافقت طرفین','قبول شد','نسخه دوم معتبر است',logo,'#ff6020'])assert.ok(html.includes(v),v);
 for(const v of ['۷۰۰ AFN','قیمت واحد AFN','مجموع قیمت اجناس','پرداخت‌شده','برنج'])assert.ok(!html.includes(v),v);
 assert.equal(snapshot.title,'توافق‌نامه مشتری');
 assert.equal(resolveDocumentDesign(prefs,'bill').logo,'');
});

test('customer edited terms take precedence over global template; snapshots retain their terms',()=>{
 const p={shopName:'فروشگاه',contractDesign:{content:{payment:'متن پیش‌فرض جدید'}}};
 const customer={name:'مشتری',saleContract:{enabled:true,payment:'تعهد ویژه مشتری',percent:25,days:28}};
 const snap=contractSnapshot(customer,p,bill);
 assert.equal(snap.payment,'تعهد ویژه مشتری');
 p.contractDesign.content.payment='متن جایگزین';
 assert.equal(snap.payment,'تعهد ویژه مشتری');
 assert.equal(contractDraft({},p.contractDesign.content).payment,'متن جایگزین');
});

test('settings permission confirmation notices changed document content, and UI provides text and HEX editing',()=>{
 const old={billDesign:normalizeDocumentDesign(),contractDesign:normalizeDocumentDesign({},'contract')};
 assert.deepEqual(describeSettingsChanges(old,{billDesign:{...old.billDesign,content:{...old.billDesign.content,footer:'تشکر'}}}),['تغییر طرح چاپ بل‌های فروش و خرید']);
 assert.deepEqual(describeSettingsChanges(old,{contractDesign:{...old.contractDesign,content:{...old.contractDesign.content,final:'شرایط جدید'}}}),['تغییر طرح چاپ قرارداد مشتریان']);
 const source=fs.readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
 for(const token of ['طرح ۱ — Minimal Navy','طرح ۴ — Clean Blue Contract','ویرایش متن و عنوان‌های بل','ویرایش متن پیش‌فرض قرارداد','کد رنگ (HEX)','بارگذاری لوگوی بل‌های فروش و خرید','بارگذاری لوگوی قرارداد'])assert.ok(source.includes(token),token);
});
