// Pure calculations for the frontend demonstration. No server, tax engine or ledger posting.
export const AFGHAN_MONTHS = ['حمل', 'ثور', 'جوزا', 'سرطان', 'اسد', 'سنبله', 'میزان', 'عقرب', 'قوس', 'جدی', 'دلو', 'حوت'];
export const DEFAULT_WAREHOUSE = 'default';

export function toLatinDigits(value) {
  return String(value ?? '').replace(/[۰-۹٠-٩]/g, char => {
    const n = char.charCodeAt(0);
    return String(n >= 0x06F0 && n <= 0x06F9 ? n - 0x06F0 : n - 0x0660);
  });
}

export function afghanCalendarParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-US-u-ca-persian-nu-latn', {
    year: 'numeric', month: 'numeric', day: 'numeric'
  }).formatToParts(date);
  const record = Object.fromEntries(parts.map(p => [p.type, p.value]));
  return { year: Number(record.year), month: Number(record.month), day: Number(record.day) };
}

// Supports both '21 عقرب 1405' and '1405/08/21'. Zero means unknown date.
export function afghanDateOrder(value) {
  const source = toLatinDigits(value).replaceAll('،', ' ').trim();
  if (!source) return 0;
  let year, month, day;
  let match = source.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (match) [, year, month, day] = match;
  else {
    match = source.match(/^(\d{1,2})\s+([^\s]+)\s+(\d{4})$/);
    if (!match) return 0;
    [, day, month, year] = match;
    // Compatibility for historical records imported with Iranian month labels.
    const legacyMonths = ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'];
    const afghanIndex = AFGHAN_MONTHS.indexOf(month);
    month = afghanIndex >= 0 ? afghanIndex + 1 : legacyMonths.indexOf(month) + 1;
  }
  const y = Number(year), m = Number(month), d = Number(day);
  if (y < 1300 || y > 1600 || m < 1 || m > 12 || d < 1 || d > 31 || (m > 6 && d > 30)) return 0;
  return y * 10000 + m * 100 + d;
}

export function isInAfghanRange(value, from = '', to = '') {
  const low = from ? afghanDateOrder(from) : 0;
  const high = to ? afghanDateOrder(to) : 0;
  if (!low && !high) return true;
  const date = afghanDateOrder(value);
  return date > 0 && (!low || date >= low) && (!high || date <= high);
}

export const cash = value => Math.round((Number(value) || 0) * 100) / 100;
export const positive = value => Number.isFinite(Number(value)) && Number(value) > 0;

function productFor(item, products) {
  return products.find(p => String(p.id) === String(item.productId || '___')) ||
    products.find(p => String(p.name || '').trim() === String(item.product || '').trim()) || null;
}
export const findProduct = productFor;

export function inventoryState(data) {
  const products = data.products || [];
  const positions = new Map();
  const counters = { incoming: 0, outgoing: 0, transfers: 0, movements: [] };
  const key = (productId, warehouseId) => `${String(productId)}|${String(warehouseId || DEFAULT_WAREHOUSE)}`;
  function mutate(productId, warehouseId, qty) {
    const k = key(productId, warehouseId);
    positions.set(k, cash((positions.get(k) || 0) + qty));
  }
  for (const product of products) {
    mutate(product.id, product.warehouseId || DEFAULT_WAREHOUSE, Number(product.quantity || 0));
  }
  for (const invoice of data.invoices || []) {
    const factor = invoice.type === 'sale' ? -1 : invoice.type === 'purchase' || invoice.type === 'return' ? 1 : 0;
    if (!factor) continue;
    for (const item of invoice.items || []) {
      const product = productFor(item, products);
      if (!product) continue; // old unmatched free-text invoice lines are not stock movements
      const qty = Number(item.quantity || 0);
      if (!(qty > 0)) continue;
      const warehouseId = item.warehouseId || invoice.warehouseId || product.warehouseId || DEFAULT_WAREHOUSE;
      mutate(product.id, warehouseId, factor * qty);
      if (factor > 0) counters.incoming += qty;
      else counters.outgoing += qty;
      counters.movements.push({ id: `${invoice.id}-${product.id}`, date: invoice.date, product: product.name, warehouseId,
        type: invoice.type, quantity: factor * qty, source: `بل #${invoice.number || invoice.id}` });
    }
  }
  for (const movement of data.stockMovements || []) {
    const qty = Number(movement.quantity || 0);
    if (!(qty > 0)) continue;
    if (movement.kind === 'transfer') {
      mutate(movement.productId, movement.fromWarehouseId, -qty);
      mutate(movement.productId, movement.toWarehouseId, qty);
      counters.transfers += qty;
    } else {
      const sign = movement.kind === 'out' ? -1 : 1;
      mutate(movement.productId, movement.warehouseId || DEFAULT_WAREHOUSE, sign * qty);
      if (sign === 1) counters.incoming += qty;
      else counters.outgoing += qty;
    }
    const p = products.find(p => String(p.id) === String(movement.productId));
    counters.movements.push({ ...movement, product: p?.name || 'محصول حذف‌شده', type: movement.kind,
      quantity: movement.kind === 'transfer' ? qty : movement.kind === 'out' ? -qty : qty,
      source: movement.kind === 'transfer' ? 'انتقال گدام' : 'اصلاح موجودی' });
  }
  const get = (productId, warehouseId = DEFAULT_WAREHOUSE) => positions.get(key(productId, warehouseId)) || 0;
  const total = productId => [...positions.entries()].filter(([k]) => k.startsWith(`${String(productId)}|`)).reduce((sum, [, qty]) => sum + qty, 0);
  const rows = products.map(product => ({ ...product, quantity: cash(total(product.id)), openingQuantity: Number(product.quantity || 0) }));
  const totalQuantity = rows.reduce((s,p) => s + Number(p.quantity || 0), 0);
  const value = rows.reduce((s,p) => s + Number(p.quantity || 0)*Number(p.cost || 0), 0);
  return { get, total, rows, positions, totalQuantity: cash(totalQuantity), value: cash(value), ...counters };
}

