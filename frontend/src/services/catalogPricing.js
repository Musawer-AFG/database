import {roundMoney,validExchangeRate} from '../utils/currency.js';
export function catalogPriceForRate(base,rate){return base!==''&&base!=null&&Number.isFinite(Number(base))&&Number(base)>=0&&validExchangeRate(rate)?String(Number((Number(base)/Number(rate)).toFixed(6))):'';}
export function updateInvoiceLine(item,key,value,type,products,rate){
  const next={...item,[key]:value};
  if(key==='price'){delete next.catalogPriceAfn;return next;}
  if(key==='product'){
    delete next.productId;delete next.catalogPriceAfn;
    if(type==='sale'){
      const product=products.find(p=>p.name===value);
      if(product?.price!==''&&product?.price!=null&&Number.isFinite(Number(product.price))&&Number(product.price)>=0)next.catalogPriceAfn=Number(product.price);
      next.price=catalogPriceForRate(next.catalogPriceAfn,rate);
    }
  }
  return next;
}
export function refreshCatalogPrices(items,rate){return items.map(i=>i.catalogPriceAfn!=null?{...i,price:catalogPriceForRate(i.catalogPriceAfn,rate)}:i);}
