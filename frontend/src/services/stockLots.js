// FIFO stock batches in the browser demonstration. Each acquisition keeps its own
// purchase/landed cost and suggested sale price. Do not use this in place of an
// atomic PostgreSQL inventory ledger for production.
const cents = value => Math.round((Number(value)||0)*100)/100;
const positive = value => Number.isFinite(Number(value)) && Number(value)>0;
const wh = value => String(value||'default');
const find = (line, products=[]) => products.find(p=>String(p.id)===String(line.productId||'__')) || products.find(p=>String(p.name||'').trim()===String(line.product||'').trim());
const pos = (p,w)=>`${String(p)}|${wh(w)}`;
const order = date => Number(String(date||'').replace(/\D/g,''))||0;

/** Allocate charges to product lines. Single-product purchase: extras / quantity.
 * Mixed products: allocate by goods value, then divide each allocation by its quantity.
 * Preserve source totals; rounded unit cost is presentation only. */
export function purchaseLineCosts(items=[],extraExpensesTotal=0){
  const rows=items.map(i=>({quantity:Number(i.quantity||0),goods:cents(
    (i.lineTotalAfn!=null?Number(i.lineTotalAfn):i.enteredTotal?Number(i.lineTotal):Number(i.price||0)*Number(i.quantity||0))-Number(i.discount||0))}));
  if(rows.some(r=>!positive(r.quantity)||r.goods<0))throw Error('تعداد و قیمت اجناس خرید باید معتبر باشد.');
  const extras=cents(extraExpensesTotal);
  if(extras<0||!Number.isFinite(extras))throw Error('مصارف اضافی نامعتبر است.');
  const sumGoods=cents(rows.reduce((s,r)=>s+r.goods,0));
  const sumQty=rows.reduce((s,r)=>s+r.quantity,0);
  let allocated=0;
  return rows.map((r,index)=>{
    const share=index===rows.length-1?cents(extras-allocated):cents(extras*(sumGoods>0?r.goods/sumGoods:r.quantity/sumQty));
    allocated=cents(allocated+share);
    return {goodsTotal:r.goods,allocatedExpenses:share,landedTotal:cents(r.goods+share),unitLandedCost:(r.goods+share)/r.quantity};
  });
}

export function fifoStock(data={}){
  const products=data.products||[],queues=new Map(),sales=new Map();
  const getQueue=(id,w)=>{const k=pos(id,w);if(!queues.has(k))queues.set(k,[]);return queues.get(k);};
  const add=(id,w,qty,cost,salePrice,source)=>{
    if(!(Number(qty)>0))return;
    getQueue(id,w).push({qty:Number(qty),unitCost:Number(cost)||0,salePrice:Number(salePrice)||0,source});
  };
  const consume=(id,w,qty)=>{
    let remaining=Number(qty),totalCost=0,totalSuggestedPrice=0;
    const moved=[];
    const queue=getQueue(id,w);
    for(const lot of queue){
      if(remaining<=0)break;
      const taking=Math.min(lot.qty,remaining);
      if(taking<=0)continue;
      totalCost+=taking*lot.unitCost;totalSuggestedPrice+=taking*lot.salePrice;
      lot.qty-=taking;remaining-=taking;
      moved.push({...lot,qty:taking});
    }
    queues.set(pos(id,w),queue.filter(l=>l.qty>1e-9));
    return {cost:cents(totalCost),suggestedTotal:cents(totalSuggestedPrice),missing:cents(remaining),lots:moved};
  };
  for(const p of products)add(p.id,p.warehouseId,Number(p.quantity||0),p.cost,p.price,`opening-${p.id}`);
  const events=[...(data.invoices||[]).map(x=>({...x,eventType:'invoice'})),...(data.stockMovements||[]).map(x=>({...x,eventType:'movement'}))];
  events.sort((a,b)=>order(a.date)-order(b.date)||
    // A purchase on the same day is available before a sale.
    ((a.type==='purchase'?0: a.type==='return'?1: a.eventType==='movement'?2:3)-(b.type==='purchase'?0:b.type==='return'?1:b.eventType==='movement'?2:3))||
    String(a.id).localeCompare(String(b.id),undefined,{numeric:true}));
  for(const event of events){
    if(event.eventType==='invoice'){
      // Legacy saved purchase invoices also need their extra costs allocated.
      let legacyCosts=[];
      if(event.type==='purchase'){
        try{legacyCosts=purchaseLineCosts(event.items||[],Number(event.extraExpensesTotal||0));}catch{}
      }
      for(const [index,line] of (event.items||[]).entries()){
        const product=find(line,products);
        if(!product||!positive(line.quantity))continue;
        const warehouse=line.warehouseId||event.warehouseId||product.warehouseId||'default';
        if(event.type==='purchase'){
          const costs=line.unitLandedCost!=null?Number(line.unitLandedCost):null;
          const lotCost=costs!=null?costs:(legacyCosts[index]?.unitLandedCost??((Number(line.price||0)*Number(line.quantity||0)-Number(line.discount||0)) / Number(line.quantity||1)));
          add(product.id,warehouse,line.quantity,lotCost,line.salePriceAfn??product.price,`purchase-${event.id}-${index}`);
        } else if(event.type==='sale'){
          sales.set(`${event.id}-${index}`,consume(product.id,warehouse,line.quantity));
        } else if(event.type==='return')add(product.id,warehouse,line.quantity,product.cost,product.price,`return-${event.id}-${index}`);
      }
    }else{
      const mv=event,product=products.find(p=>String(p.id)===String(mv.productId));
      if(!product||!positive(mv.quantity))continue;
      if(mv.kind==='transfer'){
        const removed=consume(product.id,mv.fromWarehouseId,mv.quantity);
        for(const lot of removed.lots)add(product.id,mv.toWarehouseId,lot.qty,lot.unitCost,lot.salePrice,lot.source);
      } else if(mv.kind==='out')consume(product.id,mv.warehouseId,mv.quantity);
      else if(mv.kind==='in')add(product.id,mv.warehouseId,mv.quantity,product.cost,product.price,`adjustment-${mv.id}`);
    }
  }
  const warehouseValue=w=>cents([...queues.entries()].filter(([k])=>k.endsWith(`|${wh(w)}`)).reduce((s,[,lots])=>s+lots.reduce((v,l)=>v+l.qty*l.unitCost,0),0));
  const remainingValue=()=>cents([...queues.values()].reduce((s,lots)=>s+lots.reduce((v,l)=>v+l.qty*l.unitCost,0),0));
  const suggestedPrice=(productId,warehouseId,quantity=1,fallback=0)=>{
    const lots=getQueue(productId,warehouseId);let remaining=Math.max(0,Number(quantity)||1),weighted=0,taken=0;
    for(const l of lots){if(remaining<=0)break;const n=Math.min(l.qty,remaining);if(n>0){weighted+=n*(l.salePrice||fallback);taken+=n;remaining-=n;}}
    return taken?cents((weighted+remaining*Number(fallback||0))/(taken+remaining)):cents(fallback);
  };
  return {queues,sales,warehouseValue,remainingValue,suggestedPrice,remaining:(id,w)=>cents(getQueue(id,w).reduce((s,l)=>s+l.qty,0))};
}