export function saleStockError(data, draftItems, warehouseId) {
  const state = inventoryState(data);
  const required = new Map();
  for (const line of draftItems) {
    const product = productFor(line, data.products || []);
    if (!product) return `محصول «${line.product || 'نامشخص'}» ثبت نشده است. ابتدا آن را در محصولات ایجاد کنید.`;
    const qty = Number(line.quantity);
    if (!Number.isFinite(qty) || qty <= 0) return 'تعداد هر محصول باید بیشتر از صفر باشد.';
    const k = String(product.id);
    required.set(k, { product, qty: (required.get(k)?.qty || 0) + qty });
  }
  for (const {product, qty} of required.values()) {
    const available = state.get(product.id, warehouseId || DEFAULT_WAREHOUSE);
    if (qty > available) return `موجودی «${product.name}» در این گدام کافی نیست (موجود: ${available}، فروش: ${qty}).`;
  }
  return '';
}

export function payrollAmounts(item) {
  const base = Math.max(0, Number(item.base || 0));
  const bonus = Math.max(0, Number(item.bonus || 0));
  const deduction = Math.max(0, Number(item.deduction || 0));
  const insurance = Math.max(0, Number(item.employerInsurance || 0));
  return { gross: cash(base + bonus), deduction: cash(deduction), net: cash(Math.max(0, base + bonus - deduction)), insurance: cash(insurance) };
}

export function journalBalances(journals) {
  const accounts = new Map();
  for (const j of journals || []) {
    for (const row of j.rows || []) {
      const name = (row.account || '').trim();
      if (!name) continue;
      const item = accounts.get(name) || { account: name, debit: 0, credit: 0 };
      item.debit = cash(item.debit + Number(row.debit || 0));
      item.credit = cash(item.credit + Number(row.credit || 0));
      accounts.set(name, item);
    }
  }
  return Array.from(accounts.values()).sort((a,b) => a.account.localeCompare(b.account, 'fa'));
}

export function reportSummary(data, from = '', to = '') {
  const invoices = (data.invoices || []).filter(x => isInAfghanRange(x.date, from, to));
  const expenses = (data.expenses || []).filter(x => isInAfghanRange(x.date, from, to));
  const payroll = (data.payroll || []).filter(x => x.status === 'paid' && isInAfghanRange(x.paidDate || x.date, from, to));
  const sum = (arr, key) => cash(arr.reduce((s,x) => s + Number(x[key] || 0), 0));
  const sales = invoices.filter(x => x.type === 'sale');
  const purchases = invoices.filter(x => x.type === 'purchase');
  const returns = invoices.filter(x => x.type === 'return');
  return {
    sales: sum(sales, 'total'), purchases: sum(purchases, 'total'), returns: sum(returns, 'total'),
    received: sum(sales, 'paid'), receivable: sum(sales, 'balance'),
    expenses: sum(expenses, 'amount'), paidPayroll: cash(payroll.reduce((s,x) => s+payrollAmounts(x).net,0)),
    invoiceCount: invoices.length, expensesCount: expenses.length, payrollCount: payroll.length,
    invoices, expensesRows: expenses, payrollRows: payroll
  };
}
