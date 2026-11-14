import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Home,
  Receipt,
  BookOpen,
  ChartNoAxesCombined,
  Warehouse,
  Users,
  UserRound,
  Package,
  Boxes,
  ShoppingCart,
  RotateCcw,
  Wallet,
  FileText,
  Settings,
  Search,
  Plus,
  Download,
  Printer,
  ChevronDown,
  Menu,
  X,
  Pencil,
  Trash2,
  Eye,
  ArrowUpLeft,
  ArrowDownLeft,
  CalendarDays,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  ClipboardList,
  BadgeCheck,
  Filter,
  Save,
  MoreHorizontal,
  ContactRound,
  Building2,
  Activity,
  Bell,
  CircleHelp,
  LogOut,
  Check,
  AlertCircle,
  Clock3,
  ArrowLeftRight,
  PanelRightClose,
  PanelRightOpen,
  LayoutDashboard,
  ChartPie,
  UserRoundCheck,
  FolderTree,
  Undo2,
  FileBarChart,
  Scale,
  BoxesIcon,
  ClipboardCheck,
  CalendarCheck2,
} from "lucide-react";
import "./styles.css";
import "./responsive.css";

const afghanMonths = [
  "حمل",
  "ثور",
  "جوزا",
  "سرطان",
  "اسد",
  "سنبله",
  "میزان",
  "عقرب",
  "قوس",
  "جدی",
  "دلو",
  "حوت",
];
function afghanDate(value = new Date()) {
  const date = value instanceof Date ? value : new Date(value);
  try {
    const parts = new Intl.DateTimeFormat("en-US-u-ca-persian-nu-latn", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    }).formatToParts(date);
    const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
    const month = Math.max(1, Math.min(12, Number(p.month || 1)));
    return `${Number(p.day || 1)} ${afghanMonths[month - 1]} ${p.year || ""}`;
  } catch {
    return `${date.getDate()} ${afghanMonths[date.getMonth()]} ${date.getFullYear()}`;
  }
}
const number = (n) => new Intl.NumberFormat("fa-AF").format(Number(n || 0));
const money = (n) => `${number(n)} افغانی`;
const today = afghanDate();

const navGroups = [
  {
    label: "صفحه اصلی",
    icon: Home,
    items: [{ id: "dashboard", label: "داشبورد" }],
  },
  {
    label: "بل‌ها",
    icon: Receipt,
    items: [
      { id: "sales", label: "بل‌های فروش" },
      { id: "purchases", label: "بل‌های خرید" },
      { id: "returns", label: "بل‌های برگشتی" },
    ],
  },
  {
    label: "حسابداری",
    icon: BookOpen,
    items: [
      { id: "journal", label: "اسناد حسابداری" },
      { id: "accounts", label: "سرفصل‌های حساب" },
      { id: "expenses", label: "درآمد و مصارف" },
    ],
  },
  {
    label: "گزارش‌ها",
    icon: ChartNoAxesCombined,
    items: [
      { id: "reports", label: "گزارش عمومی" },
      { id: "trialBalance", label: "تراز آزمایشی" },
      { id: "journalReport", label: "گزارش روزنامه" },
    ],
  },
  {
    label: "گدام",
    icon: Warehouse,
    items: [
      { id: "warehouseDashboard", label: "داشبورد گدام" },
      { id: "products", label: "محصولات" },
      { id: "groups", label: "گروه‌های محصولات" },
      { id: "warehouses", label: "گدام‌ها" },
    ],
  },
  {
    label: "منابع بشری",
    icon: UserRound,
    items: [
      { id: "employees", label: "کارمندان" },
      { id: "payroll", label: "معاشات و دستمزد" },
      { id: "attendance", label: "حاضری" },
    ],
  },
  {
    label: "مشتریان",
    icon: Users,
    items: [
      { id: "customersDashboard", label: "داشبورد ارتباط با مشتری" },
      { id: "customers", label: "مشتریان" },
      { id: "debtors", label: "مشتریان بدهکار" },
      { id: "suppliers", label: "عرضه‌کنندگان" },
    ],
  },
  {
    label: "مدیریت",
    icon: Settings,
    items: [{ id: "settings", label: "تنظیمات" }],
  },
];
const allNavItems = navGroups.flatMap((g) => g.items);
const navigationIcons = {
  dashboard: LayoutDashboard,
  sales: Receipt,
  purchases: ShoppingCart,
  returns: Undo2,
  journal: BookOpen,
  accounts: FolderTree,
  expenses: Wallet,
  reports: FileBarChart,
  trialBalance: Scale,
  journalReport: ClipboardList,
  warehouseDashboard: ChartPie,
  products: Package,
  groups: BoxesIcon,
  warehouses: Warehouse,
  employees: UserRoundCheck,
  payroll: Wallet,
  attendance: CalendarCheck2,
  customersDashboard: Activity,
  customers: Users,
  debtors: Wallet,
  suppliers: ContactRound,
  settings: Settings,
};

