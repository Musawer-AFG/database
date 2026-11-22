import test from 'node:test';
import assert from 'node:assert/strict';
import {readPort,hasDatabaseUrl} from '../src/config/env.js';
test('default API port is valid',()=>assert.equal(readPort(undefined),3001));
test('bad API port is rejected',()=>assert.throws(()=>readPort('0')));
test('missing database URL is not treated as configured',()=>assert.equal(hasDatabaseUrl(''),false));
