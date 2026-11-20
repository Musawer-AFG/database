// Read-only spreadsheet staging. Never turn arbitrary workbook rows into invoices automatically.
import {cash,afghanDateOrder,toLatinDigits} from './business.js';
import {partyStatement} from './tradeAccounting.js';

export function parseCsv(content) {
  const text=String(content||'').replace(/^\uFEFF/,'');
  const rows=[];let row=[],cell='',quoted=false;
  for(let i=0;i<text.length;i++){
    const c=text[i];
    if(c==='"') {if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}
    else if(c===','&&!quoted){row.push(cell);cell='';}
    else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row);row=[];cell='';}
    else cell+=c;
  }
  row.push(cell);if(row.some(x=>String(x).trim()))rows.push(row);
  return rows;
}
export function excelNumber(value) {
  if(value===null||value===undefined||String(value).trim()==='') return null;
  if(typeof value==='number') return Number.isFinite(value)?value:null;
  const text=toLatinDigits(value).trim().replace(/[,٬\s]/g,'').replace(/[٫،]/g,'.').replace(/[؋$€]/g,'');
  const cleaned=text.replace(/^[^\d.\-(]+/,'').replace(/[^\d.\-]+$/,'');
  const number=Number(cleaned);
  return cleaned&&Number.isFinite(number)?number:null;
}
export function inspectImport(rows,{startRow=2,amountColumn=0,debitColumn=null,creditColumn=null,dateColumn=null,referenceColumn=null,mode='single',comparison=0}={}) {
  const normalized=(Array.isArray(rows)?rows:[]).slice(Math.max(0,Number(startRow)-1));
  const entries=[];const problems=[];
  for(let i=0;i<normalized.length;i++) {
    const row=normalized[i];
    const amount=mode==='double'?null:excelNumber(row[amountColumn]);
    const debit=mode==='double'?excelNumber(row[debitColumn]):null;
    const credit=mode==='double'?excelNumber(row[creditColumn]):null;
    if(mode==='double' ? debit===null&&credit===null : amount===null) continue;
    const date=dateColumn==null?'':String(row[dateColumn]??'').trim();
    const reference=referenceColumn==null?'':String(row[referenceColumn]??'').trim();
    if(date&& !afghanDateOrder(date)) problems.push(`ردیف ${i+startRow}: تاریخ نیاز به بررسی دارد (میلادی یا هجری شمسی؟)`);
    if((amount??0)<0||(debit??0)<0||(credit??0)<0) problems.push(`ردیف ${i+startRow}: مبلغ منفی است؛ جهت معامله را بررسی کنید.`);
    entries.push({sourceRow:i+startRow,date,reference,amount:amount??0,debit:debit??0,credit:credit??0});
  }
  const total= cash(entries.reduce((s,e)=>s+(mode==='double'?e.debit-e.credit:e.amount),0));
  return {entries,total,comparison:cash(comparison),variance:cash(total-comparison),problems:problems.slice(0,50),matched:Math.abs(total-comparison)<0.01,nonEmptyRows:entries.length};
}
export function expectedReconciliationValue(data,type,partyType,party) {
  if(type==='trader') return partyStatement(data,partyType,party).balance;
  const invoices=data.invoices||[];
  if(type==='sales') return cash(invoices.filter(x=>x.type==='sale').reduce((s,x)=>s+Number(x.total||0),0));
  if(type==='purchases') return cash(invoices.filter(x=>x.type==='purchase').reduce((s,x)=>s+Number(x.total||0),0));
  if(type==='expenses') return cash((data.expenses||[]).reduce((s,x)=>s+Number(x.amount||0),0));
  return 0;
}
export function auditCsv(name,rows){
  const escape=x=>`"${String(x??'').replaceAll('"','""')}"`;
  return '\uFEFF'+[['sourceRow','date','reference','amount','debit','credit'],...rows.map(x=>[x.sourceRow,x.date,x.reference,x.amount,x.debit,x.credit])].map(row=>row.map(escape).join(',')).join('\r\n');
}
