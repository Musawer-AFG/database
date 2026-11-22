import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PAGE_PATHS, pathForPage, pageForPath, activeSidebarPage} from '../src/utils/pageRoutes.js';

const source = readFileSync(new URL('../src/App.jsx',import.meta.url),'utf8');
const mount = readFileSync(new URL('../src/main.jsx',import.meta.url),'utf8');
const theme = readFileSync(new URL('../src/styles/theme.css',import.meta.url),'utf8');
const vercel = JSON.parse(readFileSync(new URL('../vercel.json',import.meta.url),'utf8'));

test('every page has its own distinct, reversible React Router URL',()=>{
  const allPaths=Object.values(PAGE_PATHS);
  assert.ok(allPaths.length >= 31);
  assert.equal(new Set(allPaths).size,allPaths.length);
  for(const [page,path] of Object.entries(PAGE_PATHS)) {
    assert.equal(pathForPage(page),path);
    assert.equal(pageForPath(path),page);
    assert.equal(pageForPath(`${path}/`),page);
  }
  assert.equal(pageForPath('/unrecognized'),null);
});

test('exactly one sidebar link can be active for each location',()=>{
  for(const path of Object.values(PAGE_PATHS)) {
    const active=Object.keys(PAGE_PATHS).filter(id=>activeSidebarPage(path,id));
    assert.equal(active.length,1,`wrong current item for ${path}`);
  }
  assert.ok(activeSidebarPage('/sales','sales'));
  assert.ok(!activeSidebarPage('/purchases','sales'));
  assert.ok(!activeSidebarPage('/warehouse/products','warehouseDashboard'));
});

test('sidebar uses NavLink for URL based active state rather than stale selected state',()=>{
  assert.match(mount,/BrowserRouter[\s\S]*<App \/>/);
  assert.match(source,/<NavLink[\s\S]*to=\{pathForPage\(item.id\)\}/);
  assert.match(source,/className=\{\(\{isActive\}\) => `side-nav-link/);
  assert.match(source,/const page = pageForPath\(location\.pathname\)/);
  assert.match(source,/useNavigate\(\)/);
  assert.doesNotMatch(source,/\[page, setPage\] = useState/);
  assert.doesNotMatch(source,/groupHasActivePage/);
});

test('accordion open/hover is not styled as selected page',()=>{
  assert.ok(theme.includes('only the current link is highlighted'));
  assert.ok(!theme.includes(':root .side-nav-heading[aria-expanded="true"],:root .sidebar-brand-home:hover'));
});

test('Vercel refreshing a deep link serves SPA entrypoint',()=>{
  assert.deepEqual(vercel.rewrites,[{source:'/(.*)',destination:'/index.html'}]);
});
