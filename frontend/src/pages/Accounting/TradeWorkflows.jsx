import React,{useMemo,useState} from 'react';
import {afghanCalendarParts, afghanDateOrder} from '../../services/business.js';
import {TRADE_CURRENCIES,TRADE_CURRENCY_LABELS,shipmentCost,partyStatement,averageLandedCosts,profitSummary} from '../../services/tradeAccounting.js';
import {Download,Plus,Trash2,Printer} from 'lucide-react';
import '../../styles/tradeWorkflows.css';
import {CalendarModeContext} from '../../context/calendarMode.js';
import {afghanFromGregorian,gregorianFromAfghan,formatCalendarDate} from '../../utils/afghanCalendar.js';
import {quoteLabel} from '../../utils/currency.js';
import GroupedNumberInput from '../../components/forms/GroupedNumberInput.jsx';
import {accountStatementHtml} from '../../utils/accountStatementPrint.js';
import {printHtml} from '../../utils/invoicePrint.js';

const today=()=>{const p=afghanCalendarParts();return `${p.year}/${String(p.month).padStart(2,'0')}/${String(p.day).padStart(2,'0')}`;};
const money=x=>`${Number(x||0).toLocaleString('en-US',{maximumFractionDigits:2})} AFN`;
const nums=x=>Number(x||0).toLocaleString('en-US',{maximumFractionDigits:2});
const download=(name,text)=>{const a=document.createElement('a');const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
function TradeDateInput({value,onChange}) {
 const mode=React.useContext(CalendarModeContext);
 return mode==='gregorian'?<input type="date" className="gregorian-date-picker" value={gregorianFromAfghan(value)} onChange={e=>onChange(afghanFromGregorian(e.target.value))}/>:
  <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder="1405/01/10" inputMode="numeric"/>;
}
const Field=({name,children})=><label className="trade-field"><span>{name}</span>{children}</label>;
const emptyCost=()=>({id:`draft-${Math.random().toString(36).slice(2,8)}`,description:'',amount:'',currency:'AFN',rate:'',paid:false});
const emptyShipment=()=>({reference:'',date:today(),purchaseInvoiceId:'',origin:'',destination:'',containerCount:1,tonnes:'',costs:[emptyCost()],notes:''});

export function ShipmentsPage({data,onAdd,onDelete}) {
 const [form,setForm]=useState(emptyShipment);const [error,setError]=useState('');const [open,setOpen]=useState(false);
 const purchases=(data.invoices||[]).filter(i=>i.type==='purchase'&&!(data.shipments||[]).some(s=>String(s.purchaseInvoiceId)===String(i.id)));
 const update=(k,v)=>setForm(f=>({...f,[k]:v}));
 const updateCost=(idx,k,v)=>setForm(f=>({...f,costs:f.costs.map((c,i)=>i===idx?{...c,[k]:v}:c)}));
 const submit=e=>{e.preventDefault();try {if(!onAdd)throw Error('شما صلاحیت ثبت محموله ندارید.');const ok=onAdd(form);if(ok!==false){setForm(emptyShipment());setOpen(false);setError('');}} catch(e){setError(e.message);}};
 return <div className="trade-page" dir="rtl">
  <div className="trade-heading"><div><h2>مدیریت کانتنرها و محموله‌ها</h2><p>هر محموله را به یک بل خرید وصل کنید؛ مصارف اضافه به قیمت تمام‌شده اضافه می‌شوند، نه دوباره به بل.</p></div>{onAdd&&<button className="btn primary" onClick={()=>setOpen(x=>!x)}><Plus size={16}/> ثبت محموله</button>}</div>
  {open&&<form className="trade-panel trade-form" onSubmit={submit}><h3>ثبت محموله و قیمت تمام‌شده</h3>
   <div className="trade-grid">
    <Field name="بل خرید مرتبط"><select required value={form.purchaseInvoiceId} onChange={e=>update('purchaseInvoiceId',e.target.value)}><option value="">انتخاب بل خرید</option>{purchases.map(i=><option key={i.id} value={i.id}>بل #{i.number} — {i.party||'عرضه‌کننده نامعلوم'} — {money(i.total)}</option>)}</select></Field>
    <Field name="نمبر یا نام کانتنر / محموله"><input required value={form.reference} onChange={e=>update('reference',e.target.value)} placeholder="مثلاً ۶ کانتنر برنج مقرب"/></Field>
    <Field name="تاریخ"><TradeDateInput value={form.date} onChange={value=>update('date',value)}/></Field>
    <Field name="تعداد کانتنر"><GroupedNumberInput  min="1" step="1" value={form.containerCount} onChange={e=>update('containerCount',e.target.value)}/></Field>
    <Field name="وزن خالص مجموعه (تن)"><GroupedNumberInput  min="0.001" step="any" value={form.tonnes} onChange={e=>update('tonnes',e.target.value)} placeholder="25"/></Field>
    <Field name="مبدأ"><input value={form.origin} onChange={e=>update('origin',e.target.value)} placeholder="بندر عباس"/></Field>
    <Field name="مقصد"><input value={form.destination} onChange={e=>update('destination',e.target.value)} placeholder="کابل"/></Field>
   </div>
   <div className="trade-subheading"><h4>مصارف جداگانه محموله</h4><button type="button" className="btn secondary" onClick={()=>setForm(f=>({...f,costs:[...f.costs,emptyCost()]}))}>+ افزودن مصرف</button></div>
   {form.costs.map((c,i)=><div className="trade-cost-row" key={c.id}>
    <Field name="شرح مصرف"><input value={c.description} onChange={e=>updateCost(i,'description',e.target.value)} placeholder="کرایه موتر / محصول گمرک / کمیشن"/></Field>
    <Field name="مبلغ"><GroupedNumberInput  min="0" step="any" value={c.amount} onChange={e=>updateCost(i,'amount',e.target.value)}/></Field>
    <Field name="واحد پول"><select value={c.currency} onChange={e=>updateCost(i,'currency',e.target.value)}>{TRADE_CURRENCIES.map(k=><option key={k} value={k}>{k}</option>)}</select></Field>
    {c.currency!=='AFN'&&<Field name={`نرخ ${quoteLabel(c.currency)} به افغانی`}><GroupedNumberInput  min="0" step="any" value={c.rate} onChange={e=>updateCost(i,'rate',e.target.value)}/></Field>}
    <label className="trade-check"><input type="checkbox" checked={c.paid} onChange={e=>updateCost(i,'paid',e.target.checked)}/> پرداخت نقدی شد</label>
    <button type="button" className="trade-remove" aria-label="حذف مصرف" onClick={()=>setForm(f=>({...f,costs:f.costs.filter((_,n)=>n!==i)}))}><Trash2 size={18}/></button>
   </div>)}
   <Field name="ملاحظات"><textarea rows="2" value={form.notes} onChange={e=>update('notes',e.target.value)}/></Field>
   <p className="trade-hint">فقط مصارفی را درج کنید که قبلاً در بل خرید اضافه نشده باشند. مصارف نقدی از صندوق کم می‌شوند؛ مصارف نپرداخته در حساب‌های پرداختنی محموله ثبت می‌گردند.</p>
   {error&&<p className="trade-error" role="alert">{error}</p>}
   <div className="trade-actions"><button className="btn primary" type="submit">ثبت محموله</button><button type="button" className="btn secondary" onClick={()=>setOpen(false)}>لغو</button></div>
  </form>}
  <div className="trade-panel"><h3>فهرست محموله‌ها</h3><div className="trade-scroll"><table className="trade-table"><thead><tr><th>محموله</th><th>بل خرید</th><th>کانتنر</th><th>وزن</th><th>قیمت خرید</th><th>مصارف اضافه</th><th>قیمت تمام‌شده</th><th>فی تن</th><th>فروش ثبت‌شده</th><th>مفاد تخمینی</th><th>عملیات</th></tr></thead><tbody>
    {(data.shipments||[]).map(s=>{const x=shipmentCost(data,s);const sales=(data.invoices||[]).filter(i=>i.type==='sale'&&String(i.shipmentId)===String(s.id));const saleAfn=sales.reduce((sum,i)=>sum+Number(i.total||0),0);const soldTonnes=sales.reduce((sum,i)=>sum+Number(i.soldTonnes||0),0);
    return <tr key={s.id}><td>{s.reference}<small>{s.origin} → {s.destination}</small></td><td>#{x.invoice?.number||'—'}</td><td>{s.containerCount}</td><td>{nums(s.tonnes)} تن</td><td>{money(x.purchase)}</td><td>{money(x.additional)}</td><td><b>{money(x.total)}</b></td><td>{money(x.perTonne)}</td><td>{money(saleAfn)} ({nums(soldTonnes)} تن)</td><td>{money(saleAfn-x.perTonne*soldTonnes)} <small>فقط فروشات مرتبط</small></td><td>{onDelete&&<button className="trade-link" onClick={()=>{if(window.confirm('این محموله و مصارف ثبت‌شده آن حذف شود؟'))onDelete(s.id);}}>حذف</button>}</td></tr>})}
    {!(data.shipments||[]).length&&<tr><td colSpan="11" className="trade-empty">هنوز محموله ثبت نشده است. ابتدا یک بل خرید بسازید.</td></tr>}
   </tbody></table></div></div>
 </div>;
}

const emptySettlement=()=>({date:today(),partyType:'customer',party:'',kind:'receive',amount:'',currency:'AFN',rate:'',viaCash:true,invoiceId:'',thirdParty:'',notes:''});
export function TraderAccountsPage({data,onAdd,onDelete,preferences={}}){
 const [type,setType]=useState('customer');const [party,setParty]=useState('');const [form,setForm]=useState(emptySettlement);const [error,setError]=useState('');const [open,setOpen]=useState(false);
 const parties=type==='customer'?(data.customers||[]):(data.suppliers||[]);
 const selected=parties.some(p=>p.name===party)?party:'';
 const mode=React.useContext(CalendarModeContext);
 const selectedRecord=parties.find(p=>p.name===selected)||{};
 const statement=useMemo(()=>selected?partyStatement(data,type,selected):{lines:[],debit:0,credit:0,balance:0},[data,type,selected]);
 const printStatement=()=>printHtml(accountStatementHtml({title:'کهاته',shopName:preferences.shopName,shopLogo:preferences.shopLogo,partyName:selected,partyType:type==='customer'?'مشتری':'عرضه‌کننده',details:[['کود حساب',selectedRecord.code],['نمبر تیلفون',selectedRecord.phone],['نمبر موبایل',selectedRecord.mobile],['آدرس',selectedRecord.address]],debit:statement.debit,credit:statement.credit,balance:statement.balance,date:today(),mode,headers:['تاریخ','شرح','دبیت (AFN)','کریدیت (AFN)','مانده (AFN)','مبلغ اصلی'],rows:statement.lines.map(x=>[formatCalendarDate(x.date,mode),x.description,nums(x.debit),nums(x.credit),nums(x.balance),x.sourceAmount==null?(x.currency||'AFN'):`${nums(x.sourceAmount)} ${x.currency||'AFN'}`])}));
 const openInvoices=(data.invoices||[]).filter(i=>i.party===selected&&i.type===(type==='customer'?'sale':'purchase')&&Number(i.balance)>0);
 const edit=(k,v)=>setForm(f=>({...f,[k]:v}));
 const submit=e=>{e.preventDefault();try{if(!onAdd)throw Error('شما صلاحیت ثبت تصفیه حساب ندارید.');const ok=onAdd({...form,partyType:type,party:selected});if(ok!==false){setForm({...emptySettlement(),partyType:type,kind:type==='customer'?'receive':'pay'});setError('');setOpen(false);}}catch(err){setError(err.message);}};
 return <div className="trade-page" dir="rtl">
  <div className="trade-heading"><div><h2>کهاته</h2><p>بررسی حساب مشتری و عرضه‌کننده با گردش دبیت، کریدیت، پرداخت‌ها و ماندهٔ جاری.</p></div>{onAdd&&selected&&<button className="btn primary" onClick={()=>{setForm({...emptySettlement(),partyType:type,kind:type==='customer'?'receive':'pay'});setOpen(v=>!v)}}><Plus size={16}/> تصفیه حساب جدید</button>}</div>
  <div className="trade-panel trade-grid"><Field name="نوع حساب"><select value={type} onChange={e=>{setType(e.target.value);setParty('');setOpen(false);}}><option value="customer">مشتریان</option><option value="supplier">عرضه‌کنندگان</option></select></Field><Field name="نام طرف حساب"><select value={selected} onChange={e=>setParty(e.target.value)}><option value="">انتخاب کنید</option>{parties.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}</select></Field></div>
  {selected&&<><div className="trade-stats"><div><span>مجموع دبیت</span><b>{money(statement.debit)}</b></div><div><span>مجموع کریدیت</span><b>{money(statement.credit)}</b></div><div><span>ماندهٔ حساب (دبیت − کریدیت)</span><b>{money(statement.balance)}</b></div></div>
  {open&&<form className="trade-panel trade-form" onSubmit={submit}><h3>ثبت دریافت، پرداخت یا اصلاح حساب</h3><div className="trade-grid">
   <Field name="نوع معامله"><select value={form.kind} onChange={e=>edit('kind',e.target.value)}>{(type==='customer'?[['receive','دریافت پول'],['debit','افزایش قرضداری'],['credit','کاهش قرضداری']]:[['pay','پرداخت به عرضه‌کننده'],['debit','کاهش پرداختنی'],['credit','افزایش پرداختنی']]).map(([v,n])=><option key={v} value={v}>{n}</option>)}</select></Field>
   <Field name="تاریخ"><TradeDateInput value={form.date} onChange={value=>edit('date',value)}/></Field>
   <Field name="مبلغ"><GroupedNumberInput  min="0.01" step="any" required value={form.amount} onChange={e=>edit('amount',e.target.value)}/></Field>
   <Field name="واحد پول"><select value={form.currency} onChange={e=>edit('currency',e.target.value)}>{TRADE_CURRENCIES.map(k=><option key={k} value={k}>{TRADE_CURRENCY_LABELS[k]} ({k})</option>)}</select></Field>
   {form.currency!=='AFN'&&<Field name={`نرخ ${quoteLabel(form.currency)} به افغانی`}><GroupedNumberInput required  min="0" step="any" value={form.rate} onChange={e=>edit('rate',e.target.value)}/></Field>}
   {['receive','pay'].includes(form.kind)&&<Field name="بل مرتبط (اختیاری)"><select value={form.invoiceId} onChange={e=>edit('invoiceId',e.target.value)}><option value="">بدون بل مشخص — علی‌الحساب</option>{openInvoices.map(i=><option key={i.id} value={i.id}>بل #{i.number} — مانده {money(i.balance)}</option>)}</select></Field>}
   <Field name="نام شخص سوم / حواله (اختیاری)"><input value={form.thirdParty} onChange={e=>edit('thirdParty',e.target.value)}/></Field>
   <Field name="یادداشت"><input value={form.notes} onChange={e=>edit('notes',e.target.value)}/></Field>
  </div>
  {['receive','pay'].includes(form.kind)&&<label className="trade-check"><input type="checkbox" checked={form.viaCash} onChange={e=>edit('viaCash',e.target.checked)}/> پول از صندوق نقدی دریافت یا پرداخت شد (اگر حوالهٔ خارج از صندوق بود تیک را بردارید)</label>}
  <p className="trade-hint">برای تصفیهٔ یک قرض مشخص، بل مرتبط را انتخاب کنید تا ماندهٔ همان بل اصلاح گردد. دریافت علی‌الحساب بدون بل، ماندهٔ عمومی را تغییر می‌دهد ولی ماندهٔ بل‌های مشخص را نه.</p>
  {error&&<p className="trade-error" role="alert">{error}</p>}<div className="trade-actions"><button type="submit" className="btn primary">ثبت معامله</button><button className="btn secondary" type="button" onClick={()=>setOpen(false)}>لغو</button></div></form>}
  <div className="trade-panel"><div className="trade-subheading"><h3>صورت حساب: {selected}</h3><div className="heading-actions"><button type="button" className="btn secondary" onClick={printStatement}><Printer size={16}/> چاپ کهاته</button><button className="btn secondary" onClick={()=>download('حساب-'+selected+'.csv','\uFEFF'+[['تاریخ','شرح','دبیت','کریدیت','مانده','واحد پول','مبلغ اصلی'],...statement.lines.map(x=>[x.date,x.description,x.debit,x.credit,x.balance,x.currency,x.sourceAmount])].map(r=>r.map(x=>'"'+String(x??'').replaceAll('"','""')+'"').join(',')).join('\n'))}><Download size={16}/> CSV</button></div></div><div className="trade-scroll"><table className="trade-table"><thead><tr><th>تاریخ</th><th>شرح</th><th>دبیت (AFN)</th><th>کریدیت (AFN)</th><th>مانده (AFN)</th><th>واحد پول اصلی</th></tr></thead><tbody>{statement.lines.map(x=><tr key={x.id}><td>{formatCalendarDate(x.date,mode)}</td><td>{x.description}</td><td>{nums(x.debit)}</td><td>{nums(x.credit)}</td><td><b>{nums(x.balance)}</b></td><td>{x.currency} {x.sourceAmount==null?'':nums(x.sourceAmount)}</td></tr>)}{!statement.lines.length&&<tr><td colSpan="6" className="trade-empty">هنوز معامله‌ای ثبت نشده است.</td></tr>}</tbody></table></div></div>
  </>}
 </div>;
}

export function ProfitAnalysisPage({data}) {
 const summary=profitSummary(data);const costs=averageLandedCosts(data);
 return <div className="trade-page" dir="rtl"><div className="trade-heading"><div><h2>تحلیل قیمت تمام‌شده و مفاد</h2><p>مفاد تخمینی به اساس قیمت تمام‌شده اجناس و مصارف محموله‌ها محاسبه می‌شود. شناسایی دقیق کانتنر فروش‌رفته/FIFO هنوز اضافه نشده است.</p></div></div>
 <div className="trade-stats"><div><span>فروشات خالص</span><b>{money(summary.sales-summary.returns)}</b></div><div><span>بهای اجناس فروش‌رفته</span><b>{money(summary.cogs)}</b></div><div><span>مفاد ناخالص تخمینی</span><b>{money(summary.gross)}</b></div><div><span>مصارف عملیاتی و معاش</span><b>{money(summary.operating+summary.payroll)}</b></div><div><span>مفاد خالص تخمینی</span><b>{money(summary.net)}</b></div></div>
 {summary.missingCostLines>0&&<p className="trade-error">برای {summary.missingCostLines} قلم فروش، قیمت تمام‌شده معتبر موجود نیست. مفاد ممکن است بیشتر از واقع نشان داده شود.</p>}
 <div className="trade-panel trade-profit-simple"><h3>مفاد چگونه حساب شده؟</h3>
  <p className="trade-hint">این یک حساب تخمینی است؛ همه مبلغ‌ها به افغانی اند. علامت منفی یعنی از فروشات کم می‌شود.</p>
  <div className="trade-profit-steps">
    <div><span>فروشات خالص</span><strong>{money(summary.sales-summary.returns)}</strong></div>
    <div><span>منفی: قیمت تمام‌شده اجناس فروش‌رفته</span><strong>− {money(summary.cogs)}</strong></div>
    <div><span>منفی: مصارف و معاشات</span><strong>− {money(summary.operating+summary.payroll)}</strong></div>
    <div className="trade-profit-final"><span>مفاد خالص تخمینی</span><strong>{money(summary.net)}</strong></div>
  </div>
  <small>قیمت تمام‌شده و مفاد در این نسخه تخمینی اند؛ برای حسابرسی نهایی مناسب نیستند.</small>
 </div>
 <div className="trade-panel"><h3>قیمت متوسط هر واحد محصول با مصارف محموله</h3><div className="trade-scroll"><table className="trade-table"><thead><tr><th>محصول</th><th>واحد</th><th>قیمت متوسط تخمینی فی واحد</th><th>قیمت فروش تعیین‌شده</th></tr></thead><tbody>{(data.products||[]).map(p=><tr key={p.id}><td>{p.name}</td><td>{p.unit}</td><td>{money(costs.get(String(p.id))||0)}</td><td>{money(p.price)}</td></tr>)}{!data.products?.length&&<tr><td colSpan="4" className="trade-empty">محصولی ثبت نشده است.</td></tr>}</tbody></table></div></div>
 <p className="trade-hint">نتیجه برای تصمیم‌گیری ابتدایی است، نه صورت مالی حسابرسی‌شده. برگشتی‌ها، اصلاحات موجودی، تفاوت نرخ تبادله پول، اجناس ضایع و ارتباط فروش به کانتنر خاص باید در حسابداری نهایی به‌صورت دقیق ثبت شوند.</p>
 </div>;
}
