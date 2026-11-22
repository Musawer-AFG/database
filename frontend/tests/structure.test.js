import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';
const frontend=join(dirname(fileURLToPath(import.meta.url)), '..');
test('app entry and feature modules have the expected structure',()=>{
  for(const name of ['src/App.jsx','src/App.jsx','src/pages/Warehouses/ShipmentsPage.jsx',
    'src/pages/Accounting/TraderAccountsPage.jsx','src/pages/Reports/ProfitAnalysisPage.jsx',
    'src/services/business.js','src/utils/afghanCalendar.js','src/locales/dari.js',
    'src/offline/indexedDB.js']) assert.equal(existsSync(join(frontend,name)),true,name);
});
