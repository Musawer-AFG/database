import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';

const src = resolve(dirname(fileURLToPath(import.meta.url)), '../src');
const read = path => readFileSync(resolve(src,path), 'utf8');

test('shared UI consistency styles load after the existing app and theme styles', () => {
  const app = read('App.jsx');
  assert.match(app, /import ['"]\.\/styles\/uiConsistency\.css['"]/);
  assert.ok(app.indexOf('styles/uiConsistency.css') > app.indexOf('styles/contractAttendance.css'));
});

test('cash register and expense forms use bottom-aligned action cells', () => {
  const app = read('App.jsx');
  assert.match(app, /className="form-actions action-cell"><button type="submit" className="btn primary"><Save size=\{16\}\/> ثبت حرکت صندوق/);
  assert.match(app, /className="form-actions action-cell">\s*<button className="btn primary">\s*<Save size=\{15\} \/> ثبت مصرف/);
  const styles = read('styles/uiConsistency.css');
  assert.match(styles, /align-items:\s*flex-end/);
});

test('UI stylesheet covers phone layouts and dark card surfaces', () => {
  const styles = read('styles/uiConsistency.css');
  assert.match(styles, /@media\s*\(max-width:\s*720px\)/);
  assert.match(styles, /@media\s*\(max-width:\s*480px\)/);
  assert.match(styles, /:root\[data-theme="dark"\]/);
  assert.match(styles, /\.invoice-entry-card/);
  assert.match(styles, /\.qb-kpi-card/);
});
