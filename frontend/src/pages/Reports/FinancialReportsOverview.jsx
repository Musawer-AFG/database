import React, {useMemo, useState} from 'react';
import {Activity, BarChart3, CalendarDays, CircleDollarSign, Download, FileText, PieChart, Printer, Receipt, TrendingUp, Wallet, AlertTriangle, ArrowLeft} from 'lucide-react';
import {AFGHAN_MONTHS, afghanCalendarParts, afghanDateOrder, isInAfghanRange} from '../../services/business.js';
import {REPORT_TABS, reportDateRange, validReportRange, profitForRange, cashForRange, debtSnapshot, expenseCategories, monthlyFinancialTrends, reportTransactions} from '../../services/reportInsights.js';
import './financialReportsOverview.css';

const number = value => new Intl.NumberFormat('fa-AF',{maximumFractionDigits:2}).format(Number(value)||0);
const afn = value => `${number(value)} ؋`;
const valueOf = v => Number(v)||0;
const COLORS=['#2889db','#39a782','#af85e8','#efad54','#e4758f','#6e9fab','#4d70bb','#aaaf55'];
const tabsById=Object.fromEntries(REPORT_TABS.map(t=>[t.id,t.label]));

function csvDownload(name, rows) {
  // Escape spreadsheet formulas, newlines, commas and quotes in user-entered names.
  const safe = value => {
    if(typeof value==='number' && Number.isFinite(value)) return String(value);
    const s=String(value??'');
    const cleaned=/^[\s]*[=+@-]/.test(s) ? `'${s}` : s;
    return `"${cleaned.replaceAll('"','""')}"`;
  };
  const head=['تاریخ','نوع','شرح','مبلغ (AFN)'];
  const csv='\uFEFF'+[head,...rows.map(row=>[row.date,row.kind,row.name,row.amount])].map(row=>row.map(safe).join(',')).join('\r\n');
  const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob), a=document.createElement('a');
  a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

function ReportTile({icon:Icon,label,value,description,tone='blue'}) {
  return <div className={`qr-tile qr-${tone}`}>
    <span className="qr-tile-icon"><Icon size={19}/></span>
    <div className="qr-tile-content"><span>{label}</span><strong>{value}</strong><small>{description}</small></div>
  </div>;
}

