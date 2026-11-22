import { DEFAULT_WAREHOUSE } from './business.js';

// Purchase entry adds the actual units to stock; catalog registration must not
// also create opening units, or one purchase would be counted twice.
export function emptyPurchaseProduct(warehouseId = DEFAULT_WAREHOUSE) {
  return {
    name:'', code:'', sstid:'', group:'', unit:'بوری', quantity:0,
    warehouseId:warehouseId || DEFAULT_WAREHOUSE, cost:0, price:0, tax:0, reorder:0,
  };
}

export function createPurchaseCatalogProduct(draft, products = [], invoiceWarehouseId = DEFAULT_WAREHOUSE) {
  const name = String(draft?.name ?? '').trim();
  if (!name) throw Error('نام محصول ضروری است.');
  if ((products || []).some(p => String(p.name || '').trim().toLocaleLowerCase('fa-AF') === name.toLocaleLowerCase('fa-AF'))) {
    throw Error('این محصول از قبل وجود دارد؛ آن را از فهرست انتخاب کنید.');
  }
  const numbers = {};
  for (const key of ['cost','price','tax','reorder']) {
    const input = draft?.[key] ?? 0;
    const value = String(input).trim() === '' ? 0 : Number(input);
    if (!Number.isFinite(value) || value < 0) throw Error(`مقدار «${key}» باید عدد معتبر و غیرمنفی باشد.`);
    numbers[key] = value;
  }
  if(numbers.tax > 100) throw Error('فیصدی مالیات محصول نباید بیشتر از ۱۰۰ باشد.');
  return {
    name,
    code:String(draft?.code || '').trim(),
    sstid:String(draft?.sstid || '').trim(),
    group:String(draft?.group || '').trim(),
    unit:String(draft?.unit || '').trim() || 'بوری',
    quantity:0,
    warehouseId:invoiceWarehouseId || DEFAULT_WAREHOUSE,
    ...numbers,
  };
}
