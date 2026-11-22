import test from 'node:test';
import assert from 'node:assert/strict';
import { emptyPurchaseProduct, createPurchaseCatalogProduct } from '../src/services/purchaseProductCatalog.js';

test('quick purchase product captures the same catalog metadata as Products', () => {
  const result = createPurchaseCatalogProduct({
    name:' برنج درجه یک ',code:'A-1',sstid:'S-3',group:'برنج',unit:'بوری',
    quantity:240,warehouseId:'other',cost:'700',price:'900',tax:'0',reorder:'10'
  },[],'selected-warehouse');
  assert.deepEqual(result,{
    name:'برنج درجه یک',code:'A-1',sstid:'S-3',group:'برنج',unit:'بوری',
    quantity:0,warehouseId:'selected-warehouse',cost:700,price:900,tax:0,reorder:10
  });
});
test('new catalog product has zero opening stock to avoid doubling purchase quantity', () => {
  assert.equal(emptyPurchaseProduct('w1').quantity,0);
  assert.equal(createPurchaseCatalogProduct({name:'شکر',quantity:500},[],'w1').quantity,0);
});
test('product validation rejects duplicates and invalid prices', () => {
  assert.throws(()=>createPurchaseCatalogProduct({name:'برنج'},[{name:'برنج'}]),/از قبل/);
  assert.throws(()=>createPurchaseCatalogProduct({name:'شکر',price:'-4'}),/قیمت|price/);
  assert.throws(()=>createPurchaseCatalogProduct({name:'شکر',reorder:'bad'}),/معتبر/);
  assert.throws(()=>createPurchaseCatalogProduct({name:'شکر',tax:101}),/۱۰۰/);
});