function TrendLines({rows,kind,onMonth}) {
  const values=kind==='cash'?[['incoming','دریافت نقدی'],['outgoing','پرداخت نقدی']]:kind==='profit'?[['sales','فروشات خالص'],['profit','مفاد تخمینی']]:[['sales','فروشات خالص'],['expenses','مصارف و معاشات']];
  const coordinates=rows.map((row,index)=>({x:34+index*50,y:0,...row}));
  const all=rows.flatMap(row=>values.map(([k])=>valueOf(row[k])));
  const ymin=Math.min(0,...all),ymax=Math.max(1,...all),range=ymax-ymin||1;
  const py=value=>Math.max(14,Math.min(174,172-(value-ymin)/range*146));
  const topLines=values.map(([key,label],index)=>({key,label,color:index===0?'#2889db':'#2fa47e',points:coordinates.map(c=>`${c.x},${py(c[key])}`).join(' ')}));
  if(all.every(v=>v===0))return <div className="qr-empty">برای سال انتخاب‌شده هنوز معلوماتی موجود نیست.</div>;
  return <>
    <div className="qr-trend-legend">{topLines.map(l=><span key={l.key}><i style={{background:l.color}}/>{l.label}</span>)}</div>
    <div className="qr-chart-scroll" role="region" aria-label="چارت تغییرات ماهانه" tabIndex={0}>
      <svg className="qr-line-svg" viewBox="0 0 620 204" preserveAspectRatio="none" role="img" aria-label={`چارت ${values.map(v=>v[1]).join(' و ')}`}>
        {[28,66,104,142,180].map(y=><line x1="26" x2="606" y1={y} y2={y} key={y} stroke="currentColor" strokeOpacity=".1" strokeDasharray="4 6"/>)}
        {ymin<0 && <line x1="26" x2="606" y1={py(0)} y2={py(0)} stroke="#a5acb8" strokeWidth="1"/>}
        {topLines.map(l=><g key={l.key}><polyline fill="none" stroke={l.color} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" points={l.points}/>{coordinates.map((c,i)=><circle key={i} cx={c.x} cy={py(c[l.key])} r="3.5" fill={l.color}><title>{`${c.name}: ${afn(c[l.key])}`}</title></circle>)}</g>)}
      </svg>
      <div className="qr-month-labels">{rows.map(row=><button type="button" key={row.month} onClick={()=>onMonth(row.month)} title={`نمایش جزئیات ${row.name}`}>{row.name}</button>)}</div>
    </div>
    <p className="qr-chart-caption">برای دیدن معلومات یک ماه، نام همان ماه را انتخاب کنید. در موبایل چارت قابل حرکت است.</p>
  </>;
}

function ExpenseDonut({categories,onExpenses}) {
  const total=categories.reduce((sum,row)=>sum+valueOf(row.value),0);
  if(!total)return <div className="qr-empty">مصرفی برای این دوره ثبت نشده است.</div>;
  let acc=0;
  const segments=categories.slice(0,6).map((row,index)=>{const start=acc;acc+=row.value/total*360;return {start,end:acc,color:COLORS[index],...row};});
  const remaining=categories.slice(6).reduce((s,row)=>s+row.value,0);
  if(remaining){segments.push({name:'سایر مصارف',value:remaining,start:acc,end:360,color:'#a2aab6'});}
  const background=`conic-gradient(${segments.map(s=>`${s.color} ${s.start}deg ${s.end}deg`).join(',')})`;
  return <div className="qr-donut-layout">
    <div className="qr-donut" style={{background}} role="img" aria-label="نسبت انواع مصارف"><div><span>جمع مصارف</span><strong>{afn(total)}</strong></div></div>
    <div className="qr-expense-list">{segments.map((row,index)=><button type="button" key={`${row.name}-${index}`} onClick={onExpenses} title="مشاهدهٔ مصارف">
      <span className="qr-expense-color" style={{background:row.color}}/><span>{row.name}</span><strong>{number(Math.round(row.value/total*100))}٪</strong>
    </button>)}</div>
  </div>;
}

function ProfitWaterfall({profit}) {
  const items=[
    ['فروش خالص',profit.netSales,'sale'],['بهای جنس فروش‌رفته',profit.cogs,'cost'],['مصارف عملیاتی',profit.expenses,'cost'],
    ['معاشات',profit.wages,'cost'],['مفاد خالص',profit.net,'profit']
  ];
  const max=Math.max(1,...items.map(i=>Math.abs(i[1])));
  return <div className="qr-waterfall">{items.map(([title,value,tone])=><div key={title} className="qr-waterfall-item">
    <div className="qr-waterfall-meta"><span>{title}</span><strong>{afn(value)}</strong></div>
    <div className="qr-waterfall-track"><div className={`qr-waterfall-fill qr-fill-${tone} ${value<0?'negative':''}`} style={{width:`${Math.min(100,Math.max(0,Math.abs(value)/max*100))}%`}}/></div>
  </div>)}<p className="qr-chart-caption">فروش خالص − بهای اجناس فروش‌رفته − مصارف − معاشات = مفاد تخمینی.</p></div>;
}

function DebtBars({debt,onNavigate}) {
  const max=Math.max(1,debt.receivable,debt.payable);
  const items=[{label:'طلبات مشتریان',value:debt.receivable,count:debt.sales.length,target:'debtors',cls:'receive'},
    {label:'قرض‌های عرضه‌کنندگان',value:debt.payable,count:debt.purchases.length,target:'traderAccounts',cls:'pay'}];
  return <div className="qr-debt-bars">{items.map(item=><button type="button" key={item.target} onClick={()=>onNavigate(item.target)}>
    <span className="qr-debt-row"><span>{item.label} <small>({number(item.count)} بل)</small></span><strong>{afn(item.value)}</strong></span>
    <span className="qr-waterfall-track"><span className={`qr-debt-fill ${item.cls}`} style={{width:`${item.value/max*100}%`}}/></span>
  </button>)}<p className="qr-chart-caption">مانده‌ها وضعیت فعلی اند؛ انتخاب دوره آن‌ها را تغییر نمی‌دهد. برای جزییات روی ستون بزنید.</p></div>;
}

function TransactionTable({rows,tab,onNavigate}) {
  const navigate = tab==='sales'?'sales':tab==='expenses'?'expenses':tab==='debts'?'debtors':tab==='cash'?'cashRegister':'reports';
  return <div className="qr-table-wrap" role="region" aria-label="فهرست معاملات" tabIndex={0}>
    <table className="qr-transaction-table"><thead><tr><th>تاریخ</th><th>نوع</th><th>طرف حساب / شرح</th><th>مبلغ (افغانی)</th></tr></thead>
      <tbody>{rows.map((row,index)=><tr key={`${row.id}-${index}`}><td>{row.date||'—'}</td><td>{row.kind}</td><td>{row.name}</td><td className={row.amount<0?'qr-negative':''}>{afn(row.amount)}</td></tr>)}</tbody></table>
    {!rows.length&&<p className="qr-empty">هیچ معامله‌ای برای نمایش پیدا نشد.</p>}
    <div className="qr-table-footer"><span>حداکثر ۱۰۰ ریکارد اخیر نمایش داده می‌شود.</span><button type="button" onClick={()=>onNavigate(navigate)}>دیدن صفحهٔ مربوط <ArrowLeft size={15}/></button></div>
  </div>;
}

export function FinancialReportsOverview({data,openingCash=0,fiscalYear,onNavigate,DatePicker}) {
  const [period,setPeriod]=useState('year');
  const [custom,setCustom]=useState({from:'',to:''});
  const [appliedCustom,setAppliedCustom]=useState({from:'',to:''});
  const [error,setError]=useState('');
  const [tab,setTab]=useState('profit');
  const [year,setYear]=useState(Number(fiscalYear)||afghanCalendarParts().year);
  const range=useMemo(()=>reportDateRange(period,{year,from:appliedCustom.from,to:appliedCustom.to}),[period,appliedCustom.from,appliedCustom.to,year]);
  const effectiveRange=range;
  const profit=useMemo(()=>profitForRange(data,effectiveRange.from,effectiveRange.to),[data,effectiveRange.from,effectiveRange.to]);
  const cashStats=useMemo(()=>cashForRange(data,openingCash,effectiveRange.from,effectiveRange.to),[data,openingCash,effectiveRange.from,effectiveRange.to]);
  const debts=useMemo(()=>debtSnapshot(data),[data]);
  const expenses=useMemo(()=>expenseCategories(data,effectiveRange.from,effectiveRange.to),[data,effectiveRange.from,effectiveRange.to]);
  const monthly=useMemo(()=>monthlyFinancialTrends(data,year,openingCash),[data,year,openingCash]);
  const rows=useMemo(()=>reportTransactions(data,tab,effectiveRange.from,effectiveRange.to),[data,tab,effectiveRange.from,effectiveRange.to]);
  const periodButtons=[['today','امروز'],['month','این ماه'],['year','سال انتخابی'],['all','همه'],['custom','دلخواه']];
  const choosePeriod=value=>{setPeriod(value);setError('');};
  const chooseMonth=month=>{const mm=String(month).padStart(2,'0');const selected={from:`${year}/${mm}/01`,to:`${year}/${mm}/${month<=6?31:30}`};setCustom(selected);setAppliedCustom(selected);setPeriod('custom');setError('');};
  const validated=()=>{const message=validReportRange(custom.from,custom.to);setError(message);if(!message)setAppliedCustom({...custom});return !message;};
  const printReport=()=>window.print();
  const downloadReport=()=>csvDownload(`financial-report-${tab}-${year}.csv`,reportTransactions(data,tab,effectiveRange.from,effectiveRange.to,{limit:0}));
  return <div className="qr-page" dir="rtl">
    <div className="qr-page-head"><div><p className="qr-eyebrow">گزارش‌های مالی / نمای کلی تجارت</p><h2>گزارش‌های تجارت</h2><p>فروش، مفاد تخمینی، جریان پول، مصارف و قرضداری را در یکجا بررسی کنید.</p></div>
      <div className="qr-actions"><button className="btn secondary" type="button" onClick={downloadReport}><Download size={16}/> دریافت CSV</button>
        <button className="btn secondary" type="button" onClick={printReport}><Printer size={16}/> چاپ / PDF</button></div>
    </div>
    <section className="qr-filter" aria-label="فلتر گزارش">
      <div className="qr-range-pills">{periodButtons.map(([key,label])=><button type="button" key={key} className={period===key?'active':''} aria-pressed={period===key} onClick={()=>choosePeriod(key)}>{label}</button>)}</div>
      <div className="qr-filter-year"><label htmlFor="qr-fiscal-year">سال مالی</label><select id="qr-fiscal-year" value={year} onChange={e=>setYear(Number(e.target.value))}>{Array.from({length:11},(_,i)=>afghanCalendarParts().year+2-i).concat(year).filter((x,i,a)=>a.indexOf(x)===i).sort((a,b)=>b-a).map(y=><option key={y} value={y}>{number(y)}</option>)}</select></div>
      {period==='custom'&&<div className="qr-custom-dates"><label>از تاریخ <DatePicker value={custom.from} onChange={v=>setCustom(p=>({...p,from:v}))}/></label><label>تا تاریخ <DatePicker value={custom.to} onChange={v=>setCustom(p=>({...p,to:v}))}/></label><button className="btn primary" type="button" onClick={validated}>نمایش</button></div>}
      {error&&<p className="qr-error" role="alert">{error}</p>}
      <p className="qr-period-caption"><CalendarDays size={15}/> دورهٔ انتخاب‌شده: {effectiveRange.label}{effectiveRange.from&&` • ${effectiveRange.from}`}{effectiveRange.to&&` تا ${effectiveRange.to}`}</p>
    </section>
    <section className="qr-tiles" aria-label="اعداد اصلی تجارت">
      <ReportTile icon={TrendingUp} tone="green" label="فروشات خالص" value={afn(profit.netSales)} description="فروش پس از برگشتی‌ها"/>
      <ReportTile icon={Activity} tone="violet" label="مفاد خالص تخمینی" value={afn(profit.net)} description="بعد از بهای اجناس و مصارف"/>
      <ReportTile icon={Receipt} tone="amber" label="مصارف و معاشات" value={afn(profit.expenses+profit.wages)} description="در دورهٔ انتخاب‌شده"/>
      <ReportTile icon={CircleDollarSign} tone="blue" label="خالص جریان پول" value={afn(cashStats.net)} description="پول ورودی منهای خروجی دوره"/>
      <ReportTile icon={Wallet} tone="cyan" label="طلبات مشتریان" value={afn(debts.receivable)} description="ماندهٔ فعلی، نه فقط این دوره"/>
    </section>
    {profit.missingCostLines>0&&<div className="qr-warning" role="status"><AlertTriangle size={17}/><span>برای {number(profit.missingCostLines)} قلم فروش بهای خرید کامل موجود نیست؛ مفاد ممکن است نادرست باشد. نخست معلومات گدام و خرید را بررسی کنید.</span></div>}
    <div className="qr-tabs" role="tablist" aria-label="دسته‌های گزارش">{REPORT_TABS.map(item=><button key={item.id} type="button" role="tab" aria-selected={tab===item.id} className={tab===item.id?'active':''} onClick={()=>setTab(item.id)}>{item.label}</button>)}</div>
    <div className="qr-report-grid">
      <section className="qr-card qr-trend-card"><header><div><h3>{tab==='profit'?'روند مفاد و فروشات':tab==='sales'?'روند فروشات و مصارف':tab==='cash'?'چارت ورود و خروج پول':tab==='expenses'?'روند فروش و مصارف':'چارت جریان تجارت'}</h3><p>مقایسه به تفکیک ماه‌های سال {number(year)}</p></div><BarChart3 size={19}/></header>
        <TrendLines rows={monthly} kind={tab==='cash'?'cash':tab==='profit'?'profit':'sales'} onMonth={chooseMonth}/>
      </section>
      <section className="qr-card qr-side-card"><header><div><h3>{tab==='expenses'?'تقسیم‌بندی مصارف':tab==='debts'?'طلبات و قرض‌ها':tab==='cash'?'خلاصه صندوق':'مفاد چگونه محاسبه شد؟'}</h3><p>{effectiveRange.label}</p></div>{tab==='expenses'?<PieChart size={19}/>:<FileText size={19}/>}</header>
        {tab==='expenses'?<ExpenseDonut categories={expenses} onExpenses={()=>onNavigate('expenses')}/>
          :tab==='debts'?<DebtBars debt={debts} onNavigate={onNavigate}/>
          :tab==='cash'?<div className="qr-cash-breakdown"><div><span>پول دریافت‌شده</span><strong>{afn(cashStats.in)}</strong></div><div><span>پول پرداخت‌شده</span><strong>{afn(cashStats.out)}</strong></div><div><span>موجودی فعلی صندوق</span><strong>{afn(cashStats.closingBalance)}</strong></div><button className="btn secondary" type="button" onClick={()=>onNavigate('cashRegister')}>رفتن به صندوق</button></div>
          :<ProfitWaterfall profit={profit}/>}
      </section>
    </div>
    <section className="qr-card qr-transaction-card"><header><div><h3>جزئیات {tabsById[tab]}</h3><p>آخرین ریکاردها مطابق فلتر انتخاب‌شده</p></div><button className="qr-view-link" type="button" onClick={()=>onNavigate(tab==='profit'?'profitAnalysis':tab==='sales'?'sales':tab==='cash'?'cashRegister':tab==='expenses'?'expenses':'debtors')}>گزارش تفصیلی <ArrowLeft size={16}/></button></header>
      <TransactionTable rows={rows} tab={tab} onNavigate={onNavigate}/>
    </section>
    <p className="qr-footnote">مفاد در این نسخه تخمینی است؛ خرید موجودی در زمان خرید به‌صورت خودکار مصرف حساب نمی‌شود. بهای اجناس فروخته‌شده از FIFO محاسبه می‌گردد. برگشتی‌ها و ثبت‌های دستی ممکن است نیاز به تطبیق حسابداری داشته باشند. دریافت پول از مشتری فروش جدید نیست. تمام ارقام به افغانی است.</p>
  </div>;
}
