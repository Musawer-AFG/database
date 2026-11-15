import test from 'node:test';
import assert from 'node:assert/strict';
import {AFGHAN_PROVINCES,AFGHAN_FIELD_CHOICES,dateChoiceParts,buildAfghanDate} from '../src/afghanLocale.js';

test('Afghan province picker contains exactly 34 unique provinces',()=>{
 assert.equal(AFGHAN_PROVINCES.length,34);
 assert.equal(new Set(AFGHAN_PROVINCES).size,34);
 for(const province of ['کابل','هرات','بلخ','ننگرهار','بدخشان','کندهار']) assert.ok(AFGHAN_PROVINCES.includes(province));
});
test('Afghan date picker reads numeric, named Afghan and Persian digit dates',()=>{
 assert.deepEqual(dateChoiceParts('۱۴۰۵/۰۸/۲۲'),{year:1405,month:8,day:22});
 assert.deepEqual(dateChoiceParts('۲۲ عقرب ۱۴۰۵'),{year:1405,month:8,day:22});
 assert.equal(buildAfghanDate({year:1405,month:8,day:22}),'1405/08/22');
 assert.equal(buildAfghanDate({year:1405,month:8,day:31}),'');
});
test('Customer and general accounting category choices are separated',()=>{
 assert.ok(AFGHAN_FIELD_CHOICES.customerType.includes('دکان'));
 assert.ok(AFGHAN_FIELD_CHOICES.accountType.includes('دارایی'));
 assert.equal(AFGHAN_FIELD_CHOICES.status.includes('فعال'),true);
});