const entityConfigs = {
  products: {
    title: "محصولات",
    description: "کا‌لاها و موجودی گدام خود را مدیریت کنید",
    add: "ایجاد محصول",
    fields: [
      ["code", "کد محصول"],
      ["name", "نام محصول"],
      ["sstid", "شناسه SSTID محصول"],
      ["group", "گروه محصول"],
      ["unit", "واحد"],
      ["cost", "بهای تمام‌شده"],
      ["price", "قیمت فروش"],
      ["tax", "مالیات محصول (%)"],
      ["reorder", "نقطه سفارش"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام محصول"],
      ["group", "گروه"],
      ["unit", "واحد"],
      ["quantity", "تعداد"],
      ["cost", "بهای تمام‌شده"],
      ["price", "قیمت فروش"],
      ["tax", "مالیات"],
    ],
  },
  groups: {
    title: "گروه‌های محصولات",
    description: "گروه‌های کا‌لا و تنظیمات حسابداری آن‌ها",
    add: "ایجاد گروه محصول",
    fields: [
      ["name", "نام گروه"],
      ["sstid", "شناسه فروش و خدمات"],
      ["tax", "مالیات (%)"],
      ["inventoryAccount", "سرفصل موجودی کا‌لا"],
      ["salesAccount", "سرفصل درآمد"],
      ["returnAccount", "سرفصل فروش برگشتی"],
      ["cogsAccount", "موضوع بهای تمام‌شده"],
    ],
    columns: [
      ["name", "نام گروه"],
      ["sstid", "شناسه SSTID"],
      ["tax", "مالیات"],
      ["inventoryAccount", "سرفصل موجودی"],
      ["salesAccount", "سرفصل درآمد"],
    ],
  },
  customers: {
    title: "مشتریان",
    description: "مشتریان و حساب‌های آن‌ها را مدیریت کنید",
    add: "ایجاد مشتری",
    fields: [
      ["code", "کد حسابداری"],
      ["name", "نام مشتری"],
      ["type", "نوع"],
      ["economicNumber", "شماره اقتصادی"],
      ["phone", "شماره تیلفون"],
      ["mobile", "شماره موبایل"],
      ["group", "گروه طرف حساب"],
      ["address", "آدرس"],
      ["notes", "یادداشت"],
    ],
    columns: [
      ["code", "کد حسابداری"],
      ["name", "نام مشتری"],
      ["type", "نوع"],
      ["economicNumber", "شماره اقتصادی"],
      ["phone", "شماره تیلفون"],
      ["group", "گروه"],
      ["balance", "مانده (افغانی)"],
    ],
  },
  suppliers: {
    title: "عرضه‌کنندگان",
    description: "عرضه‌کنندگان و حساب‌های پرداختنی را مدیریت کنید",
    add: "ایجاد عرضه‌کننده",
    fields: [
      ["code", "کد حسابداری"],
      ["name", "نام عرضه‌کننده"],
      ["economicNumber", "شماره اقتصادی"],
      ["phone", "شماره تیلفون"],
      ["mobile", "شماره موبایل"],
      ["group", "گروه طرف حساب"],
      ["address", "آدرس"],
      ["notes", "یادداشت"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام عرضه‌کننده"],
      ["economicNumber", "شماره اقتصادی"],
      ["phone", "شماره تیلفون"],
      ["group", "گروه"],
      ["balance", "مانده (افغانی)"],
    ],
  },
  warehouses: {
    title: "گدام‌ها",
    description: "گدام‌ها و محل نگهداری کا‌لا را مدیریت کنید",
    add: "ایجاد گدام",
    fields: [
      ["code", "کد گدام"],
      ["name", "نام گدام"],
      ["location", "موقعیت"],
      ["manager", "مسؤول گدام"],
      ["status", "وضعیت"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام گدام"],
      ["location", "موقعیت"],
      ["manager", "مسؤول"],
      ["status", "وضعیت"],
    ],
  },
  employees: {
    title: "کارمندان",
    description: "اعضای سازمان خود را مدیریت کنید",
    add: "افزودن کارمند",
    fields: [
      ["employeeCode", "کد کارمند"],
      ["firstName", "نام"],
      ["lastName", "تخلص"],
      ["fatherName", "نام پدر"],
      ["tazkira", "نمبر تذکره"],
      ["passport", "شماره پاسپورت"],
      ["gender", "جنسیت"],
      ["marital", "حالت مدنی"],
      ["nationality", "ملیت"],
      ["birthDate", "تاریخ تولد"],
      ["phone", "شماره تیلفون"],
      ["address", "آدرس"],
      ["unit", "واحد سازمانی"],
      ["position", "جایگاه وظیفوی"],
      ["workshop", "کارگاه"],
      ["shift", "شیفت کاری"],
      ["contract", "نوع قرارداد"],
      ["startDate", "تاریخ آغاز قرارداد"],
      ["endDate", "تاریخ ختم قرارداد"],
      ["education", "سطح تحصیلات"],
      ["status", "وضعیت"],
    ],
    columns: [
      ["employeeCode", "کد کارمند"],
      ["firstName", "نام"],
      ["lastName", "تخلص"],
      ["position", "جایگاه وظیفوی"],
      ["unit", "واحد سازمانی"],
      ["phone", "شماره تیلفون"],
      ["status", "وضعیت"],
    ],
  },
  accounts: {
    title: "سرفصل‌های حساب",
    description: "کدها و سرفصل‌های حسابداری",
    add: "ایجاد سرفصل",
    fields: [
      ["code", "کد سرفصل"],
      ["name", "نام سرفصل"],
      ["type", "نوع حساب"],
      ["parent", "سرفصل مادر"],
      ["status", "وضعیت"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام سرفصل"],
      ["type", "نوع حساب"],
      ["parent", "سرفصل مادر"],
      ["status", "وضعیت"],
    ],
  },
};

const initialData = {
  products: [],
  groups: [],
  customers: [],
  suppliers: [],
  warehouses: [],
  employees: [],
  accounts: [],
  invoices: [],
  journals: [],
  expenses: [],
  payroll: [],
  attendance: [],
};
function loadInitial() {
  try {
    const saved = JSON.parse(
      localStorage.getItem("afghan-wholesale-ui-data") || "{}",
    );
    const result = Object.fromEntries(
      Object.keys(initialData).map((key) => [
        key,
        Array.isArray(saved[key]) ? saved[key] : [],
      ]),
    );
    const employeeFields = new Set([
      "id",
      ...entityConfigs.employees.fields.map(([field]) => field),
    ]);
    result.employees = result.employees.map((record) =>
      Object.fromEntries(
        Object.entries(record).filter(([field]) => employeeFields.has(field)),
      ),
    );
    return result;
  } catch {
    return initialData;
  }
}

function App() {
  const [page, setPage] = useState("dashboard");
  const [openMenu, setOpenMenu] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(
    () => new Set(["بل‌ها"]),
  );
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [data, setData] = useState(loadInitial);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");
  const [invoiceItems, setInvoiceItems] = useState([
    { product: "", quantity: 1, price: "", discount: 0 },
  ]);
  const [invoiceForm, setInvoiceForm] = useState({
    date: today,
    party: "",
    title: "",
    paid: 0,
    notes: "",
  });
  const [paymentForm, setPaymentForm] = useState({ amount: "", date: today, notes: "" });
  const [journalItems, setJournalItems] = useState([
    { account: "", description: "", debit: 0, credit: 0 },
  ]);

  useEffect(() => {
    localStorage.setItem("afghan-wholesale-ui-data", JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const currentTitle =
    allNavItems.find((x) => x.id === page)?.label || "داشبورد";
  const setCurrentPage = (id) => {
    setPage(id);
    setSearch("");
    setOpenMenu("");
    setMobileMenu(false);
  };
  const notify = (message) => setToast(message);

  function openEntityForm(key, row = null) {
    setEditId(row?.id ?? null);
    setForm(row ? { ...row } : {});
    setModal({ type: "entity", key });
  }
  function saveEntity(e) {
    e.preventDefault();
    const key = modal.key;
    const entry = { ...form, id: editId ?? Date.now() };
    setData((prev) => ({
      ...prev,
      [key]: editId
        ? prev[key].map((r) => (r.id === editId ? entry : r))
        : [...prev[key], entry],
    }));
    setModal(null);
    setForm({});
    setEditId(null);
    notify(editId ? "تغییرات ثبت شد." : "معلومات جدید ثبت شد.");
  }
  function deleteEntity(key, id) {
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((r) => r.id !== id),
    }));
    notify("مورد حذف شد.");
  }
  function openInvoice(type) {
    setInvoiceForm({ date: today, party: "", title: "", paid: 0, notes: "" });
    setInvoiceItems([{ product: "", quantity: 1, price: "", discount: 0 }]);
    setModal({ type: "invoice", invoiceType: type });
  }
  function saveInvoice(e) {
    e.preventDefault();
    const subtotal = invoiceItems.reduce(
      (s, i) =>
        s + (Number(i.quantity) * Number(i.price) - Number(i.discount || 0)),
      0,
    );
    const initialPaid = Number(invoiceForm.paid || 0);
    if (!Number.isFinite(initialPaid) || initialPaid < 0 || initialPaid > subtotal) {
      notify("مبلغ پرداخت‌شده باید بین صفر و مجموع بل باشد.");
      return;
    }
    if (modal.invoiceType === "sale" && subtotal > initialPaid && !invoiceForm.party) {
      notify("برای فروش قرضه، مشتری را انتخاب کنید.");
      return;
    }
    const invoice = {
      id: Date.now(),
      number:
        data.invoices.filter((x) => x.type === modal.invoiceType).length + 1,
      type: modal.invoiceType,
      ...invoiceForm,
      items: invoiceItems.map((x) => ({ ...x })),
      total: subtotal,
      paid: initialPaid,
      balance: Math.max(0, Math.round((subtotal - initialPaid) * 100) / 100),
      payments: [],
      status: initialPaid >= subtotal ? "پرداخت کامل" : "پرداخت ناقص",
    };
    setData((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
    setModal(null);
    notify("بل ثبت شد.");
  }
  function openPayment(invoice) {
    if (invoice.type !== "sale" || Number(invoice.balance || 0) <= 0) return;
    setPaymentForm({ amount: "", date: today, notes: "" });
    setModal({ type: "payment", invoiceId: invoice.id });
  }
  function savePayment(e) {
    e.preventDefault();
    const amount = Number(paymentForm.amount);
    const invoice = data.invoices.find((x) => x.id === modal.invoiceId && x.type === "sale");
    if (!invoice) { notify("بل فروش پیدا نشد."); return; }
    const remaining = Number(invoice.balance || 0);
    if (!Number.isFinite(amount) || amount <= 0) {
      notify("مبلغ دریافت‌شده باید بیشتر از صفر باشد.");
      return;
    }
    if (Math.round(amount * 100) > Math.round(remaining * 100)) {
      notify("مبلغ دریافت‌شده از مانده بل بیشتر است.");
      return;
    }
    const payment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      date: paymentForm.date || today,
      notes: paymentForm.notes.trim(),
    };
    setData((prev) => ({
      ...prev,
      invoices: prev.invoices.map((item) => {
        if (item.id !== invoice.id) return item;
        const updatedBalance = Math.max(0, Math.round((Number(item.balance || 0) - amount) * 100) / 100);
        return {
          ...item,
          paid: Math.round((Number(item.paid || 0) + amount) * 100) / 100,
          balance: updatedBalance,
          status: updatedBalance === 0 ? "پرداخت کامل" : "پرداخت ناقص",
          payments: [...(item.payments || []), payment],
        };
      }),
    }));
    setModal(null);
    notify("دریافت پول ثبت شد و مانده مشتری به‌روز گردید.");
  }
  function openJournal() {
    setForm({ name: "", date: today, notes: "" });
    setJournalItems([{ account: "", description: "", debit: 0, credit: 0 }]);
    setModal({ type: "journal" });
  }
  function saveJournal(e) {
    e.preventDefault();
    const debit = journalItems.reduce((s, x) => s + Number(x.debit || 0), 0);
    const credit = journalItems.reduce((s, x) => s + Number(x.credit || 0), 0);
    const entry = {
      id: Date.now(),
      number: data.journals.length + 1,
      ...form,
      rows: journalItems,
      debit,
      credit,
    };
    setData((prev) => ({ ...prev, journals: [entry, ...prev.journals] }));
    setModal(null);
    notify("سند حسابداری ثبت شد.");
  }

  const totals = useMemo(
    () => ({
      products: data.products.length,
      customers: data.customers.length,
      invoices: data.invoices.length,
      sales: data.invoices
        .filter((x) => x.type === "sale")
        .reduce((s, x) => s + x.total, 0),
      purchases: data.invoices
        .filter((x) => x.type === "purchase")
        .reduce((s, x) => s + x.total, 0),
      receivable: data.invoices
        .filter((x) => x.type === "sale")
        .reduce((s, x) => s + x.balance, 0),
      stock: data.products.reduce((s, x) => s + Number(x.quantity || 0), 0),
    }),
    [data],
  );

  function renderPage() {
    if (page === "dashboard")
      return (
        <Dashboard
          data={data}
          totals={totals}
          onNavigate={setCurrentPage}
          onInvoice={openInvoice}
          onJournal={openJournal}
        />
      );
    if (page === "warehouseDashboard")
      return (
        <WarehouseDashboard
          data={data}
          totals={totals}
          onNavigate={setCurrentPage}
        />
      );
    if (page === "customersDashboard")
      return (
        <CustomersDashboard
          data={data}
          totals={totals}
          onNavigate={setCurrentPage}
          onInvoice={openInvoice}
        />
      );
    if (page === "debtors")
      return <DebtorsPage data={data} onPayment={openPayment} onNavigate={setCurrentPage} />;
    if (
      page === "products" ||
      page === "groups" ||
      page === "customers" ||
      page === "suppliers" ||
      page === "warehouses" ||
      page === "employees" ||
      page === "accounts"
    ) {
      return (
        <EntityPage
          page={page}
          data={data}
          search={search}
          setSearch={setSearch}
          onAdd={() => openEntityForm(page)}
          onEdit={(r) => openEntityForm(page, r)}
          onDelete={(id) => deleteEntity(page, id)}
          receivables={page === "customers" ? customerReceivables(data.invoices) : {}}
        />
      );
    }
    if (["sales", "purchases", "returns"].includes(page))
      return (
        <InvoicesPage
          page={page}
          data={data}
          search={search}
          setSearch={setSearch}
          onAdd={() =>
            openInvoice(
              page === "sales"
                ? "sale"
                : page === "purchases"
                  ? "purchase"
                  : "return",
            )
          }
          onDelete={(id) => {
            setData((p) => ({
              ...p,
              invoices: p.invoices.filter((x) => x.id !== id),
            }));
            notify("بل حذف شد.");
          }}
          onPayment={openPayment}
        />
      );
    if (page === "journal")
      return (
        <JournalPage
          data={data}
          onAdd={openJournal}
          onDelete={(id) => {
            setData((p) => ({
              ...p,
              journals: p.journals.filter((x) => x.id !== id),
            }));
            notify("سند حذف شد.");
          }}
        />
      );
    if (page === "expenses")
      return <ExpensesPage data={data} setData={setData} notify={notify} />;
    if (page === "payroll")
      return <PayrollPage data={data} onNavigate={setCurrentPage} />;
    if (page === "attendance") return <AttendancePage data={data} />;
    if (["reports", "trialBalance", "journalReport"].includes(page))
      return <ReportsPage page={page} data={data} />;
    if (page === "settings") return <SettingsPage notify={notify} />;
    return (
      <Dashboard
        data={data}
        totals={totals}
        onNavigate={setCurrentPage}
        onInvoice={openInvoice}
        onJournal={openJournal}
      />
    );
  }

  return (
    <div
      className={`app-shell ${mobileMenu ? "sidebar-open" : ""} ${sidebarVisible ? "" : "sidebar-collapsed"}`}
      dir="ltr"
    >
      <aside className="sidebar" dir="rtl" aria-label="منوی اصلی">
        <div className="sidebar-brand">
          <div className="brand-mark">A</div>
          <div className="brand-text">
            <strong>عمده فروشی </strong>
            <small>سامانه مدیریت تجارت</small>
          </div>
          <button
            className="icon-btn sidebar-close"
            onClick={() => setMobileMenu(false)}
            aria-label="بستن منو"
          >
            <X size={17} />
          </button>
        </div>
        <div className="sidebar-period">
          <span className="period-dot"></span>
          <div>
            <strong>سال مالی ۱۴۰۵</strong>
            <small>{today}</small>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav className="sidebar-nav">
          {navGroups.map((group) => {
            const Icon = group.icon;
            const expanded = expandedGroups.has(group.label);
            const groupHasActivePage = group.items.some(
              (item) => item.id === page,
            );
            return (
              <section
                className={`side-nav-group ${expanded ? "expanded" : ""}`}
                key={group.label}
              >
                <button
                  type="button"
                  className={`side-nav-heading ${groupHasActivePage ? "contains-active" : ""}`}
                  aria-expanded={expanded}
                  onClick={() =>
                    setExpandedGroups((previous) => {
                      const next = new Set(previous);
                      if (next.has(group.label)) next.delete(group.label);
                      else next.add(group.label);
                      return next;
                    })
                  }
                >
                  <Icon size={16} />
                  <span>{group.label}</span>
                  <ChevronDown className="side-nav-chevron" size={15} />
                </button>
                {expanded && (
                  <div className="side-nav-items">
                    {group.items.map((item) => {
                      const active = page === item.id;
                      const ItemIcon = navigationIcons[item.id] || FileText;
                      return (
                        <button
                          key={item.id}
                          className={`side-nav-link ${active ? "active" : ""}`}
                          onClick={() => setCurrentPage(item.id)}
                          aria-current={active ? "page" : undefined}
                        >
                          <ItemIcon
                            className="side-nav-item-icon"
                            size={17}
                            strokeWidth={active ? 2.2 : 1.75}
                            aria-hidden="true"
                          />
                          <span>{item.label}</span>
                          {active && <span className="side-nav-active-dot" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <span className="help-icon">
              <CircleHelp size={17} />
            </span>
            <div>
              <strong>راهنمای سامانه</strong>
              <small>راهنمای بخش‌های برنامه</small>
            </div>
            <ChevronDown size={14} />
          </div>
          <div className="sidebar-user">
            <span className="avatar">ح</span>
            <div>
              <strong>حسابدار</strong>
              <small>مدیر سیستم</small>
            </div>
            <MoreHorizontal size={17} />
          </div>
        </div>
      </aside>
      {mobileMenu && (
        <button
          className="sidebar-overlay"
          aria-label="بستن منو"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <div className="workspace" dir="rtl">
        <header className="topbar">
          <div className="topbar-leading">
            <button
              className="mobile-toggle icon-btn"
              onClick={() => setMobileMenu((v) => !v)}
              aria-label="باز کردن منو"
              aria-expanded={mobileMenu}
            >
              <Menu size={19} />
            </button>
            <button
              type="button"
              className="desktop-sidebar-toggle icon-btn"
              onClick={() => setSidebarVisible((v) => !v)}
              title={sidebarVisible ? "بستن منو" : "باز کردن منو"}
              aria-label={sidebarVisible ? "بستن منو" : "باز کردن منو"}
              aria-expanded={sidebarVisible}
            >
              {sidebarVisible ? (
                <PanelRightClose size={19} strokeWidth={1.8} />
              ) : (
                <PanelRightOpen size={19} strokeWidth={1.8} />
              )}
            </button>
            <div className="topbar-context">
              <span>سامانه مدیریت عمده‌فروشی افغانستان</span>
              <strong>{currentTitle}</strong>
            </div>
          </div>
          <div className="top-actions">
            <label className="top-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="جستجو در این صفحه..."
              />
            </label>
            <span className="date-chip">
              <CalendarDays size={15} />
              {today}
            </span>
            <button
              className="icon-btn notification-btn"
              title="اعلان‌ها"
              aria-label="اعلان‌ها"
            >
              <Bell size={17} />
              <i></i>
            </button>
            <button className="user-chip">
              <span className="avatar">ح</span>
              <span>حسابدار</span>
              <ChevronDown size={13} />
            </button>
          </div>
        </header>
        <div className="mobile-search-bar">
          <label className="mobile-search-input">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">جستجو در این صفحه</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="جستجو در این صفحه..."
              aria-label="جستجو در این صفحه"
            />
          </label>
        </div>
        <main className="main-area">
          <div className="page-toolbar">
            <div>
              <div className="eyebrow">سامانه یکپارچه مدیریت عمده‌فروشی</div>
              <h1>{currentTitle}</h1>
            </div>
            <div className="toolbar-right">
              <span className="today-label">{today}</span>
            </div>
          </div>
          {renderPage()}
        </main>
        <footer className="app-footer">
          سامانه مدیریت عمده‌فروشی افغانستان <span>رابط کاربری React</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" dir="rtl">
          <Check size={16} />
          {toast}
        </div>
      )}
      {modal && (
        <Modal
          title={
            modal.type === "entity"
              ? editId
                ? "ویرایش معلومات"
                : entityConfigs[modal.key]?.add || "افزودن مورد"
              : modal.type === "invoice"
                ? invoiceTitle(modal.invoiceType)
                : modal.type === "payment"
                  ? "ثبت دریافت پول از مشتری"
                : modal.type === "journal"
                  ? "ثبت سند حسابداری"
                  : "ثبت مصارف"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "entity" && (
            <EntityForm
              config={entityConfigs[modal.key]}
              form={form}
              setForm={setForm}
              onSubmit={saveEntity}
              onCancel={() => setModal(null)}
            />
          )}
          {modal.type === "invoice" && (
            <InvoiceForm
              type={modal.invoiceType}
              data={data}
              form={invoiceForm}
              setForm={setInvoiceForm}
              items={invoiceItems}
              setItems={setInvoiceItems}
              onSubmit={saveInvoice}
              onCancel={() => setModal(null)}
            />
          )}
          {modal.type === "payment" && (
            <PaymentForm
              invoice={data.invoices.find((x) => x.id === modal.invoiceId)}
              form={paymentForm}
              setForm={setPaymentForm}
              onSubmit={savePayment}
              onCancel={() => setModal(null)}
            />
          )}
          {modal.type === "journal" && (
            <JournalForm
              form={form}
              setForm={setForm}
              items={journalItems}
              setItems={setJournalItems}
              onSubmit={saveJournal}
              onCancel={() => setModal(null)}
            />
          )}
        </Modal>
      )}
    </div>
  );
}

function invoiceTitle(type) {
  return type === "sale"
    ? "اضافه کردن فروش"
    : type === "purchase"
      ? "اضافه کردن خرید"
      : "اضافه کردن بازگشت از فروش";
}
function PageHeading({ title, description, actions }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <div className="heading-actions">{actions}</div>
    </div>
  );
}
function StatCard({ label, value, icon: Icon, tone = "green", note }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}
function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <h3>{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}
function Dashboard({ data, totals, onNavigate, onInvoice, onJournal }) {
  const shortcuts = [
    ["صدور بل فروش", () => onInvoice("sale"), Receipt],
    ["صدور بل خرید", () => onInvoice("purchase"), ShoppingCart],
    ["افزودن محصول", () => onNavigate("products"), Package],
    ["ثبت طرف حساب", () => onNavigate("customers"), ContactRound],
    ["ثبت سند حسابداری", onJournal, BookOpen],
  ];
  return (
    <>
      <div className="welcome-row">
        <div>
          <h2>خوش آمدید، حسابدار</h2>
          <p>نمای کلی فعالیت‌های تجارتی شما در سال مالی جاری</p>
        </div>
        <span className="year-pill">سال مالی ۱۴۰۵</span>
      </div>
      <div className="shortcut-grid">
        {shortcuts.map(([label, action, Icon]) => (
          <button className="shortcut" key={label} onClick={action}>
            <span>
              <Icon size={18} />
            </span>
            {label}
            <Plus size={14} className="shortcut-plus" />
          </button>
        ))}
      </div>
      <div className="stats-grid">
        <StatCard
          label="کل موجودی گدام"
          value={money(totals.stock)}
          icon={Warehouse}
          tone="blue"
          note="بر اساس تعداد ثبت‌شده"
        />
        <StatCard
          label="درآمد از ابتدای سال"
          value={money(totals.sales)}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="مصارف ثبت‌شده"
          value={money(0)}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="سود و زیان"
          value={money(totals.sales - totals.purchases)}
          icon={ChartNoAxesCombined}
          tone="violet"
        />
        <StatCard
          label="خرید از ابتدای سال"
          value={money(totals.purchases)}
          icon={ShoppingCart}
          tone="amber"
        />
        <StatCard
          label="طلب از مشتریان"
          value={money(totals.receivable)}
          icon={Wallet}
          tone="cyan"
        />
      </div>
      <div className="dashboard-grid">
        <Panel
          title="درآمد و مصارف ماهانه"
          action={<span className="muted-pill">سال مالی ۱۴۰۵</span>}
        >
          <ChartPlaceholder labels={afghanMonths.slice(0, 8)} />
        </Panel>
        <Panel
          title="بل‌های فروش پرداخت‌نشده"
          action={
            <button className="text-btn" onClick={() => onNavigate("sales")}>
              دیدن بل‌های فروش
            </button>
          }
        >
          <div className="empty-chart">
            <Wallet size={27} />
            <b>{money(totals.receivable)}</b>
            <span>
              {number(
                data.invoices.filter(
                  (x) => x.type === "sale" && Number(x.balance || 0) > 0,
                ).length,
              )}{" "}
              بل با مانده پرداخت‌نشده
            </span>
          </div>
        </Panel>
        <Panel
          title="محصولات و خدمات پرفروش"
          action={
            <button className="text-btn" onClick={() => onNavigate("products")}>
              فهرست محصولات
            </button>
          }
        >
          <EmptyState text="هنوز فروشی ثبت نشده است." />
        </Panel>
        <Panel
          title="فعالیت‌های اخیر"
          action={<span className="muted-pill">آخرین رویدادها</span>}
        >
          <EmptyState text="فعالیتی برای نمایش وجود ندارد." />
        </Panel>
      </div>
    </>
  );
}
function ChartPlaceholder({ labels }) {
  return (
    <div className="chart-placeholder">
      <div className="chart-y">
        <span>۱۰۰</span>
        <span>۷۵</span>
        <span>۵۰</span>
        <span>۲۵</span>
        <span>۰</span>
      </div>
      <div className="chart-lines">
        <i />
        <i />
        <i />
        <i />
        <i />
        <div className="chart-empty-line" />
      </div>
      <div className="chart-x">
        {labels.map((x) => (
          <span key={x}>{x}</span>
        ))}
      </div>
    </div>
  );
}
function EmptyState({ text }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">
        <FileText size={22} />
      </div>
      <span>{text}</span>
    </div>
  );
}
function WarehouseDashboard({ data, totals, onNavigate }) {
  const low = data.products.filter(
    (x) => Number(x.quantity || 0) <= Number(x.reorder || 0),
  );
  return (
    <>
      <PageHeading
        title="داشبورد گدام"
        description="شاخص‌های موجودی، تحرک و عملکرد گدام"
        actions={
          <button
            className="btn secondary"
            onClick={() => onNavigate("products")}
          >
            لیست محصولات <Package size={15} />
          </button>
        }
      />
      <div className="stats-grid six">
        <StatCard
          label="ارزش کل موجودی"
          value={money(
            data.products.reduce(
              (s, x) => s + Number(x.quantity || 0) * Number(x.cost || 0),
              0,
            ),
          )}
          icon={CircleDollarSign}
          tone="blue"
        />
        <StatCard
          label="تعداد کا‌لاها"
          value={number(totals.products)}
          icon={Package}
          tone="violet"
        />
        <StatCard
          label="زیر نقطه سفارش"
          value={number(low.length)}
          icon={AlertCircle}
          tone="rose"
        />
        <StatCard label="کا‌لاهای راکد" value="۰" icon={Clock3} tone="amber" />
        <StatCard
          label="گردش موجودی"
          value="۰ بار"
          icon={ArrowLeftRight}
          tone="green"
        />
        <StatCard
          label="ورودی دوره"
          value="۰"
          icon={ArrowDownLeft}
          tone="cyan"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="تعداد کا‌لا در هر دسته‌بندی">
          <EmptyState text="برای نمایش نمودار، محصولات را ثبت کنید." />
        </Panel>
        <Panel title="روند ورودی و خروجی گدام">
          <ChartPlaceholder labels={afghanMonths.slice(0, 8)} />
        </Panel>
        <Panel title="هشدارها و یادآوری‌ها">
          <div className="notice-row">
            <AlertCircle size={17} />
            <span>
              {low.length
                ? `${low.length} محصول به موجودی بیشتر نیاز دارد.`
                : "در حال حاضر هیچ کا‌لایی زیر نقطه سفارش نیست."}
            </span>
          </div>
          <div className="notice-row">
            <Activity size={17} />
            <span>گزارش تحرک گدام پس از ثبت بل‌ها نمایش داده می‌شود.</span>
          </div>
        </Panel>
        <Panel title="کا‌لاهای زیر نقطه سفارش">
          <EmptyState text="همه کا‌لاها بالاتر از نقطه سفارش هستند." />
        </Panel>
      </div>
    </>
  );
}
function CustomersDashboard({ data, totals, onNavigate, onInvoice }) {
  return (
    <>
      <PageHeading
        title="داشبورد ارتباط با مشتری"
        description="نمای کلی فروش مشتریان برای سال مالی جاری"
        actions={
          <>
            <button className="btn primary" onClick={() => onInvoice("sale")}>
              <Plus size={15} /> صدور بل
            </button>
            <button
              className="btn secondary"
              onClick={() => onNavigate("customers")}
            >
              <Plus size={15} /> مشتری جدید
            </button>
            <button className="btn secondary" onClick={() => onNavigate("debtors")}>
              <Wallet size={15} /> مشتریان بدهکار
            </button>
          </>
        }
      />
      <div className="stats-grid four">
        <StatCard
          label="فروش این ماه"
          value={money(totals.sales)}
          icon={Receipt}
          tone="blue"
        />
        <StatCard
          label="دریافتی این ماه"
          value={money(totals.sales - totals.receivable)}
          icon={Wallet}
          tone="green"
        />
        <StatCard
          label="مانده پرداخت‌نشده"
          value={money(totals.receivable)}
          icon={CircleDollarSign}
          tone="rose"
        />
        <StatCard
          label="مشتریان بدهکار"
          value={number(
            Object.values(customerReceivables(data.invoices)).filter((value) => value > 0).length,
          )}
          icon={Users}
          tone="violet"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="روند فروش">
          <ChartPlaceholder labels={afghanMonths.slice(0, 8)} />
        </Panel>
        <Panel title="تحلیل سنی بل‌های پرداخت‌نشده">
          <EmptyState text="مطالبات پرداخت‌نشده‌ای وجود ندارد." />
        </Panel>
        <Panel title="مشتریان برتر سال">
          <EmptyState text="فروشی ثبت نشده است." />
        </Panel>
        <Panel title="آخرین بل‌ها">
          <EmptyState text="بلی برای نمایش وجود ندارد." />
        </Panel>
      </div>
    </>
  );
}
function EntityPage({
  page,
  data,
  search,
  setSearch,
  onAdd,
  onEdit,
  onDelete,
  receivables = {},
}) {
  const cfg = entityConfigs[page];
  const rows = page === "customers"
    ? (data[page] || []).map((row) => ({ ...row, balance: receivables[row.name] || 0 }))
    : (data[page] || []);
  const filtered = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  const actions = (
    <>
      <button
        className="btn secondary"
        onClick={() => downloadCsv(cfg.title, cfg.columns, rows)}
      >
        <Download size={15} /> خروجی CSV
      </button>
      <button className="btn primary" onClick={onAdd}>
        <Plus size={16} /> {cfg.add}
      </button>
    </>
  );
  return (
    <>
      <PageHeading
        title={cfg.title}
        description={cfg.description}
        actions={actions}
      />
      <div className="summary-strip">
        <div>
          <strong>{number(rows.length)}</strong>
          <span>ریکارد</span>
        </div>
        {page === "customers" && (
          <div>
            <strong>
              {money(rows.reduce((s, x) => s + Number(x.balance || 0), 0))}
            </strong>
            <span>مجموع مانده مشتریان</span>
          </div>
        )}
        {page === "products" && (
          <div>
            <strong>
              {number(rows.reduce((s, x) => s + Number(x.quantity || 0), 0))}
            </strong>
            <span>مجموع تعداد موجودی</span>
          </div>
        )}
        <div className="strip-search">
          <Search size={16} />
          <input
            placeholder="جستجو بر اساس نام، کد یا معلومات..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      <Panel
        title={`فهرست ${cfg.title}`}
        action={
          <span className="muted-pill">{number(filtered.length)} ریکارد</span>
        }
      >
        <DataTable
          columns={cfg.columns}
          rows={filtered}
          onEdit={onEdit}
          onDelete={onDelete}
          empty="معلوماتی پیدا نشد. برای شروع، مورد جدید اضافه کنید."
        />
      </Panel>
    </>
  );
}
function DataTable({ columns, rows, onEdit, onDelete, empty }) {
  return (
    <div className="table-wrap mobile-card-table">
      <table>
        <thead>
          <tr>
            {columns.map(([key, label]) => (
              <th key={key}>{label}</th>
            ))}
            {(onEdit || onDelete) && <th>عملیات</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {columns.map(([key]) => (
                <td key={key} data-label={columns.find(([columnKey]) => columnKey === key)?.[1]}>{formatCell(row[key], key)}</td>
              ))}
              {(onEdit || onDelete) && (
                <td data-label="عملیات" className="table-action-cell">
                  <div className="row-actions">
                    {onEdit && (
                      <button
                        className="icon-btn small"
                        title="ویرایش"
                        onClick={() => onEdit(row)}
                      >
                        <Pencil size={14} />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="icon-btn small danger"
                        title="حذف"
                        onClick={() => onDelete(row.id)}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {!rows.length && (
            <tr className="empty-data-row">
              <td className="empty-table-cell" colSpan={columns.length + 1}>
                <EmptyState text={empty} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function formatCell(value, key) {
  if (value === undefined || value === null || value === "") return "—";
  if (key === "tax") return `${number(value)}٪`;
  if (
    [
      "balance",
      "opening",
      "cost",
      "price",
      "total",
      "paid",
      "debit",
      "credit",
    ].includes(key)
  )
    return number(value);
  return String(value);
}
// Outstanding customer debts are derived from sales invoice balances rather than a second balance store.
function customerReceivables(invoices) {
  return invoices.filter((invoice) => invoice.type === "sale" && Number(invoice.balance || 0) > 0)
    .reduce((totals, invoice) => {
      const name = invoice.party || "مشتری نامشخص";
      totals[name] = (totals[name] || 0) + Number(invoice.balance || 0);
      return totals;
    }, {});
}
function DebtorsPage({ data, onPayment, onNavigate }) {
  const [filter, setFilter] = useState("");
  const outstanding = data.invoices
    .filter((invoice) => invoice.type === "sale" && Number(invoice.balance || 0) > 0)
    .filter((invoice) => `${invoice.party} ${invoice.number}`.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => String(a.party || "").localeCompare(String(b.party || ""), "fa"));
  const debtorTotals = customerReceivables(data.invoices);
  const debtorsCount = Object.values(debtorTotals).filter((amount) => amount > 0).length;
  return <>
    <PageHeading
      title="مشتریان بدهکار"
      description="بل‌های پرداخت‌نشده و دریافت پول از مشتریان را مدیریت کنید"
      actions={<button className="btn secondary" onClick={() => onNavigate("sales")}><Receipt size={15}/> رفتن به بل‌های فروش</button>}
    />
    <div className="stats-grid three">
      <StatCard label="مجموع طلبات" value={money(Object.values(debtorTotals).reduce((a,b)=>a+b,0))} icon={Wallet} tone="rose"/>
      <StatCard label="مشتریان بدهکار" value={number(debtorsCount)} icon={Users} tone="violet"/>
      <StatCard label="بل‌های پرداخت‌نشده" value={number(data.invoices.filter((x)=>x.type === "sale" && Number(x.balance||0)>0).length)} icon={Receipt} tone="blue"/>
    </div>
    <div className="summary-strip">
      <div className="strip-search"><Search size={16}/><input value={filter} onChange={(e)=>setFilter(e.target.value)} placeholder="نام مشتری یا شماره بل..." aria-label="جستجوی مشتری بدهکار"/></div>
    </div>
    <Panel title="فهرست بل‌های قرضه">
      <div className="table-wrap mobile-card-table">
        <table>
          <thead><tr><th>مشتری</th><th>شماره بل</th><th>تاریخ</th><th>مجموع بل</th><th>پرداخت‌شده</th><th>مانده</th><th>عملیات</th></tr></thead>
          <tbody>
            {outstanding.map((invoice)=><tr key={invoice.id}>
              <td data-label="مشتری">{invoice.party || "مشتری نامشخص"}</td>
              <td data-label="شماره بل">#{number(invoice.number)}</td>
              <td data-label="تاریخ">{invoice.date}</td>
              <td data-label="مجموع بل">{money(invoice.total)}</td>
              <td data-label="پرداخت‌شده">{money(invoice.paid)}</td>
              <td data-label="مانده"><strong>{money(invoice.balance)}</strong></td>
              <td data-label="عملیات" className="table-action-cell"><button className="btn primary pay-action" onClick={()=>onPayment(invoice)}><Wallet size={15}/> ثبت دریافت پول</button></td>
            </tr>)}
            {!outstanding.length && <tr className="empty-data-row"><td colSpan="7" className="empty-table-cell"><EmptyState text="در حال حاضر بل پرداخت‌نشده‌ای وجود ندارد."/></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  </>;
}
function PaymentForm({ invoice, form, setForm, onSubmit, onCancel }) {
  if (!invoice) return <p>بل مورد نظر پیدا نشد.</p>;
  const amount = Number(form.amount || 0);
  const remaining = Number(invoice.balance || 0);
  const previous = Array.isArray(invoice.payments) ? invoice.payments : [];
  return <form onSubmit={onSubmit} className="payment-form">
    <div className="payment-summary-grid">
      <div className="payment-summary-item"><span>مشتری</span><strong>{invoice.party || "مشتری نامشخص"}</strong></div>
      <div className="payment-summary-item"><span>شماره بل</span><strong>#{number(invoice.number)}</strong></div>
      <div className="payment-summary-item"><span>مجموع بل</span><strong>{money(invoice.total)}</strong></div>
      <div className="payment-summary-item"><span>مانده فعلی</span><strong>{money(remaining)}</strong></div>
    </div>
    <div className="modal-grid">
      <label>مبلغ دریافت‌شده (افغانی)
        <input type="number" min="0.01" max={remaining} step="0.01" inputMode="decimal" autoFocus required value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} placeholder="مبلغ دریافتی" />
      </label>
      <label>تاریخ دریافت (هجری شمسی)
        <input required value={form.date} onChange={(e)=>setForm({...form,date:e.target.value})}/>
      </label>
    </div>
    <label className="full-label">توضیحات (اختیاری)
      <textarea rows="2" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="مثلاً دریافت نقدی از مشتری"/>
    </label>
    <div className="payment-result"><span>مانده بعد از دریافت</span><strong>{money(Math.max(0,remaining-(Number.isFinite(amount)?amount:0)))}</strong></div>
    {previous.length > 0 && <div className="payment-history">
      <strong>سوابق دریافت پول</strong>
      {previous.map((payment)=><div key={payment.id} className="payment-history-row"><span>{payment.date} {payment.notes ? `— ${payment.notes}` : ""}</span><strong>{money(payment.amount)}</strong></div>)}
    </div>}
    <div className="modal-actions">
      <button type="button" className="btn secondary" onClick={onCancel}>لغو</button>
      <button className="btn primary" type="submit"><Wallet size={16}/> ثبت دریافت پول</button>
    </div>
  </form>;
}
function InvoicesPage({ page, data, search, setSearch, onAdd, onDelete, onPayment }) {
  const type =
    page === "sales" ? "sale" : page === "purchases" ? "purchase" : "return";
  const title =
    page === "sales"
      ? "بل‌های فروش"
      : page === "purchases"
        ? "بل‌های خرید"
        : "بل‌های برگشتی";
  const rows = data.invoices.filter(
    (x) =>
      x.type === type &&
      JSON.stringify(x).toLowerCase().includes(search.toLowerCase()),
  );
  const total = rows.reduce((s, x) => s + Number(x.total || 0), 0);
  return (
    <>
      <PageHeading
        title={title}
        description="بل‌ها و وضعیت پرداخت را مدیریت کنید"
        actions={
          <>
            <button
              className="btn secondary"
              onClick={() => downloadInvoiceCsv(rows)}
            >
              <Download size={15} /> خروجی CSV
            </button>
            <button className="btn primary" onClick={onAdd}>
              <Plus size={16} /> {invoiceTitle(type)}
            </button>
          </>
        }
      />
      <div className="stats-grid four">
        <StatCard
          label="مجموع بل‌ها"
          value={number(rows.length)}
          icon={Receipt}
          tone="blue"
        />
        <StatCard
          label="مبلغ بل‌ها"
          value={money(total)}
          icon={CircleDollarSign}
          tone="green"
        />
        <StatCard
          label="پرداخت‌شده"
          value={money(rows.reduce((s, x) => s + Number(x.paid || 0), 0))}
          icon={Wallet}
          tone="violet"
        />
        <StatCard
          label="پرداخت‌نشده"
          value={money(rows.reduce((s, x) => s + Number(x.balance || 0), 0))}
          icon={Clock3}
          tone="rose"
        />
      </div>
      <div className="summary-strip">
        <div className="strip-search">
          <Search size={16} />
          <input
            placeholder="جستجو بر اساس شماره بل یا نام مشتری..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <span className="muted-pill">{number(rows.length)} ریکارد</span>
      </div>
      <Panel title={`فهرست ${title}`}>
        <div className="table-wrap mobile-card-table">
          <table>
            <thead>
              <tr>
                <th>شماره بل</th>
                <th>تاریخ</th>
                <th>{type === "purchase" ? "عرضه‌کننده" : "مشتری"}</th>
                <th>تعداد اقلام</th>
                <th>مبلغ (افغانی)</th>
                <th>مانده</th>
                <th>وضعیت</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td data-label="شماره بل">#{number(row.number)}</td>
                  <td data-label="تاریخ">{row.date}</td>
                  <td data-label={type === "purchase" ? "عرضه‌کننده" : "مشتری"}>{row.party || "—"}</td>
                  <td data-label="تعداد اقلام">{number(row.items?.length || 0)}</td>
                  <td data-label="مبلغ (افغانی)">{number(row.total)}</td>
                  <td data-label="مانده">{number(row.balance)}</td>
                  <td data-label="وضعیت">
                    <span className="status success">
                      {row.status || "ثبت‌شده"}
                    </span>
                  </td>
                  <td data-label="عملیات" className="table-action-cell">
                    <div className="row-actions">
                      {type === "sale" && Number(row.balance || 0) > 0 && (
                        <button className="btn primary pay-action" onClick={() => onPayment(row)}>
                          <Wallet size={15} /> ثبت دریافت پول
                        </button>
                      )}
                      <button
                        className="icon-btn small"
                        onClick={() => window.print()}
                        title="چاپ"
                      >
                        <Printer size={14} />
                      </button>
                      <button
                        className="icon-btn small danger"
                        onClick={() => onDelete(row.id)}
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!rows.length && (
                <tr className="empty-data-row">
                  <td colSpan="8" className="empty-table-cell">
                    <EmptyState text="بلی ثبت نشده است." />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
function JournalPage({ data, onAdd, onDelete }) {
  return (
    <>
      <PageHeading
        title="اسناد حسابداری"
        description="اسناد حسابداری خود را مدیریت کنید"
        actions={
          <>
            <button
              className="btn secondary"
              onClick={() => downloadJournalCsv(data.journals)}
            >
              <Download size={15} /> خروجی CSV
            </button>
            <button className="btn primary" onClick={onAdd}>
              <Plus size={16} /> ایجاد سند
            </button>
          </>
        }
      />
      <div className="stats-grid three">
        <StatCard
          label="تمام اسناد"
          value={number(data.journals.length)}
          icon={FileText}
          tone="blue"
        />
        <StatCard
          label="تاییدشده"
          value={number(data.journals.length)}
          icon={BadgeCheck}
          tone="green"
        />
        <StatCard label="تاییدنشده" value="۰" icon={Clock3} tone="amber" />
      </div>
      <Panel title="فهرست اسناد">
        <DataTable
          columns={[
            ["number", "شماره سند"],
            ["date", "تاریخ"],
            ["name", "نام سند"],
            ["debit", "بدهکار"],
            ["credit", "بستانکار"],
          ]}
          rows={data.journals}
          onDelete={onDelete}
          empty="هیچ سندی پیدا نشد."
        />
      </Panel>
    </>
  );
}
function ExpensesPage({ data, setData, notify }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: today,
    description: "",
  });
  const save = (e) => {
    e.preventDefault();
    setData((p) => ({
      ...p,
      expenses: [{ ...form, id: Date.now() }, ...p.expenses],
    }));
    setForm({ name: "", amount: "", date: today, description: "" });
    notify("مصرف ثبت شد.");
  };
  return (
    <>
      <PageHeading
        title="درآمد و مصارف"
        description="ثبت و بررسی عواید و مصارف تجارتی"
      />
      <div className="stats-grid three">
        <StatCard
          label="مجموع مصارف"
          value={money(
            data.expenses.reduce((s, x) => s + Number(x.amount || 0), 0),
          )}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="تعداد ریکاردها"
          value={number(data.expenses.length)}
          icon={ClipboardList}
          tone="blue"
        />
        <StatCard
          label="درآمد ثبت‌شده"
          value={money(
            data.invoices
              .filter((x) => x.type === "sale")
              .reduce((s, x) => s + x.total, 0),
          )}
          icon={TrendingUp}
          tone="green"
        />
      </div>
      <Panel title="ثبت مصرف">
        <form className="form-grid" onSubmit={save}>
          <label>
            نام مصرف
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </label>
          <label>
            مبلغ (افغانی)
            <input
              type="number"
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>
          <label>
            تاریخ (هجری شمسی افغانستان)
            <input
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </label>
          <label className="wide">
            توضیحات
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div>
            <button className="btn primary">
              <Save size={15} /> ثبت مصرف
            </button>
          </div>
        </form>
      </Panel>
      <Panel title="فهرست مصارف">
        <DataTable
          columns={[
            ["date", "تاریخ"],
            ["name", "نام مصرف"],
            ["description", "توضیحات"],
            ["amount", "مبلغ (افغانی)"],
          ]}
          rows={data.expenses}
          empty="مصرفی ثبت نشده است."
        />
      </Panel>
    </>
  );
}
function PayrollPage({ data, onNavigate }) {
  return (
    <>
      <PageHeading
        title="داشبورد معاشات و دستمزد"
        description="نمای کلی پرداختی‌ها، کسورات و حاضری کارمندان"
        actions={
          <button
            className="btn primary"
            onClick={() => onNavigate("employees")}
          >
            <Plus size={15} /> افزودن کارمند
          </button>
        }
      />
      <div className="filter-row">
        <label>
          ماه
          <select defaultValue="عقرب">
            {afghanMonths.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          واحد سازمانی
          <select>
            <option>همه واحدها</option>
          </select>
        </label>
        <button className="btn secondary">
          <Filter size={15} /> اعمال
        </button>
        <button className="btn secondary">بازنشانی</button>
      </div>
      <div className="stats-grid six">
        <StatCard
          label="درآمد کل ناخالص"
          value={money(0)}
          icon={Wallet}
          tone="blue"
        />
        <StatCard
          label="مجموع کسورات"
          value={money(0)}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="پرداخت خالص"
          value={money(0)}
          icon={CircleDollarSign}
          tone="green"
        />
        <StatCard
          label="بیمه کارفرما"
          value={money(0)}
          icon={BadgeCheck}
          tone="violet"
        />
        <StatCard
          label="سهم کارمندان"
          value={number(data.employees.length)}
          icon={Users}
          tone="amber"
        />
        <StatCard
          label="میانگین خالص"
          value={money(0)}
          icon={Activity}
          tone="cyan"
        />
      </div>
      <div className="dashboard-grid">
        <Panel title="روند معاش و کسورات سال جاری">
          <ChartPlaceholder labels={afghanMonths.slice(0, 8)} />
        </Panel>
        <Panel title="تفکیک مصارف به‌ازای واحد">
          <EmptyState text="برای این دوره هزینه‌ای ثبت نشده است." />
        </Panel>
        <Panel title="هشدارها و یادآوری‌ها">
          <EmptyState text="هشداری برای نمایش وجود ندارد." />
        </Panel>
        <Panel title="لیست معاشات کارمندان">
          <EmptyState text="برای این دوره برگه معاش وجود ندارد." />
        </Panel>
      </div>
    </>
  );
}
function AttendancePage({ data }) {
  return (
    <>
      <PageHeading
        title="حاضری کارمندان"
        description="نمایش حاضری روزانه کارمندان"
      />
      <div className="filter-row">
        <label>
          ماه
          <select defaultValue="عقرب">
            {afghanMonths.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>
        <label>
          واحد سازمانی
          <select>
            <option>همه واحدها</option>
          </select>
        </label>
        <button className="btn secondary">
          <Filter size={15} /> فلتر
        </button>
      </div>
      <Panel title="الگوی حاضری روزانه">
        <div className="attendance-legend">
          <span className="present">حاضر</span>
          <span className="late">تأخیر</span>
          <span className="absent">غایب</span>
          <span className="off">رخصتی</span>
        </div>
        {data.employees.length ? (
          <>
          <div className="table-scroll-hint" aria-hidden="true">برای دیدن روزهای دیگر، جدول را به چپ یا راست بکشید.</div>
          <div className="table-wrap wide-data-table" role="region" aria-label="جدول حاضری قابل حرکت افقی" tabIndex="0">
            <table>
              <thead>
                <tr>
                  <th>کارمند</th>
                  {Array.from({ length: 30 }, (_, i) => (
                    <th key={i}>{number(i + 1)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.employees.map((e) => (
                  <tr>
                    <td>
                      {e.firstName} {e.lastName}
                    </td>
                    {Array.from({ length: 30 }, (_, i) => (
                      <td key={i}>
                        <span className="attendance-dot present-dot" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        ) : (
          <EmptyState text="برای نمایش حاضری، ابتدا کارمندان را ثبت کنید." />
        )}
      </Panel>
    </>
  );
}
function ReportsPage({ page, data }) {
  const title =
    page === "trialBalance"
      ? "تراز آزمایشی در سطح کل"
      : page === "journalReport"
        ? "گزارش روزنامه"
        : "گزارش عمومی";
  return (
    <>
      <PageHeading
        title={title}
        description="گزارش‌های حسابداری و تجارتی بر اساس دوره انتخاب‌شده"
        actions={
          <button className="btn secondary" onClick={() => window.print()}>
            <Printer size={15} /> چاپ
          </button>
        }
      />
      <Panel title="فلتر گزارش">
        <div className="form-grid">
          <label>
            تاریخ شروع
            <input defaultValue={today} />
          </label>
          <label>
            تاریخ پایان
            <input defaultValue={today} />
          </label>
          <label>
            شماره شروع سند
            <input placeholder="از شماره" />
          </label>
          <label>
            شماره پایان سند
            <input placeholder="تا شماره" />
          </label>
          <div>
            <button className="btn primary">
              <Search size={15} /> جستجو برای اسناد
            </button>
          </div>
        </div>
      </Panel>
      <Panel title={title}>
        <div className="report-summary">
          <div>
            <span>بدهکار</span>
            <strong>{money(0)}</strong>
          </div>
          <div>
            <span>بستانکار</span>
            <strong>{money(0)}</strong>
          </div>
          <div>
            <span>تعداد اسناد</span>
            <strong>{number(data.journals.length)}</strong>
          </div>
        </div>
        <EmptyState text="برای محدوده انتخاب‌شده معلوماتی موجود نیست." />
        <div className="report-actions">
          <button className="btn secondary" onClick={() => window.print()}>
            <Printer size={15} /> چاپ گزارش
          </button>
          <button
            className="btn secondary"
            onClick={() => downloadJournalCsv(data.journals)}
          >
            <Download size={15} /> تبدیل به CSV
          </button>
        </div>
      </Panel>
    </>
  );
}
function SettingsPage({ notify }) {
  return (
    <>
      <PageHeading title="تنظیمات" description="تنظیمات عمومی رابط کاربری" />
      <Panel title="تنظیمات زبان و نمایش">
        <div className="settings-list">
          <div>
            <strong>زبان برنامه</strong>
            <span>دری افغانستان</span>
          </div>
          <div>
            <strong>جهت نمایش</strong>
            <span>راست به چپ (RTL)</span>
          </div>
          <div>
            <strong>تقویم</strong>
            <span>هجری شمسی با ماه‌های افغانستان</span>
          </div>
          <div>
            <strong>واحد پول</strong>
            <span>افغانی (AFN)</span>
          </div>
          <div>
            <strong>نمایش اعداد</strong>
            <span>اعداد دری افغانستان</span>
          </div>
        </div>
        <button
          className="btn secondary"
          onClick={() => {
            localStorage.removeItem("afghan-wholesale-ui-data");
            window.location.reload();
          }}
        >
          <RotateCcw size={15} /> پاک‌کردن معلومات نمایشی مرورگر
        </button>
      </Panel>
      <div className="notice-box">
        <AlertCircle size={18} />
        <span>
          این نسخه فقط رابط کاربری React است. معلومات در مرورگر ذخیره می‌شود و
          هنوز به سرور یا Supabase وصل نیست.
        </span>
      </div>
    </>
  );
}
function EntityForm({ config, form, setForm, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="modal-grid">
        {config.fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {["notes", "address"].includes(key) ? (
              <textarea
                rows="2"
                value={form[key] || ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            ) : (
              <input
                type={
                  [
                    "cost",
                    "price",
                    "tax",
                    "reorder",
                    "quantity",
                    "opening",
                  ].includes(key)
                    ? "number"
                    : "text"
                }
                value={form[key] ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          لغو
        </button>
        <button className="btn primary">
          <Save size={15} /> ثبت معلومات
        </button>
      </div>
    </form>
  );
}
function InvoiceForm({
  type,
  data,
  form,
  setForm,
  items,
  setItems,
  onSubmit,
  onCancel,
}) {
  const total = items.reduce(
    (s, x) =>
      s +
      Number(x.quantity || 0) * Number(x.price || 0) -
      Number(x.discount || 0),
    0,
  );
  const partyLabel = type === "purchase" ? "عرضه‌کننده" : "مشتری";
  const parties = type === "purchase" ? data.suppliers : data.customers;
  const addRow = () =>
    setItems([...items, { product: "", quantity: 1, price: "", discount: 0 }]);
  const update = (index, key, value) =>
    setItems(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  return (
    <form onSubmit={onSubmit}>
      <div className="modal-grid">
        <label>
          نام بل
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="نام بل"
          />
        </label>
        <label>
          {partyLabel}
          <select
            value={form.party}
            onChange={(e) => setForm({ ...form, party: e.target.value })}
          >
            <option value="">{partyLabel} را انتخاب کنید</option>
            {parties.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          تاریخ (هجری شمسی افغانستان)
          <input
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label>
          مبلغ پرداخت‌شده (افغانی)
          <input
            type="number"
            min="0"
            value={form.paid}
            onChange={(e) => setForm({ ...form, paid: e.target.value })}
          />
        </label>
      </div>
      <div className="invoice-lines">
        <div className="lines-title">
          <strong>اقلام بل</strong>
          <span>مالیات در بل فروش نمایش داده نمی‌شود.</span>
        </div>
        <div className="table-wrap responsive-entry-lines">
          <table>
            <thead>
              <tr>
                <th>محصول / خدمات</th>
                <th>تعداد</th>
                <th>قیمت واحد</th>
                <th>تخفیف</th>
                <th>مجموع</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td data-label="محصول / خدمات" className="entry-product">
                    <input
                      aria-label={`محصول / خدمات، قلم ${index + 1}`}
                      value={item.product}
                      onChange={(e) => update(index, "product", e.target.value)}
                      placeholder="نام محصول"
                      list="products-list"
                    />
                    <datalist id="products-list">
                      {data.products.map((p) => (
                        <option key={p.id} value={p.name} />
                      ))}
                    </datalist>
                  </td>
                  <td data-label="تعداد">
                    <input
                      aria-label={`تعداد، قلم ${index + 1}`}
                      type="number"
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        update(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td data-label="قیمت واحد">
                    <input
                      aria-label={`قیمت واحد، قلم ${index + 1}`}
                      type="number"
                      min="0"
                      value={item.price}
                      onChange={(e) => update(index, "price", e.target.value)}
                    />
                  </td>
                  <td data-label="تخفیف">
                    <input
                      aria-label={`تخفیف، قلم ${index + 1}`}
                      type="number"
                      min="0"
                      value={item.discount}
                      onChange={(e) =>
                        update(index, "discount", e.target.value)
                      }
                    />
                  </td>
                  <td data-label="مجموع" className="entry-total">
                    {number(
                      Number(item.quantity || 0) * Number(item.price || 0) -
                        Number(item.discount || 0),
                    )}
                  </td>
                  <td data-label="حذف قلم" className="entry-remove">
                    <button
                      aria-label={`حذف قلم ${index + 1}`}
                      type="button"
                      className="icon-btn small danger"
                      onClick={() =>
                        setItems(items.filter((_, i) => i !== index))
                      }
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" className="add-line" onClick={addRow}>
          <Plus size={14} /> افزودن قلم
        </button>
      </div>
      <label className="full-label">
        توضیحات
        <textarea
          rows="2"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>
      <div className="invoice-total">
        <span>جمع کل (افغانی)</span>
        <strong>{money(total)}</strong>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          لغو
        </button>
        <button className="btn primary">
          <Save size={15} /> ثبت بل
        </button>
      </div>
    </form>
  );
}
function JournalForm({ form, setForm, items, setItems, onSubmit, onCancel }) {
  const update = (index, key, value) =>
    setItems(
      items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  const debit = items.reduce((s, x) => s + Number(x.debit || 0), 0),
    credit = items.reduce((s, x) => s + Number(x.credit || 0), 0);
  return (
    <form onSubmit={onSubmit}>
      <div className="modal-grid">
        <label>
          نام سند
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>
        <label>
          تاریخ
          <input
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
      </div>
      <div className="invoice-lines">
        <div className="lines-title">
          <strong>تراکنش‌ها</strong>
          <button
            type="button"
            className="add-line"
            onClick={() =>
              setItems([
                ...items,
                { account: "", description: "", debit: 0, credit: 0 },
              ])
            }
          >
            <Plus size={14} /> افزودن تراکنش
          </button>
        </div>
        <div className="table-wrap responsive-entry-lines">
          <table>
            <thead>
              <tr>
                <th>عنوان سرفصل</th>
                <th>توضیحات</th>
                <th>بدهکار</th>
                <th>بستانکار</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i}>
                  <td data-label="عنوان سرفصل">
                    <input
                      aria-label={`عنوان سرفصل، تراکنش ${i + 1}`}
                      value={item.account}
                      onChange={(e) => update(i, "account", e.target.value)}
                      placeholder="نام سرفصل"
                    />
                  </td>
                  <td data-label="توضیحات">
                    <input
                      aria-label={`توضیحات، تراکنش ${i + 1}`}
                      value={item.description}
                      onChange={(e) => update(i, "description", e.target.value)}
                    />
                  </td>
                  <td data-label="بدهکار">
                    <input
                      aria-label={`بدهکار، تراکنش ${i + 1}`}
                      type="number"
                      min="0"
                      value={item.debit}
                      onChange={(e) => update(i, "debit", e.target.value)}
                    />
                  </td>
                  <td data-label="بستانکار">
                    <input
                      aria-label={`بستانکار، تراکنش ${i + 1}`}
                      type="number"
                      min="0"
                      value={item.credit}
                      onChange={(e) => update(i, "credit", e.target.value)}
                    />
                  </td>
                  <td data-label="حذف تراکنش" className="entry-remove">
                    <button
                      aria-label={`حذف تراکنش ${i + 1}`}
                      type="button"
                      className="icon-btn small danger"
                      onClick={() => setItems(items.filter((_, n) => n !== i))}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="balance-row">
        <span>
          مجموع بدهکار: <b>{money(debit)}</b>
        </span>
        <span>
          مجموع بستانکار: <b>{money(credit)}</b>
        </span>
      </div>
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          لغو
        </button>
        <button className="btn primary">
          <Save size={15} /> ذخیره سند
        </button>
      </div>
    </form>
  );
}
function Modal({ title, onClose, children }) {
  return (
    <div
      dir="rtl"
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="بستن پنجره">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
function downloadCsv(title, columns, rows) {
  const csv = [
    columns.map((x) => x[1]).join(","),
    ...rows.map((row) =>
      columns
        .map(([key]) => `"${String(row[key] ?? "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ].join("\n");
  downloadFile(`${title}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8;");
}
function downloadInvoiceCsv(rows) {
  downloadCsv(
    "بلها",
    [
      ["number", "شماره بل"],
      ["date", "تاریخ"],
      ["party", "طرف حساب"],
      ["total", "مبلغ"],
      ["balance", "مانده"],
      ["status", "وضعیت"],
    ],
    rows,
  );
}
function downloadJournalCsv(rows) {
  downloadCsv(
    "اسناد حسابداری",
    [
      ["number", "شماره سند"],
      ["date", "تاریخ"],
      ["name", "نام سند"],
      ["debit", "بدهکار"],
      ["credit", "بستانکار"],
    ],
    rows,
  );
}
function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

createRoot(document.getElementById("root")).render(<App />);
