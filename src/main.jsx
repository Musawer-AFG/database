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
import { AFGHAN_MONTHS, DEFAULT_WAREHOUSE, afghanCalendarParts, afghanDateOrder, isInAfghanRange, cash, inventoryState, findProduct, saleStockError, payrollAmounts, journalBalances, reportSummary } from "./business.js";
import "./styles.css";
import "./responsive.css";
import { AFGHAN_PROVINCES, AFGHAN_FIELD_CHOICES, dateChoiceParts, buildAfghanDate } from "./afghanLocale.js";

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
      { id: "ledgerReport", label: "گزارش کل" },
      { id: "documentReport", label: "گزارش اسناد" },
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
  ledgerReport: BookOpen,
  documentReport: FileText,
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
    description: "اجناس و موجودی گدام خود را مدیریت کنید",
    add: "ایجاد محصول",
    fields: [
      ["code", "کد محصول"],
      ["name", "نام محصول"],
      ["sstid", "شناسه SSTID محصول"],
      ["group", "گروه محصول"],
      ["unit", "واحد"],
      ["quantity", "موجودی آغازین"],
      ["warehouseId", "گدام آغازین"],
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
    description: "گروه‌های محصولات و تنظیمات حسابداری آن‌ها",
    add: "ایجاد گروه محصول",
    fields: [
      ["name", "نام گروه"],
      ["inventoryAccount", "سرفصل موجودی اجناس"],
      ["salesAccount", "سرفصل درآمد"],
      ["returnAccount", "سرفصل فروش برگشتی"],
      ["cogsAccount", "موضوع بهای تمام‌شده"],
    ],
    columns: [
      ["name", "نام گروه"],
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
      ["economicNumber", "نمبر مالیاتی (TIN) — اختیاری"],
      ["phone", "نمبر تیلفون"],
      ["mobile", "نمبر موبایل"],
      ["group", "گروه مشتریان"],
      ["province", "ولایت"],
      ["district", "ولسوالی / ناحیه"],
      ["address", "آدرس"],
      ["notes", "یادداشت"],
    ],
    columns: [
      ["code", "کد حسابداری"],
      ["name", "نام مشتری"],
      ["type", "نوع"],
      ["economicNumber", "نمبر مالیاتی (TIN)"],
      ["phone", "نمبر تیلفون"],
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
      ["economicNumber", "نمبر مالیاتی (TIN) — اختیاری"],
      ["phone", "نمبر تیلفون"],
      ["mobile", "نمبر موبایل"],
      ["group", "گروه عرضه‌کنندگان"],
      ["province", "ولایت"],
      ["district", "ولسوالی / ناحیه"],
      ["address", "آدرس"],
      ["notes", "یادداشت"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام عرضه‌کننده"],
      ["economicNumber", "نمبر مالیاتی (TIN)"],
      ["phone", "نمبر تیلفون"],
      ["group", "گروه"],
      ["balance", "مانده (افغانی)"],
    ],
  },
  warehouses: {
    title: "گدام‌ها",
    description: "گدام‌ها و محل نگهداری اجناس را مدیریت کنید",
    add: "ایجاد گدام",
    fields: [
      ["code", "کد گدام"],
      ["name", "نام گدام"],
      ["province", "ولایت"],
      ["district", "ولسوالی / ناحیه"],
      ["location", "آدرس گدام"],
      ["manager", "مسؤول گدام"],
      ["status", "وضعیت"],
    ],
    columns: [
      ["code", "کد"],
      ["name", "نام گدام"],
      ["location", "موقعیت"],
      ["manager", "مسؤول"],
      ["quantity", "تعداد موجودی"],
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
      ["tazkira", "نمبر تذکره (کاغذی / الکترونیکی)"],
      ["passport", "نمبر پاسپورت (اختیاری)"],
      ["gender", "جنسیت"],
      ["marital", "حالت مدنی"],
      ["nationality", "تابعیت"],
      ["birthDate", "تاریخ تولد (هجری شمسی)"],
      ["phone", "نمبر تیلفون"],
      ["province", "ولایت"],
      ["district", "ولسوالی / ناحیه"],
      ["address", "آدرس"],
      ["unit", "واحد سازمانی"],
      ["position", "جایگاه وظیفوی"],
      ["workshop", "شعبه / محل کار"],
      ["shift", "شیفت کاری"],
      ["contract", "نوع قرارداد"],
      ["startDate", "تاریخ آغاز قرارداد (هجری شمسی)"],
      ["endDate", "تاریخ ختم قرارداد (هجری شمسی)"],
      ["education", "سطح تحصیلات"],
      ["salary", "معاش ماهانه (افغانی)"],
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
  stockMovements: [],
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
  const [stockMovementForm, setStockMovementForm] = useState({
    kind: "in", productId: "", warehouseId: DEFAULT_WAREHOUSE,
    fromWarehouseId: DEFAULT_WAREHOUSE, toWarehouseId: "", quantity: "", date: today, notes: ""
  });
  const [payrollForm, setPayrollForm] = useState({});
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
    if (key === "products" && !String(form.name || "").trim()) { notify("نام محصول ضروری است."); return; }
    if (key === "products" && ["quantity", "cost", "price"].some(k => Number(form[k] || 0) < 0)) {
      notify("تعداد و قیمت محصول نباید منفی باشد."); return;
    }
    const entry = { ...form, id: editId ?? Date.now() };
    if (key === "products") {
      const proposed = { ...data, products: editId
        ? data.products.map(p => p.id === editId ? entry : p)
        : [...data.products, entry] };
      if ([...inventoryState(proposed).positions.values()].some(q => q < -0.00001)) {
        notify("این تغییر باعث موجودی منفی می‌شود. ابتدا معاملات و حرکت‌های گدام را بررسی کنید."); return;
      }
      if (editId && String(form.name||'') !== String(data.products.find(p=>p.id===editId)?.name||'') &&
        data.invoices.some(inv => (inv.items||[]).some(line => !line.productId && line.product === data.products.find(p=>p.id===editId)?.name))) {
        notify("برای حفظ بل‌های قدیمی، نام این محصول را نمی‌توان تغییر داد."); return;
      }
    }
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
    if (key === "products" && (
      data.invoices.some(inv => (inv.items || []).some(line => String(line.productId) === String(id) || line.product === data.products.find(p => p.id === id)?.name)) ||
      data.stockMovements.some(m => String(m.productId) === String(id))
    )) { notify("این محصول سابقه معامله دارد؛ برای حفظ سابقه حذف نمی‌شود."); return; }
    if (key === "warehouses" && (
      data.products.some(p => String(p.warehouseId) === String(id)) ||
      data.invoices.some(i => String(i.warehouseId) === String(id)) ||
      data.stockMovements.some(m => [m.warehouseId,m.fromWarehouseId,m.toWarehouseId].some(x => String(x)===String(id)))
    )) { notify("این گدام مورد استفاده است و حذف نمی‌شود."); return; }
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((r) => r.id !== id),
    }));
    notify("مورد حذف شد.");
  }
  function openInvoice(type) {
    setInvoiceForm({ date: today, party: "", title: "", paid: 0, notes: "", warehouseId: DEFAULT_WAREHOUSE });
    setInvoiceItems([{ product: "", quantity: 1, price: "", discount: 0 }]);
    setModal({ type: "invoice", invoiceType: type });
  }
  function saveInvoice(e) {
    e.preventDefault();
    if (!invoiceItems.length) { notify("حداقل یک قلم در بل اضافه کنید."); return; }
    if (!invoiceItems.every(i => Number(i.quantity) > 0 && Number(i.price) >= 0 && Number(i.discount || 0) >= 0 && Number(i.discount || 0) <= Number(i.quantity) * Number(i.price))) {
      notify("تعداد، قیمت و تخفیف اقلام را بررسی کنید."); return;
    }
    const unknown = invoiceItems.find(i => !findProduct(i, data.products));
    if (unknown) { notify(`محصول «${unknown.product || "نامشخص"}» ثبت نشده است.`); return; }
    if (modal.invoiceType === "sale") {
      const error = saleStockError(data, invoiceItems, invoiceForm.warehouseId);
      if (error) { notify(error); return; }
    }
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
      items: invoiceItems.map((x) => ({ ...x, productId: findProduct(x, data.products)?.id })),
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
  function deleteInvoice(id) {
    const existing = data.invoices.find(x => x.id === id);
    if (!existing) return;
    const before = inventoryState(data);
    const after = inventoryState({ ...data, invoices: data.invoices.filter(x => x.id !== id) });
    for (const [key, quantity] of after.positions) {
      if (quantity < 0 && quantity < (before.positions.get(key) || 0)) {
        notify("حذف این بل موجودی گدام را منفی می‌کند. ابتدا حرکات بعدی را بررسی کنید.");
        return;
      }
    }
    setData(prev => ({ ...prev, invoices: prev.invoices.filter(x => x.id !== id) }));
    notify("بل حذف شد و موجودی گدام به‌روز گردید.");
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
  function openStockMovement() {
    setStockMovementForm({ kind: "in", productId: "", warehouseId: DEFAULT_WAREHOUSE, fromWarehouseId: DEFAULT_WAREHOUSE,
      toWarehouseId: "", quantity: "", date: today, notes: "" });
    setModal({ type: "stock" });
  }
  function saveStockMovement(e) {
    e.preventDefault();
    const item = stockMovementForm;
    const qty = Number(item.quantity);
    if (!item.productId || !Number.isFinite(qty) || qty <= 0) { notify("محصول و تعداد معتبر انتخاب کنید."); return; }
    const origin = item.kind === "transfer" ? item.fromWarehouseId : item.warehouseId;
    if (item.kind === "transfer" && (!item.toWarehouseId || item.toWarehouseId === origin)) {
      notify("گدام مبدأ و مقصد باید متفاوت باشد."); return;
    }
    if ((item.kind === "out" || item.kind === "transfer") && inventoryState(data).get(item.productId, origin) < qty) {
      notify("موجودی کافی در گدام انتخاب‌شده وجود ندارد."); return;
    }
    setData(prev => ({ ...prev, stockMovements: [{ ...item, id: Date.now(), quantity: qty }, ...prev.stockMovements] }));
    setModal(null); notify("حرکت گدام ثبت شد.");
  }
  function openPayroll(selectedYear, selectedMonth) {
    const parts = afghanCalendarParts();
    setPayrollForm({ employeeId: "", year: String(selectedYear || parts.year), month: String(selectedMonth || parts.month), base: "", bonus: "0",
      deduction: "0", date: today, notes: "" });
    setModal({ type: "payroll" });
  }
  function savePayroll(e) {
    e.preventDefault();
    const record = payrollForm;
    const employee = data.employees.find(x => String(x.id) === String(record.employeeId));
    if (!employee) { notify("کارمند را انتخاب کنید."); return; }
    const year = Number(record.year), month = Number(record.month);
    if (year < 1300 || year > 1600 || month < 1 || month > 12) { notify("ماه و سال افغانى معتبر انتخاب کنید."); return; }
    if ([record.base, record.bonus, record.deduction].some(v => !Number.isFinite(Number(v)) || Number(v) < 0)) {
      notify("مبالغ معاش نباید منفی باشند."); return;
    }
    if (Number(record.deduction) > Number(record.base) + Number(record.bonus)) { notify("کسورات نمی‌تواند بیشتر از مجموع معاش باشد."); return; }
    if (data.payroll.some(x => String(x.employeeId) === String(employee.id) && Number(x.year) === year && Number(x.month) === month)) {
      notify("برای این کارمند در ماه انتخاب‌شده برگه معاش موجود است."); return;
    }
    const amounts = payrollAmounts(record);
    setData(prev => ({ ...prev, payroll: [{ ...record, ...amounts, year, month, employeeName: [employee.firstName, employee.lastName].filter(Boolean).join(" "),
      unit: employee.unit || "—", status: "draft", id: Date.now() }, ...prev.payroll] }));
    setModal(null); notify("برگه معاش ثبت شد.");
  }
  function markPayrollPaid(id) {
    setData(prev => ({ ...prev, payroll: prev.payroll.map(x => x.id === id ? { ...x, status: "paid", paidDate: today } : x) }));
    notify("پرداخت معاش ثبت شد.");
  }
  function deletePayroll(id) {
    const record = data.payroll.find(x => x.id === id);
    if (record?.status === "paid") { notify("برگه پرداخت‌شده را نمی‌توان حذف کرد."); return; }
    setData(prev => ({ ...prev, payroll: prev.payroll.filter(x => x.id !== id) }));
    notify("برگه معاش حذف شد.");
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
    if (!journalItems.length || debit <= 0 || cash(debit) !== cash(credit) || journalItems.some(r => !String(r.account || "").trim() || (Number(r.debit||0)>0 && Number(r.credit||0)>0))) {
      notify("سند باید حداقل دو حساب و مجموع بدهکار و بستانکار مساوی داشته باشد."); return;
    }
    const entry = {
      id: Date.now(),
      number: data.journals.length ? Math.max(...data.journals.map(j=>Number(j.number)||0)) + 1 : 1,
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
      stock: inventoryState(data).value,
      expenses: data.expenses.reduce((s,x)=>s+Number(x.amount||0),0),
      paidWages: data.payroll.filter(x=>x.status==='paid').reduce((s,x)=>s+payrollAmounts(x).net,0),
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
        <WarehouseDashboard data={data} totals={totals} onNavigate={setCurrentPage} onStock={openStockMovement} />
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
          inventory={inventoryState(data)}
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
          onDelete={deleteInvoice}
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
      return <PayrollPage data={data} onNavigate={setCurrentPage} onAdd={openPayroll} onPaid={markPayrollPaid} onDelete={deletePayroll} />;
    if (page === "attendance") return <AttendancePage data={data} />;
    if (["reports", "trialBalance", "journalReport", "ledgerReport", "documentReport"].includes(page))
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
                  : modal.type === "stock" ? "ثبت حرکت گدام"
                  : modal.type === "payroll" ? "محاسبه و ثبت معاش"
                  : "ثبت مصارف"
          }
          onClose={() => setModal(null)}
        >
          {modal.type === "entity" && (
            <EntityForm
              config={entityConfigs[modal.key]}
              form={form}
              setForm={setForm}
              data={data}
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
          {modal.type === "stock" && <StockMovementForm data={data} form={stockMovementForm} setForm={setStockMovementForm} onSubmit={saveStockMovement} onCancel={() => setModal(null)} />}
          {modal.type === "payroll" && <PayrollForm data={data} form={payrollForm} setForm={setPayrollForm} onSubmit={savePayroll} onCancel={() => setModal(null)} />}
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
          note="به اساس بهای تمام‌شده موجودی فعلی"
        />
        <StatCard
          label="درآمد از ابتدای سال"
          value={money(totals.sales)}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="مصارف ثبت‌شده"
          value={money(totals.expenses)}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="معاشات پرداخت‌شده"
          value={money(totals.paidWages)}
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
          <MonthlyOverview data={data} />
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
          <TopProducts data={data} />
        </Panel>
        <Panel
          title="فعالیت‌های اخیر"
          action={<span className="muted-pill">آخرین رویدادها</span>}
        >
          <RecentBusinessActivity data={data} />
        </Panel>
      </div>
    </>
  );
}
function MonthlyOverview({ data }) {
  const currentYear = afghanCalendarParts().year;
  const monthly = afghanMonths.map((name,index)=> {
    const period=`${currentYear}/${String(index+1).padStart(2,'0')}`;
    const summary=reportSummary(data,`${period}/01`,`${period}/${index < 6 ? '31' : '30'}`);
    return {name,sales:summary.sales,expenses:summary.expenses};
  });
  const maximum=Math.max(1,...monthly.flatMap(m=>[m.sales,m.expenses]));
  return <div className="monthly-overview">
    <div className="monthly-legend"><span className="sale-key">فروش</span><span className="expense-key">مصارف</span></div>
    {monthly.map(m=><div key={m.name} className="monthly-row"><span>{m.name}</span><div className="monthly-bars">
      <div title={`فروش: ${money(m.sales)}`}><i className="sales-bar" style={{width:`${m.sales/maximum*100}%`}}/></div>
      <div title={`مصارف: ${money(m.expenses)}`}><i className="expense-bar" style={{width:`${m.expenses/maximum*100}%`}}/></div>
    </div><strong>{money(m.sales)}</strong></div>)}
  </div>;
}
function TopProducts({data}) {
  const totals = new Map();
  for (const invoice of data.invoices.filter(x=>x.type==='sale')) for(const line of invoice.items||[]) {
    const name=line.product||'نامشخص';totals.set(name,(totals.get(name)||0)+Number(line.quantity||0));
  }
  const rows=[...totals.entries()].sort((a,b)=>b[1]-a[1]).slice(0,7).map(([name,quantity],i)=>({id:i,name,quantity}));
  return <DataTable columns={[["name","محصول"],["quantity","تعداد فروش"]]} rows={rows} empty="هنوز فروشی ثبت نشده است."/>;
}
function RecentBusinessActivity({data}) {
  const rows=[...data.invoices.map(x=>({id:`i-${x.id}`,date:x.date,category:x.type==='sale'?'فروش':x.type==='purchase'?'خرید':'برگشتی',title:x.party||x.title||'—',amount:x.total})),
    ...data.expenses.map(x=>({id:`e-${x.id}`,date:x.date,category:'مصرف',title:x.name,amount:x.amount}))]
    .sort((a,b)=>afghanDateOrder(b.date)-afghanDateOrder(a.date)).slice(0,6);
  return <DataTable columns={[["date","تاریخ"],["category","نوع"],["title","شرح"],["amount","مبلغ"]]} rows={rows} empty="فعالیتی برای نمایش وجود ندارد."/>;
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
function WarehouseDashboard({ data, totals, onNavigate, onStock }) {
  const inventory = inventoryState(data);
  const lowStock = inventory.rows.filter(p => Number(p.reorder || 0) > 0 && p.quantity <= Number(p.reorder));
  const groups = Object.entries(inventory.rows.reduce((acc, p) => {
    const group = p.group || "عمومی";
    acc[group] = (acc[group] || 0) + 1;
    return acc;
  }, {})).map(([label, amount]) => ({label,amount}));
  const warehouses = [{id: DEFAULT_WAREHOUSE, name: "گدام عمومی"}, ...data.warehouses];
  const warehouseRows = warehouses.map(w => ({
    id: w.id, name: w.name,
    quantity: inventory.rows.reduce((sum, p) => sum + inventory.get(p.id, w.id), 0),
    value: inventory.rows.reduce((sum,p) => sum + inventory.get(p.id,w.id)*Number(p.cost||0),0)
  })).filter(w => w.id !== DEFAULT_WAREHOUSE || w.quantity !== 0 || !data.warehouses.length);
  const warehouseNames = Object.fromEntries(warehouses.map(x => [String(x.id),x.name]));
  const activity = inventory.movements.slice().reverse().slice(0, 12).map(m => ({
    ...m, warehouse: m.type === "transfer" ? `${warehouseNames[m.fromWarehouseId] || 'گدام عمومی'} ← ${warehouseNames[m.toWarehouseId] || 'گدام عمومی'}` : warehouseNames[m.warehouseId] || 'گدام عمومی',
    movement: m.quantity > 0 ? `+${number(m.quantity)}` : number(m.quantity)
  }));
  return <>
    <PageHeading title="داشبورد گدام" description="موجودی زنده، حرکت اجناس و وضعیت گدام‌ها بر اساس بل‌ها و اصلاحات ثبت‌شده"
      actions={<><button className="btn secondary" onClick={() => onNavigate("products")}><Package size={16}/> محصولات</button>
        <button className="btn primary" onClick={onStock}><ArrowLeftRight size={16}/> ثبت حرکت گدام</button></>}/>
    <div className="stats-grid six">
      <StatCard label="ارزش موجودی" value={money(inventory.value)} icon={CircleDollarSign} tone="blue"/>
      <StatCard label="محصولات ثبت‌شده" value={number(inventory.rows.length)} icon={Package} tone="violet"/>
      <StatCard label="تعداد موجودی" value={number(inventory.totalQuantity)} icon={Boxes} tone="green"/>
      <StatCard label="زیر نقطه سفارش" value={number(lowStock.length)} icon={AlertCircle} tone="rose"/>
      <StatCard label="کل ورودی ثبت‌شده" value={number(inventory.incoming)} icon={ArrowDownLeft} tone="cyan"/>
      <StatCard label="کل خروجی ثبت‌شده" value={number(inventory.outgoing)} icon={ArrowUpLeft} tone="amber"/>
    </div>
    <div className="dashboard-grid">
      <Panel title="موجودی به تفکیک گدام" action={<button className="text-btn" onClick={() => onNavigate('warehouses')}>مدیریت گدام‌ها</button>}>
        <DataTable columns={[["name","گدام"],["quantity","مجموع تعداد"],["value","ارزش موجودی (افغانی)"]]} rows={warehouseRows} empty="گدامی ثبت نشده است."/>
      </Panel>
      <Panel title="محصولات به تفکیک گروه">
        {groups.length ? <div className="bars-list">{groups.map(g => <div className="bar-item" key={g.label}><div><strong>{g.label}</strong><span>{number(g.amount)} محصول</span></div><div className="bar-track"><span style={{width:`${Math.round(g.amount / Math.max(...groups.map(x=>x.amount))*100)}%`}}/></div></div>)}</div>
        : <EmptyState text="برای نمایش گروه‌ها، ابتدا محصول ثبت کنید."/>}
      </Panel>
      <Panel title="محصولات کم‌موجودی" action={<span className="muted-pill">{number(lowStock.length)} محصول</span>}>
        <DataTable columns={[["name","محصول"],["quantity","موجودی"],["reorder","نقطه سفارش"]]} rows={lowStock}
          empty="در حال حاضر محصولی زیر نقطه سفارش نیست."/>
      </Panel>
      <Panel title="آخرین حرکت‌های گدام">
        <DataTable columns={[["date","تاریخ"],["product","محصول"],["warehouse","گدام"],["movement","تغییر تعداد"],["source","نوع ثبت"]]} rows={activity} empty="تا هنوز حرکتی ثبت نشده است."/>
      </Panel>
    </div>
    <p className="info-note">موجودی فعلی = موجودی آغازین + خریدها + برگشتی‌ها + ورودی‌ها − فروشات − خروجی‌ها. انتقال میان گدام‌ها مجموع موجودی را تغییر نمی‌دهد.</p>
  </>;
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
  inventory,
}) {
  const cfg = entityConfigs[page];
  const rows = page === "products" ? inventory.rows : page === "warehouses" ? (data.warehouses || []).map(w => ({
    ...w, quantity: data.products.reduce((sum, product) => sum + inventory.get(product.id, w.id), 0)
  })) : page === "customers"
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
      "quantity",
      "reorder",
      "amount",
      "value",
      "gross",
      "net",
      "deduction",
      "debitBalance",
      "creditBalance",
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
        <AfghanDatePicker required value={form.date} onChange={date=>setForm({...form,date})}/>
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
            <AfghanDatePicker value={form.date} onChange={date=>setForm({...form,date})} required/>
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
function PayrollPage({ data, onNavigate, onAdd, onPaid, onDelete }) {
  const current = afghanCalendarParts();
  const [month, setMonth] = useState(String(current.month));
  const [year, setYear] = useState(String(current.year));
  const [unit, setUnit] = useState('all');
  const units = [...new Set(data.employees.map(x=>x.unit).filter(Boolean))];
  const rows = (data.payroll || []).filter(p =>
    (month === 'all' || Number(p.month) === Number(month)) && (year === 'all' || Number(p.year) === Number(year)) &&
    (unit === 'all' || p.unit === unit)
  );
  const payrollTotal = rows.reduce((a,p)=> {
    const v = payrollAmounts(p);
    return { gross: a.gross+v.gross, deduction:a.deduction+v.deduction, net:a.net+v.net };
  }, { gross:0,deduction:0,net:0 });
  const paid = rows.filter(p => p.status === 'paid');
  return <>
    <PageHeading title="معاشات و دستمزد" description="محاسبه معاش ماهانه، ثبت کسورات و ثبت پرداخت کارمندان"
      actions={<><button className="btn secondary" onClick={()=>onNavigate('employees')}><Users size={16}/> کارمندان</button>
        <button className="btn primary" onClick={()=>onAdd(year === 'all' ? current.year : year, month === 'all' ? current.month : month)}><Plus size={16}/> محاسبه معاش</button></>}/>
    <div className="filter-row">
      <label>ماه<select value={month} onChange={e=>setMonth(e.target.value)}><option value="all">تمام ماه‌ها</option>{afghanMonths.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></label>
      <label>سال هجری شمسی<select value={year} onChange={e=>setYear(e.target.value)}><option value="all">همه سال‌ها</option>{[current.year-1,current.year,current.year+1].map(y=><option key={y} value={y}>{number(y)}</option>)}</select></label>
      <label>واحد سازمانی<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="all">همه واحدها</option>{units.map(u=><option key={u}>{u}</option>)}</select></label>
      <button className="btn secondary" onClick={()=>{setMonth('all');setYear('all');setUnit('all')}}>نمایش همه</button>
    </div>
    <div className="stats-grid six">
      <StatCard label="معاش ناخالص" value={money(payrollTotal.gross)} icon={Wallet} tone="blue"/>
      <StatCard label="کسورات" value={money(payrollTotal.deduction)} icon={TrendingDown} tone="rose"/>
      <StatCard label="معاش خالص" value={money(payrollTotal.net)} icon={CircleDollarSign} tone="green"/>
      <StatCard label="برگه‌های معاش" value={number(rows.length)} icon={Users} tone="amber"/>
      <StatCard label="معاش پرداخت‌شده" value={money(paid.reduce((s,x)=>s+payrollAmounts(x).net,0))} icon={Activity} tone="cyan"/>
    </div>
    <Panel title="برگه‌های معاش کارمندان" action={<button className="btn secondary" onClick={()=> downloadCsv('معاشات', [['employeeName','کارمند'],['monthName','ماه'],['year','سال'],['gross','ناخالص'],['deduction','کسورات'],['net','خالص'],['paidLabel','وضعیت']], rows.map(x=>({...x,monthName:afghanMonths[Number(x.month)-1],paidLabel:x.status==='paid'?'پرداخت شده':'پرداخت نشده'})))}><Download size={15}/> خروجی CSV</button>}>
      <div className="table-wrap mobile-card-table"><table><thead><tr><th>کارمند</th><th>ماه</th><th>واحد</th><th>ناخالص</th><th>کسورات</th><th>خالص</th><th>وضعیت</th><th>عملیات</th></tr></thead>
        <tbody>{rows.map(p=> {const v=payrollAmounts(p);return <tr key={p.id}>
          <td data-label="کارمند">{p.employeeName}</td><td data-label="ماه">{afghanMonths[Number(p.month)-1]} {number(p.year)}</td><td data-label="واحد">{p.unit||'—'}</td>
          <td data-label="ناخالص">{money(v.gross)}</td><td data-label="کسورات">{money(v.deduction)}</td><td data-label="خالص">{money(v.net)}</td>
          <td data-label="وضعیت"><span className={`status ${p.status==='paid'?'success':'warning'}`}>{p.status==='paid'?'پرداخت شده':'پرداخت نشده'}</span></td>
          <td data-label="عملیات" className="table-action-cell"><div className="row-actions">
            {p.status!=='paid' && <><button className="btn primary" onClick={()=>onPaid(p.id)}>ثبت پرداخت</button><button className="icon-btn small danger" title="حذف برگه" onClick={()=>onDelete(p.id)}><Trash2 size={15}/></button></>}
          </div></td>
        </tr>})}{!rows.length && <tr className="empty-data-row"><td className="empty-table-cell" colSpan={8}><EmptyState text={data.employees.length ? 'برای این دوره برگه معاش ثبت نشده است. روی «محاسبه معاش» بزنید.' : 'ابتدا کارمند ثبت کنید و معاش ماهانه او را وارد نمایید.'}/></td></tr>}</tbody>
      </table></div>
    </Panel>
    <p className="info-note">این نسخه صرف برای نمایش معاشات است. محاسبه کسورات مطابق قوانین افغانستان به‌صورت خودکار فعال نیست.</p>
  </>;
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
  const titles = {trialBalance:'تراز آزمایشی',journalReport:'گزارش روزنامه',ledgerReport:'گزارش کل',documentReport:'گزارش اسناد',reports:'گزارش عمومی'};
  const title = titles[page] || 'گزارش عمومی';
  const [filter, setFilter] = useState({from:'',to:'',min:'',max:''});
  const [applied, setApplied] = useState({from:'',to:'',min:'',max:''});
  const [error, setError] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const saveFilter = (e) => {
    e.preventDefault();
    if ((filter.from && !afghanDateOrder(filter.from)) || (filter.to && !afghanDateOrder(filter.to))) {
      setError('تاریخ را مانند 1405/08/21 یا ۲۱ عقرب ۱۴۰۵ وارد کنید.'); return;
    }
    if (filter.from && filter.to && afghanDateOrder(filter.from) > afghanDateOrder(filter.to)) {
      setError('تاریخ شروع بعد از تاریخ پایان است.'); return;
    }
    setError(''); setApplied({...filter});
  };
  const journals = data.journals.filter(j => isInAfghanRange(j.date, applied.from, applied.to) &&
    (!applied.min || Number(j.number) >= Number(applied.min)) && (!applied.max || Number(j.number) <= Number(applied.max)));
  const balances = journalBalances(journals).map(x => ({...x, debitBalance: Math.max(0,cash(x.debit-x.credit)), creditBalance: Math.max(0,cash(x.credit-x.debit))}));
  const totalDebit = balances.reduce((s,x)=>s+x.debit,0);
  const totalCredit = balances.reduce((s,x)=>s+x.credit,0);
  const journalLines = journals.flatMap(j => (j.rows||[]).map((line, i)=>({
    id:`${j.id}-${i}`, number:j.number, date:j.date, name:j.name, account:line.account,
    description:line.description, debit:Number(line.debit||0), credit:Number(line.credit||0)
  })));
  const ledgerAccounts = [...new Set(journalLines.map(x => x.account).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fa'));
  const ledgerLines = accountFilter === 'all' ? journalLines : journalLines.filter(x => x.account === accountFilter);
  const documentRows = journals.map(j => ({id:j.id,number:j.number,date:j.date,name:j.name,debit:Number(j.debit||0),credit:Number(j.credit||0)}));
  const business = reportSummary(data, applied.from, applied.to);
  const businessRows = [
    ...business.invoices.map(x=>({id:`inv-${x.id}`,date:x.date,kind:x.type==='sale'?'بل فروش':x.type==='purchase'?'بل خرید':'بل برگشتی',name:x.party||x.title||'—',amount:x.total,paid:x.paid||0,balance:x.balance||0})),
    ...business.expensesRows.map(x=>({id:`ex-${x.id}`,date:x.date,kind:'مصرف',name:x.name,amount:x.amount,paid:x.amount,balance:0})),
    ...business.payrollRows.map(x=>({id:`pay-${x.id}`,date:x.paidDate||x.date,kind:'معاش پرداخت‌شده',name:x.employeeName,amount:payrollAmounts(x).net,paid:payrollAmounts(x).net,balance:0}))
  ].sort((a,b)=>afghanDateOrder(b.date)-afghanDateOrder(a.date));
  const columns = page==='reports' ? [['date','تاریخ'],['kind','نوع'],['name','شرح'],['amount','مبلغ (افغانی)'],['paid','پرداخت'],['balance','مانده']]
    : page==='trialBalance' ? [['account','سرفصل حساب'],['debit','گردش بدهکار'],['credit','گردش بستانکار'],['debitBalance','مانده بدهکار'],['creditBalance','مانده بستانکار']]
    : page==='documentReport' ? [['number','شماره سند'],['date','تاریخ'],['name','نام سند'],['debit','بدهکار'],['credit','بستانکار']]
    : [['number','شماره سند'],['date','تاریخ'],['name','نام سند'],['account','سرفصل'],['description','شرح'],['debit','بدهکار'],['credit','بستانکار']];
  const rows = page==='reports' ? businessRows : page==='trialBalance' ? balances : page==='ledgerReport' ? ledgerLines : page==='documentReport' ? documentRows : journalLines;
  return <>
    <PageHeading title={title} description="گزارش‌های قابل جستجو از معلومات ثبت‌شده در همین مرورگر"
      actions={<><button className="btn secondary" onClick={()=>downloadCsv(title,columns,rows)}><Download size={15}/> خروجی CSV</button>
      <button className="btn secondary" onClick={()=>window.print()}><Printer size={15}/> چاپ گزارش</button></>}/>
    <Panel title="فلتر گزارش">
      <form className="report-filter" onSubmit={saveFilter}>
        <label>تاریخ شروع (هجری شمسی)<AfghanDatePicker value={filter.from} onChange={date=>setFilter({...filter,from:date})}/></label>
        <label>تاریخ پایان (هجری شمسی)<AfghanDatePicker value={filter.to} onChange={date=>setFilter({...filter,to:date})}/></label>
        {page==='ledgerReport' && <label>سرفصل حساب<select value={accountFilter} onChange={e=>setAccountFilter(e.target.value)}><option value="all">همه سرفصل‌ها</option>{ledgerAccounts.map(name=><option key={name}>{name}</option>)}</select></label>}
        {page!=='reports' && <><label>شماره شروع سند<input type="number" min="1" value={filter.min} onChange={e=>setFilter({...filter,min:e.target.value})} placeholder="از شماره"/></label>
          <label>شماره پایان سند<input type="number" min="1" value={filter.max} onChange={e=>setFilter({...filter,max:e.target.value})} placeholder="تا شماره"/></label></>}
        <button className="btn primary" type="submit"><Search size={15}/> نمایش گزارش</button>
        <button className="btn secondary" type="button" onClick={()=>{setFilter({from:'',to:'',min:'',max:''});setApplied({from:'',to:'',min:'',max:''});setError('')}}>پاک کردن فلتر</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Panel>
    {page==='reports' ? <div className="stats-grid six">
      <StatCard label="مجموع فروش" value={money(business.sales)} icon={TrendingUp} tone="green"/>
      <StatCard label="مجموع خرید" value={money(business.purchases)} icon={ShoppingCart} tone="blue"/>
      <StatCard label="برگشتی‌ها" value={money(business.returns)} icon={Undo2} tone="violet"/>
      <StatCard label="طلبات فروش" value={money(business.receivable)} icon={Clock3} tone="amber"/>
      <StatCard label="مصارف ثبت‌شده" value={money(business.expenses)} icon={TrendingDown} tone="rose"/>
      <StatCard label="معاشات پرداخت‌شده" value={money(business.paidPayroll)} icon={Wallet} tone="cyan"/>
    </div> : <div className="report-summary">
      <div><span>مجموع بدهکار</span><strong>{money(totalDebit)}</strong></div>
      <div><span>مجموع بستانکار</span><strong>{money(totalCredit)}</strong></div>
      <div><span>تعداد اسناد</span><strong>{number(journals.length)}</strong></div>
    </div>}
    <Panel title={title} action={<span className="muted-pill">{number(rows.length)} ریکارد</span>}>
      <DataTable columns={columns} rows={rows} empty="در محدودهٔ انتخاب‌شده معلوماتی موجود نیست."/>
    </Panel>
    <p className="info-note">{page==='reports' ? 'این گزارش جمع‌بندی سادهٔ بل‌ها، مصارف و معاشات پرداخت‌شده است و محاسبهٔ مفاد خالص یا صورت مالی حسابرسی‌شده نیست.' :
      'گزارش‌های حسابداری فعلاً فقط اسناد دستی ثبت‌شده در «اسناد حسابداری» را نمایش می‌دهند؛ بل‌ها هنوز به دفتر کل خودکار متصل نیستند.'}</p>
  </>;
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

function StockMovementForm({data, form, setForm, onSubmit, onCancel}) {
  const stock = inventoryState(data);
  const warehouses = [{id:DEFAULT_WAREHOUSE,name:'گدام عمومی'}, ...data.warehouses];
  const update = (key, value) => setForm(p => ({...p,[key]:value}));
  const whSelect = (key,label) => <label>{label}<select value={form[key] || ''} onChange={e=>update(key,e.target.value)} required>
    {key==='toWarehouseId' && <option value="">گدام مقصد را انتخاب کنید</option>}
    {warehouses.map(w=><option key={w.id} value={w.id}>{w.name}</option>)}
  </select></label>;
  const origin = form.kind === 'transfer' ? form.fromWarehouseId : form.warehouseId;
  return <form onSubmit={onSubmit}>
    <div className="modal-grid">
      <label>نوع حرکت<select value={form.kind} onChange={e=>update('kind',e.target.value)}>
        <option value="in">ورودی دستی (افزایش)</option><option value="out">خروجی دستی (کاهش)</option>
        <option value="transfer">انتقال میان گدام‌ها</option></select></label>
      <label>محصول<select value={form.productId} required onChange={e=>update('productId',e.target.value)}>
        <option value="">محصول را انتخاب کنید</option>{data.products.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
      {form.kind==='transfer' ? <>{whSelect('fromWarehouseId','از گدام')}{whSelect('toWarehouseId','به گدام')}</> : whSelect('warehouseId','گدام')}
      <label>تعداد<input type="number" min="0.01" step="any" required value={form.quantity} onChange={e=>update('quantity',e.target.value)}/></label>
      <label>تاریخ (هجری شمسی افغانستان)<AfghanDatePicker value={form.date} onChange={date=>update('date',date)} required/></label>
      <label className="wide">دلیل / توضیحات<textarea rows={2} value={form.notes} onChange={e=>update('notes',e.target.value)} placeholder="مثلاً: شمارش موجودی یا انتقال میان گدام‌ها"/></label>
    </div>
    {form.productId && <p className="info-note">موجودی فعلی در گدام مبدأ: <strong>{number(stock.get(form.productId,origin))}</strong></p>}
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onCancel}>لغو</button><button className="btn primary" type="submit"><Save size={16}/> ثبت حرکت</button></div>
  </form>;
}

function PayrollForm({data,form,setForm,onSubmit,onCancel}) {
  const update=(key,value)=>setForm(p=>({...p,[key]:value}));
  const total=payrollAmounts(form);
  return <form onSubmit={onSubmit}>
    <div className="modal-grid">
      <label>کارمند<select value={form.employeeId || ''} required onChange={e=>{
        const employee=data.employees.find(x=>String(x.id)===String(e.target.value));
        setForm(p=>({...p,employeeId:e.target.value,base:String(employee?.salary||0)}));
      }}><option value="">کارمند را انتخاب کنید</option>{data.employees.map(e=><option key={e.id} value={e.id}>{e.firstName} {e.lastName} — {e.employeeCode||'بدون کد'}</option>)}</select></label>
      <label>ماه<select value={form.month} onChange={e=>update('month',e.target.value)}>{afghanMonths.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></label>
      <label>سال هجری شمسی<input type="number" min="1300" max="1600" value={form.year} onChange={e=>update('year',e.target.value)} required/></label>
      <label>معاش اصلی (افغانی)<input type="number" min="0" step="any" value={form.base||''} onChange={e=>update('base',e.target.value)} required/></label>
      <label>اضافه‌کاری و امتیازات<input type="number" min="0" step="any" value={form.bonus ?? 0} onChange={e=>update('bonus',e.target.value)}/></label>
      <label>کسورات<input type="number" min="0" step="any" value={form.deduction ?? 0} onChange={e=>update('deduction',e.target.value)}/></label>
      <label>تاریخ صدور (هجری شمسی)<AfghanDatePicker value={form.date} onChange={date=>update('date',date)} required/></label>
      <label className="wide">یادداشت<textarea value={form.notes||''} onChange={e=>update('notes',e.target.value)} rows={2}/></label>
    </div>
    <div className="payment-summary-grid"><div className="payment-summary-item"><span>ناخالص</span><strong>{money(total.gross)}</strong></div>
      <div className="payment-summary-item"><span>خالص قابل پرداخت</span><strong>{money(total.net)}</strong></div></div>
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onCancel}>لغو</button><button type="submit" className="btn primary"><Save size={16}/> ثبت برگه معاش</button></div>
  </form>;
}

function AfghanDatePicker({value='', onChange, required=false}) {
  const selected = dateChoiceParts(value);
  const now = afghanCalendarParts();
  const update = (part, choice) => {
    if (choice === '') { onChange(''); return; }
    const next = {
      year: selected?.year || now.year,
      month: selected?.month || now.month,
      day: selected?.day || now.day,
      [part]: Number(choice)
    };
    onChange(buildAfghanDate(next));
  };
  const days = selected?.month > 6 ? 30 : 31;
  return <div className="afghan-date-picker" role="group" aria-label="تاریخ هجری شمسی افغانستان">
    <select aria-label="روز" value={selected?.day || ''} onChange={e=>update('day',e.target.value)} required={required}>
      <option value="">روز</option>{Array.from({length:days},(_,i)=><option key={i+1} value={i+1}>{number(i+1)}</option>)}
    </select>
    <select aria-label="ماه افغانی" value={selected?.month || ''} onChange={e=>update('month',e.target.value)} required={required}>
      <option value="">ماه</option>{AFGHAN_MONTHS.map((name,i)=><option key={name} value={i+1}>{name}</option>)}
    </select>
    <select aria-label="سال هجری شمسی" value={selected?.year || ''} onChange={e=>update('year',e.target.value)} required={required}>
      <option value="">سال</option>{Array.from({length:105},(_,i)=>now.year + 5-i).map(y=><option value={y} key={y}>{number(y)}</option>)}
    </select>
  </div>;
}

function choicesForField(config,key) {
  if (key === 'type') {
    if (config.title === 'مشتریان') return AFGHAN_FIELD_CHOICES.customerType;
    if (config.title === 'سرفصل‌های حساب') return AFGHAN_FIELD_CHOICES.accountType;
    return null;
  }
  return AFGHAN_FIELD_CHOICES[key] || null;
}

function EntityForm({ config, form, setForm, data, onSubmit, onCancel }) {
  return (
    <form onSubmit={onSubmit}>
      <div className="modal-grid">
        {config.fields.map(([key, label]) => (
          <label key={key}>
            {label}
            {key === "warehouseId" ? <select value={form.warehouseId || DEFAULT_WAREHOUSE} onChange={e => setForm({ ...form, warehouseId: e.target.value })}>
              <option value={DEFAULT_WAREHOUSE}>گدام عمومی</option>
              {data.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select> : key === "province" ? <select value={form.province || ''} onChange={e=>setForm({...form,province:e.target.value})}>
              <option value="">ولایت را انتخاب کنید</option>
              {AFGHAN_PROVINCES.map(name=><option key={name} value={name}>{name}</option>)}
            </select> : choicesForField(config,key) ? <select value={form[key] || ''} onChange={e=>setForm({...form,[key]:e.target.value})}>
              <option value="">انتخاب کنید</option>
              {choicesForField(config,key).map(name=><option key={name} value={name}>{name}</option>)}
            </select> : ['birthDate','startDate','endDate'].includes(key) ? <AfghanDatePicker value={form[key] || ''} onChange={date=>setForm({...form,[key]:date})}/> : ["notes", "address"].includes(key) ? (
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
                    "salary",
                    "opening",
                  ].includes(key)
                    ? "number"
                    : "text"
                }
                inputMode={['phone','mobile'].includes(key) ? 'tel' : undefined}
                placeholder={['phone','mobile'].includes(key) ? '07xxxxxxxx یا +93 7xxxxxxxx' : key === 'tazkira' ? 'نمبر تذکره' : key === 'unit' ? 'مثلاً: بوری، کارتن، کیلوگرام' : key === 'economicNumber' ? 'اختیاری' : undefined}
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
          گدام
          <select value={form.warehouseId || DEFAULT_WAREHOUSE} onChange={e => setForm({ ...form, warehouseId: e.target.value })}>
            <option value={DEFAULT_WAREHOUSE}>گدام عمومی</option>
            {data.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
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
          <AfghanDatePicker value={form.date} onChange={date=>setForm({...form,date})} required/>
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
          تاریخ (هجری شمسی افغانستان)
          <AfghanDatePicker value={form.date} onChange={date=>setForm({...form,date})} required/>
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
