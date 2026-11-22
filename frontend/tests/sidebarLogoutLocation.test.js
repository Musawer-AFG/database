import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const jsx = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../src/styles/responsive.css', import.meta.url), 'utf8');

test('logout is removed from sidebar while remaining available in top account menu', () => {
  assert.equal(jsx.includes('className="sidebar-logout"'), false);
  assert.match(jsx, /className="account-menu-danger"[^\n]*logout\(\)/);
});

test('sidebar navigation keeps a scrollable area', () => {
  assert.match(css, /\.sidebar-nav\s*\{\s*min-height:0;\s*overscroll-behavior:contain;/);
});
