import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('App imports Afghan calendar conversion helpers exactly once', () => {
  const source = fs.readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8');
  const matches = [...source.matchAll(/import\s*\{([^}]+)\}\s*from\s*['"]\.\/utils\/afghanCalendar\.js['"]/g)];
  assert.equal(matches.length, 1, 'calendar helpers should be imported in a single statement');
  const names = matches[0][1].split(',').map(x => x.trim().split(/\s+as\s+/).pop());
  assert.equal(new Set(names).size, names.length, 'each imported binding should have a unique name');
  for (const helper of ['afghanFromGregorian', 'gregorianFromAfghan', 'formatCalendarDate', 'normalizedCalendarMode', 'groupedNumber', 'ungroupedNumber']) {
    assert.ok(names.includes(helper), `${helper} must remain imported`);
  }
});
