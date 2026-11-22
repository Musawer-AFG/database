import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';

const read=(filename)=>readFileSync(new URL('../'+filename,import.meta.url),'utf8');

test('Excel examples describe workflows, not an upload requirement',()=>{
 const pkg=JSON.parse(read('package.json'));
 const main=read('src/App.jsx');
 const workflows=read('src/pages/Accounting/TradeWorkflows.jsx');
 const routes=read('src/utils/pageRoutes.js');
 assert.equal(pkg.dependencies['read-excel-file'],undefined);
 assert.equal(existsSync(new URL('../src/excelReconciliation.js',import.meta.url)),false);
 for (const text of [main,workflows,routes]) {
  assert.doesNotMatch(text,/ExcelReview|excelReview|read-excel-file|excel-review|\.xlsx/i);
 }
 assert.doesNotMatch(workflows,/<input[^>]+type=["']file["']/);
 assert.match(main,/ShipmentsPage/);
 assert.match(main,/TraderAccountsPage/);
 assert.match(main,/ProfitAnalysisPage/);
});
