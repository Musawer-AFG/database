import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { newExtraExpense, validateExtras, normalizeExtraExpenses } from '../src/services/invoiceExtras.js';
import { convertInvoiceToAfn } from '../src/utils/currency.js';

const load = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const source = load('../src/App.jsx');
const invoiceForm = source.slice(source.indexOf('function InvoiceForm('), source.indexOf('function JournalForm('));
const styles = load('../src/styles/contractAttendance.css');

test('no extra expenses is valid for purchase and sales invoices', () => {
  assert.equal(validateExtras([]), '');
  const invoice = convertInvoiceToAfn([{ product: 'برنج', quantity: 2, price: 500, discount: 0 }], 0, 'AFN', {}, []);
  assert.equal(invoice.total, 1000);
  assert.equal(invoice.extraExpensesTotal, 0);
  assert.deepEqual(invoice.extraExpenses, []);
});

test('untouched optional extra row is ignored but incomplete charges are rejected', () => {
  const blank = newExtraExpense();
  assert.equal(validateExtras([blank]), '');
  assert.deepEqual(normalizeExtraExpenses([blank]), []);
  assert.equal(validateExtras([{ ...blank, description:'کرایه موتر' }]).includes('مبلغ'), true);
  assert.equal(validateExtras([{ ...blank, amount: 100 }]).includes('شرح'), true);
  const converted = convertInvoiceToAfn([{ product: 'برنج', quantity: 1, price: 500 }], 0, 'AFN', {}, [blank]);
  assert.equal(converted.total, 500);
  assert.deepEqual(converted.extraExpenses, []);
});

test('opening extra expenses no longer creates a new row automatically', () => {
  assert.match(invoiceForm, /onClick=\{\(\)=>setShowExtras\(v=>!v\)\}/);
  assert.match(invoiceForm, /onClick=\{addExtra\}/);
  assert.match(invoiceForm, /مصارف اضافی اختیاری است/);
});

test('Settings has separate sections and dark mode styles cover new invoice cards', () => {
  const settings = source.slice(source.indexOf('function SettingsPage('), source.indexOf('function DocumentDesignSettings('));
  assert.match(settings, /className="settings-page"/);
  assert.match(styles, /\.settings-page\s*\{[^}]*gap:\s*24px/s);
  for (const klass of ['.invoice-entry-card','.invoice-quick-guide','.business-logo-picker','.invoice-entry-total','.invoice-step-pills span','.mobile-card-table tbody tr']) {
    assert.ok(styles.includes(klass), `${klass} must have dark-mode styling`);
  }
  assert.match(styles, /:root\[data-theme="dark"\]/);
});
