import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useLocation, useNavigate } from "react-router";
import { PAGE_PATHS, pathForPage, pageForPath } from "./pageRoutes.js";
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
  ShieldCheck,
  LockKeyhole,
  UserPlus,
  KeyRound,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  CalendarClock,
  Palette,
  Sun,
  Moon,
} from "lucide-react";
import { AFGHAN_MONTHS, DEFAULT_WAREHOUSE, afghanCalendarParts, afghanDateOrder, isInAfghanRange, cash, inventoryState, findProduct, saleStockError, payrollAmounts, journalBalances, reportSummary } from "./business.js";
import "./styles.css";
import "./responsive.css";
import "./theme.css";
import "./reportUpgrade.css";
import { AFGHAN_PROVINCES, AFGHAN_FIELD_CHOICES, dateChoiceParts, buildAfghanDate } from "./afghanLocale.js";
import { customerDebtAging, monthlySalesPurchases, lowStockProducts, financialYearOptions, financialYearRecordCount, afghanDateDayNumber } from "./dashboardMetrics.js";
import { PERMISSION_GROUPS, PAGE_PERMISSION, ENTITY_MANAGE_PERMISSION, INVOICE_PERMISSIONS, initialAccess, normalizeAccess, canDo, canOpenPage, availablePages, saveRoleRecord, removeRoleRecord, saveUserRecord, removeUserRecord, setAccountPassword, setRecoveryRecord } from "./accessControl.js";
import { makeDemoCredential, verifyDemoCredential, normalizeUsername, validUsername, proposeUsername, makeTemporaryPassword } from "./demoAuth.js";
import { createRecoveryCode, createRecoveryRecord, verifyRecoveryCode } from "./demoRecovery.js";
import { quickSearch, transactionsForDay } from "./headerTools.js";
import { employeeAccess, effectiveDemoAccess, kabulLocalDateTime, normalizeScheduleFields, validAfghanDateTime, validShiftTime } from "./workHours.js";
import { CURRENCIES, CURRENCY_LABELS, DEFAULT_RATES, normalizeRates, currencyRate, toAfn, fromAfn, roundMoney, convertInvoiceToAfn, rateFieldFor } from "./exchange.js";
import { FRESH_STORAGE_KEYS, validateFirstSetup, clearFreshStorage } from "./freshSetup.js";
import { readBusinessLogo, safeBusinessLogo } from "./businessLogo.js";
import { totalExtras, validateExtras, newExtraExpense } from "./invoiceExtras.js";
import { describeSettingsChanges, DESTRUCTIVE_SETTINGS_ACTIONS } from "./settingsSecurity.js";
import { cashRegister, canAffordCash, buildManualCashEntry } from "./cashRegister.js";
import { ATTENDANCE_OPTIONS, attendanceKey, attendanceDays, attendanceTotals, recordAttendance, resolvedAttendance, attendanceOverview } from "./attendanceLogic.js";
import { THEME_PRESETS, themeColors, normalizeAppearance, addCustomColor, validHex } from "./themePalette.js";
import { saveIdentityScan, loadIdentityScan, removeIdentityScan, clearIdentityScans } from "./idDocuments.js";
import { createShipment, shipmentCost, createSettlement, applySettlement, buildAccountingJournal } from "./tradeAccounting.js";
import { ShipmentsPage, TraderAccountsPage, ProfitAnalysisPage } from "./TradeWorkflows.jsx";
import {afghanFromGregorian,gregorianFromAfghan,formatCalendarDate,normalizedCalendarMode,groupedNumber,ungroupedNumber} from "./calendarDisplay.js";
import {everydayReportSummary, accountingReportSummary} from "./reportSimple.js";
import {CalendarModeContext} from "./calendarMode.js";
import GroupedNumberInput from "./GroupedNumberInput.jsx";
import {contractDraft,selectContractPreset,validateContract,paymentContractError,requiredDownPaymentSource,contractSnapshot,dueDate} from './customerContracts.js';
import {invoicePrintHtml,contractPrintHtml,printHtml} from './printDocuments.js';
import {normalizeDocumentDesign,resolveDocumentDesign} from './documentDesigns.js';
import {updateInvoiceLine,refreshCatalogPrices} from './catalogPricing.js';
import {afghanKabulToday} from './attendanceLogic.js';
import './contractAttendance.css';




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
      { id: "cashRegister", label: "صندوق نقدی" },
      { id: "traderAccounts", label: "حسابات طرف‌های معامله" },
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
      { id: "profitAnalysis", label: "تحلیل مفاد و قیمت تمام‌شده" },
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
      { id: "shipments", label: "مدیریت کانتنرها" },
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
    items: [{ id: "settings", label: "تنظیمات" }, { id: "roles", label: "نقش‌ها و صلاحیت‌ها" }],
  },
];
const allNavItems = [...navGroups.flatMap((g) => g.items), {id:"help",label:"راهنمای سامانه"},{id:"profile",label:"پروفایل کاربر"}];
const navigationIcons = {
  dashboard: LayoutDashboard,
  sales: Receipt,
  purchases: ShoppingCart,
  returns: Undo2,
  journal: BookOpen,
  accounts: FolderTree,
  expenses: Wallet,
  cashRegister: CircleDollarSign,
  traderAccounts: ArrowLeftRight,
  shipments: Warehouse,
  profitAnalysis: TrendingUp,
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
  roles: ShieldCheck,
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
      ["cost", "بهای تمام‌شده (AFN)"],
      ["price", "قیمت فروش (AFN)"],
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
      ["tazkira", "نمبر تذکره / هویت ملی"],
      ["tazkiraIssuePlace", "محل صدور تذکره (اختیاری)"],
      ["identityScan", "عکس یا سکن تذکره"],
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
      ["tazkira", "نمبر تذکره"],
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
      ["identityScan", "سکن تذکره کارمند"],
      ["passport", "نمبر پاسپورت (اختیاری)"],
      ["gender", "جنسیت"],
      ["marital", "حالت مدنی"],
      ["nationality", "تابعیت"],
      ["birthDate", "تاریخ تولد"],
      ["phone", "نمبر تیلفون"],
      ["province", "ولایت"],
      ["district", "ولسوالی / ناحیه"],
      ["address", "آدرس"],
      ["unit", "واحد سازمانی"],
      ["position", "جایگاه وظیفوی"],
      ["workshop", "شعبه / محل کار"],
      ["shift", "شیفت کاری"],
      ["contract", "نوع قرارداد"],
      ["startDate", "تاریخ آغاز قرارداد"],
      ["endDate", "تاریخ ختم قرارداد"],
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
  cashEntries: [],
  shipments: [],
  settlements: [],
};
function loadInitial() {
  try {
    const saved = JSON.parse(
      localStorage.getItem(FRESH_STORAGE_KEYS.data) || "{}",
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

const defaultPreferences = () => ({
  shopName: "عمده فروشی",
  shopLogo: "",
  fiscalYear: afghanCalendarParts().year,
  userName: "حسابدار",
  userTitle: "مدیر سیستم",
  rates: {...DEFAULT_RATES},
  openingCash: 0,
  calendarMode: "shamsi",
});
function loadPreferences() {
  const defaults = defaultPreferences();
  try {
    const stored = JSON.parse(localStorage.getItem(FRESH_STORAGE_KEYS.preferences) || "{}");
    return {
      ...defaults,
      shopName: String(stored.shopName || defaults.shopName),
      shopLogo: safeBusinessLogo(stored.shopLogo),
      ...(stored.billDesign?{billDesign:normalizeDocumentDesign(stored.billDesign)}:{}),
      ...(stored.contractDesign?{contractDesign:normalizeDocumentDesign(stored.contractDesign)}:{}),
      fiscalYear: Number(stored.fiscalYear) >= 1300 && Number(stored.fiscalYear) <= 1600 ? Number(stored.fiscalYear) : defaults.fiscalYear,
      userName: String(stored.userName || defaults.userName),
      userTitle: String(stored.userTitle || defaults.userTitle),
      rates: normalizeRates(stored.rates),
      openingCash: Number.isFinite(Number(stored.openingCash)) && Number(stored.openingCash)>=0 ? Number(stored.openingCash) : 0,
      calendarMode: normalizedCalendarMode(stored.calendarMode),
    };
  } catch { return defaults; }
}
const UI_THEME_KEY='afghan_wholesale_appearance_v2';
function loadAppearance(){
  try {return normalizeAppearance(JSON.parse(localStorage.getItem(UI_THEME_KEY)||localStorage.getItem('afghan_wholesale_appearance_v1')||'{}'));}
  catch {return normalizeAppearance();}
}
function awaitNothingForDocuments(){
  // Delete sensitive browser files before reloading the business. Keep the reset usable
  // if IndexedDB was disabled or unavailable in this browser.
  return clearIdentityScans().catch(()=>{});
}
function App() {
  const [appearance,setAppearance]=useState(loadAppearance);
  useEffect(()=>{
    const colors=themeColors(appearance.accent,appearance.mode);
    const root=document.documentElement;
    root.dataset.theme=appearance.mode;
    root.dataset.accent='custom';
    root.style.setProperty('--custom-accent',colors.accent);
    root.style.setProperty('--custom-accent-text',colors.text);
    root.style.setProperty('--custom-accent-soft',colors.soft);
    root.style.setProperty('--accent-button-text','#ffffff');
    root.style.setProperty('--accent-button-bg',colors.buttonBg);
    root.style.setProperty('--accent-button-hover',colors.buttonHover);
    localStorage.setItem(UI_THEME_KEY,JSON.stringify(appearance));
  },[appearance]);
  const location = useLocation();
  const navigate = useNavigate();
  // The URL is the one source of truth for the selected page, including browser Back/Forward.
  const page = pageForPath(location.pathname) || 'dashboard';
  // Keep the old helpers used by dialogs and dashboard shortcuts, but route through React Router.
  const setPage = (id, options={}) => navigate(pathForPage(id), options);
  const [preferences, setPreferences] = useState(loadPreferences);
  const [sidebarPopup, setSidebarPopup] = useState("");
  const [showNotices, setShowNotices] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState("");
  const [expandedGroups, setExpandedGroups] = useState(() => {
    const startingPage = pageForPath(window.location.pathname) || 'dashboard';
    const group = navGroups.find(g => g.items.some(item => item.id === startingPage));
    return new Set([group?.label || 'صفحه اصلی']);
  });
  useEffect(() => {
    const group = navGroups.find(g => g.items.some(item => item.id === page));
    if (!group) return;
    // A newly selected route highlights only its link, and opens its matching group.
    setExpandedGroups(previous => previous.size === 1 && previous.has(group.label)
      ? previous : new Set([group.label]));
  }, [page]);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [data, setData] = useState(loadInitial);
  const [access, setAccess] = useState(() => {
    const prefs=loadPreferences();
    try { return normalizeAccess(JSON.parse(localStorage.getItem(FRESH_STORAGE_KEYS.access) || "null"),prefs.userName,prefs.userTitle); }
    catch { return initialAccess(prefs.userName,prefs.userTitle); }
  });
  // Demo-only browser session; real authentication MUST be implemented on the server.
  const [kabulTick,setKabulTick] = useState(() => Date.now());
  const [setupResult,setSetupResult] = useState(null);
  const [sessionUserId,setSessionUserId] = useState(()=>{
    try { return sessionStorage.getItem(FRESH_STORAGE_KEYS.session) || null; } catch { return null; }
  });
  const [previewUserId, setPreviewUserId] = useState(null);
  const [settingsChallenge, setSettingsChallenge] = useState(null);
  const demoLoginEnabled=!!access.users.find(u=>u.id==='admin-user')?.passwordHash;
  const signedInUser=demoLoginEnabled ? access.users.find(u=>u.id===sessionUserId && u.active!==false && u.passwordHash) : access.users[0];
  const needsLogin=demoLoginEnabled && !signedInUser;
  const previewEmployee = previewUserId && signedInUser?.id==='admin-user'
    ? (access.users.find(u=>u.id===previewUserId && !u.system) || null) : null;
  const checkedAccess=effectiveDemoAccess(signedInUser,previewEmployee,new Date(kabulTick));
  const workingAccess=checkedAccess.signedIn;
  const shiftRestricted=demoLoginEnabled && !!signedInUser && !workingAccess.allowed;
  const previewShiftRestricted=demoLoginEnabled && !!previewEmployee && !checkedAccess.preview?.allowed;
  // Recheck Afghanistan time every five seconds, and immediately on tab focus/resume.
  // Use the clock value for the access computation (rather than an unrelated rerender).
  useEffect(()=>{
    const refresh=()=>setKabulTick(Date.now());
    const handle=setInterval(refresh,5000);
    window.addEventListener('focus',refresh);
    document.addEventListener('visibilitychange',refresh);
    return ()=>{clearInterval(handle);window.removeEventListener('focus',refresh);document.removeEventListener('visibilitychange',refresh);};
  },[]);
  // Synchronize saved shift/role changes across other tabs in this same browser.
  // Different devices still need a real backend for shared access enforcement.
  useEffect(()=>{
    const syncAccess=event=>{
      if(event.key!==FRESH_STORAGE_KEYS.access) return;
      try {setAccess(normalizeAccess(JSON.parse(event.newValue||'null'),loadPreferences().userName,loadPreferences().userTitle));}
      catch { /* Ignore a malformed value from another tab. */ }
      setKabulTick(Date.now());
    };
    window.addEventListener('storage',syncAccess);
    return ()=>window.removeEventListener('storage',syncAccess);
  },[]);
  const activeUserId = previewEmployee?.id || (signedInUser?.id || 'admin-user');
  const activeUser = access.users.find(u=>u.id===activeUserId) || access.users[0];
  const activeRole = access.roles.find(r=>r.id===activeUser.roleId);
  const can = (permission) => !shiftRestricted && !previewShiftRestricted && !!signedInUser && canDo(access,activeUserId,permission);
  const canView = (pageId) => !shiftRestricted && !previewShiftRestricted && !!signedInUser && canOpenPage(access,activeUserId,pageId);
  const requirePermission = (permission) => {
    if(can(permission)) return true;
    notify("شما برای این عملیات صلاحیت ندارید.");
    return false;
  };
  const [modal, setModal] = useState(null);
  // Keep the unfinished bill when its customer/supplier is registered on the full entity form.
  const [invoicePartyReturn, setInvoicePartyReturn] = useState(null);
  const [form, setForm] = useState({});
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const foundItems = useMemo(() => quickSearch(data,search,access,activeUserId),[data,search,access,activeUserId]);
  const goToSearchResult = item => {
    setCurrentPage(item.page,item.match);
    setSearchOpen(false);
  };
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
    usdRate: "",
    pkrRate: "",
    extraExpenses: [],
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
    localStorage.setItem(FRESH_STORAGE_KEYS.data, JSON.stringify(data));
  }, [data]);
  useEffect(() => {
    localStorage.setItem(FRESH_STORAGE_KEYS.preferences, JSON.stringify(preferences));
  }, [preferences]);
  useEffect(() => {
    localStorage.setItem(FRESH_STORAGE_KEYS.access, JSON.stringify(access));
  }, [access]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  const currentTitle =
    allNavItems.find((x) => x.id === page)?.label || "داشبورد";
  const setCurrentPage = (id, searchTerm="") => {
    if (!canView(id)) { notify("شما به این بخش دسترسی ندارید."); setMobileMenu(false); return; }
    setPage(id);
    setSearch(searchTerm);
    setAccountOpen(false);
    setCalendarOpen(false);
    setSearchOpen(false);
    setOpenMenu("");
    setSidebarPopup("");
    setShowNotices(false);
    setMobileMenu(false);
  };
  const notify = (message) => setToast(message);
  // Every settings mutation needs a fresh password challenge. Unsaved form edits
  // remain local to the form until the administrator explicitly approves them.
  const requestSettingsConfirmation = (action) => {
    if (!requirePermission('settings.manage')) return false;
    if (!signedInUser?.passwordHash || previewUserId) {
      notify('برای تغییر تنظیمات با حساب خود وارد شوید.');
      return false;
    }
    setSettingsChallenge(action);
    return true;
  };
  const verifyAndApplySettings = async (password) => {
    const action=settingsChallenge;
    const currentAccount=access.users.find(user=>user.id===signedInUser?.id && user.active!==false);
    if (!action || !currentAccount || !can('settings.manage') || previewUserId) {
      return {ok:false,message:'اجازهٔ تغییر تنظیمات موجود نیست. دوباره وارد شوید.'};
    }
    try {
      if (!(await verifyDemoCredential(password,currentAccount))) {
        return {ok:false,message:'رمز ورود اشتباه است. تغییرات اجرا نشد.'};
      }
      // Recheck that the signed-in user has not changed during verification.
      if (sessionUserId!==currentAccount.id || !can('settings.manage')) {
        return {ok:false,message:'نشست کاربری تغییر کرده است. دوباره وارد شوید.'};
      }
      // Close first, then apply the authorized operation (which may reload).
      setSettingsChallenge(null);
      action.onConfirmed();
      return {ok:true};
    } catch(error) {
      return {ok:false,message:error?.message||'انجام عملیات ممکن نشد.'};
    }
  };
  const changeFiscalYear = (year) => {
    const target=Number(year);
    if(target === preferences.fiscalYear) return;
    if (!requirePermission('settings.manage')) return;
    if (financialYearRecordCount(data,target)===0) {
      notify(`برای سال مالی ${number(target)} معلوماتی موجود نیست. سال قبلی تغییر نکرد.`);
      return;
    }
    requestSettingsConfirmation({
      title:'تأیید تغییر سال مالی',
      details:[`سال مالی از ${number(preferences.fiscalYear)} به ${number(target)} تغییر می‌کند.`, 'این تغییر بر نمایش گزارش‌های سالانه و داشبورد اثر دارد.'],
      onConfirmed:()=>{
        setPreferences(previous=>({...previous,fiscalYear:target}));
        setSidebarPopup('');
        if(canView('dashboard')) setCurrentPage('dashboard');
        notify(`سال مالی ${number(target)} انتخاب شد.`);
      },
    });
  };
  const savePreferences = (changes) => {
    if (!requirePermission('settings.manage')) return false;
    if (changes.fiscalYear != null && Number(changes.fiscalYear) !== preferences.fiscalYear &&
        financialYearRecordCount(data,Number(changes.fiscalYear))===0) {
      notify(`برای سال مالی ${number(changes.fiscalYear)} معلوماتی موجود نیست. سال قبلی تغییر نکرد.`);
      return false;
    }
    if(changes.openingCash!==undefined && Number(changes.openingCash)!==Number(preferences.openingCash) && cashRegister(data,changes.openingCash).balance<0){
      notify('موجودی آغازین انتخاب‌شده باعث موجودی منفی صندوق می‌شود.');return false;
    }
    const details=describeSettingsChanges(preferences,changes);
    if(!details.length) {notify('هیچ تغییری برای ذخیره وجود ندارد.');return true;}
    return requestSettingsConfirmation({
      title:'تأیید ذخیره تنظیمات',
      details,
      onConfirmed:()=>{
        setPreferences(previous=>({...previous,...changes}));
        notify('تنظیمات بعد از تأیید رمز ذخیره شد.');
      },
    });
  };
  const clearTransactionsProtected = () => requestSettingsConfirmation({
    ...DESTRUCTIVE_SETTINGS_ACTIONS.clearTransactions,
    destructive:true,
    onConfirmed:()=>{
      awaitNothingForDocuments().finally(()=>{
        localStorage.removeItem(FRESH_STORAGE_KEYS.data);
        window.location.reload();
      });
    },
  });
  const resetBusinessProtected = () => requestSettingsConfirmation({
    ...DESTRUCTIVE_SETTINGS_ACTIONS.resetBusiness,
    destructive:true,
    onConfirmed:()=>{
      awaitNothingForDocuments().finally(()=>{
        clearFreshStorage(localStorage,sessionStorage);
        localStorage.removeItem(UI_THEME_KEY);
        window.location.reload();
      });
    },
  });
  const saveAppearance = (draft) => {
    if(!requirePermission('settings.manage')) return false;
    const updated=normalizeAppearance({...draft,mode:appearance.mode});
    if(JSON.stringify(updated)===JSON.stringify(appearance)){notify('رنگ یا حالت نمایش تغییر نکرده است.');return true;}
    return requestSettingsConfirmation({
      title:'تأیید تغییر رنگ برنامه',
      details:[`رنگ انتخاب‌شده: ${updated.accent}`],
      onConfirmed:()=>{setAppearance(prev=>({...updated,mode:prev.mode}));notify('رنگ برنامه ذخیره شد.');}
    });
  };
  const saveProfile = (changes) => {
    if(!requirePermission('profile.edit')) return false;
    setAccess(prev=>({...prev, users:prev.users.map(u=>u.id===activeUserId?{...u,name:String(changes.userName||u.name),title:String(changes.userTitle||u.title)}:u)}));
    if(activeUserId==='admin-user') setPreferences(prev=>({...prev,userName:changes.userName||prev.userName,userTitle:changes.userTitle||prev.userTitle}));
    notify("پروفایل ذخیره شد.");
    return true;
  };
  const saveRole = record => {
    if(!can('roles.manage')) return notify('شما صلاحیت مدیریت نقش‌ها را ندارید.');
    try { const next=saveRoleRecord(access,record); setAccess(next); notify('نقش ذخیره شد.'); return true; }
    catch(error){notify(error.message);return false;}
  };
  const deleteRole = id => {
    if(!requirePermission('roles.manage')) return false;
    try { const next=removeRoleRecord(access,id); setAccess(next); notify('نقش حذف شد.'); return true; }
    catch(error){notify(error.message);return false;}
  };
  const saveUser = async (record,rawPassword='') => {
    if(!requirePermission('roles.manage')) return false;
    try {
      if(record.employeeId && !data.employees.some(e=>String(e.id)===String(record.employeeId)))
        throw Error('کارمند انتخاب‌شده در فهرست کارمندان پیدا نشد.');
      const employee = data.employees.find(e=>String(e.id)===String(record.employeeId));
      const normalized = {...record,name:employee ? [employee.firstName,employee.lastName].filter(Boolean).join(' ').trim():record.name,
        title:employee?.position||record.title};
      if(!normalized.employeeId) throw Error('ابتدا یک کارمند از فهرست انتخاب کنید.');
      if(!validUsername(normalized.username)) throw Error('نام کاربری حداقل ۳ حرف انگلیسی دارد؛ فقط حروف، عدد و . _ - مجاز است.');
      if(!normalized.id && !rawPassword) throw Error('برای کاربر جدید رمز موقت تعیین کنید.');
      if(rawPassword) Object.assign(normalized,await makeDemoCredential(rawPassword),{mustChangePassword:true});
      const next=saveUserRecord(access,normalized);
      setAccess(next); notify('حساب کارمند و نقش او ذخیره شد.'); return true;
    } catch(error) {notify(error.message);return false;}
  };
  const activateDemoLogin=async (username,rawPassword,initialProfile=null) => {
    if(!requirePermission('roles.manage')) return false;
    try {
      const credential=await makeDemoCredential(rawPassword);
      let next=setAccountPassword(access,'admin-user',credential,{username,mustChangePassword:false});
      // Initial setup can personalize the business and administrator. Later password changes
      // from the Roles screen leave those details unchanged.
      if (initialProfile && !demoLoginEnabled) {
        const adminName=String(initialProfile.adminName||'').trim().slice(0,80);
        const shopName=String(initialProfile.shopName||'').trim().slice(0,90);
        if(!adminName || !shopName) throw Error('نام فروشگاه و نام مدیر ضروری است.');
        next={...next,users:next.users.map(u=>u.id==='admin-user'?{...u,name:adminName,title:'مدیر سیستم'}:u)};
        const openingCash=Number(initialProfile.openingCash||0);
        if(!Number.isFinite(openingCash) || openingCash<0) throw Error('موجودی آغازین صندوق باید صفر یا بیشتر باشد.');
        setPreferences(prev=>({...prev,shopName,shopLogo:safeBusinessLogo(initialProfile.shopLogo),openingCash,userName:adminName,userTitle:'مدیر سیستم'}));
        setAppearance(normalizeAppearance(initialProfile.appearance));
      }
      const recoveryCode=createRecoveryCode();
      const record=await createRecoveryRecord(recoveryCode,{days:365});
      setAccess(setRecoveryRecord(next,'admin-user',record));
      // Always require explicit sign-in after the first administrator is created.
      if(!demoLoginEnabled) {
        sessionStorage.removeItem(FRESH_STORAGE_KEYS.session);
        setSessionUserId(null);
        setSetupResult({username,recoveryCode});
      }
      notify('حساب مدیر ساخته شد. کد بازیابی را در جای امن نگه دارید.');
      return {ok:true,recoveryCode};
    } catch(error) {notify(error.message);return {ok:false,message:error.message};}
  };
  const issueRecovery=async userId => {
    if(!requirePermission('roles.manage')) return null;
    try {
      const user=access.users.find(u=>u.id===userId);
      if(!user) throw Error('کاربر یافت نشد.');
      const code=createRecoveryCode();
      const record=await createRecoveryRecord(code,{days:user.system?365:1});
      setAccess(previous=>setRecoveryRecord(previous,userId,record));
      notify('کد بازیابی ساخته شد. فقط به صاحب حساب بدهید.');
      return {username:user.username,code,expires:record.recoveryExpires};
    } catch(error) {notify(error.message);return null;}
  };
  const resetDemoPassword=async (username,recoveryCode,newPassword) => {
    try {
      const user=access.users.find(u=>u.active!==false && normalizeUsername(u.username)===normalizeUsername(username));
      if(!user || !(await verifyRecoveryCode(recoveryCode,user))) return {ok:false};
      const credential=await makeDemoCredential(newPassword);
      let next=setAccountPassword(access,user.id,credential,{mustChangePassword:false});
      let newAdminCode=null;
      if(user.system) {
        newAdminCode=createRecoveryCode();
        const record=await createRecoveryRecord(newAdminCode,{days:365});
        next=setRecoveryRecord(next,user.id,record);
      }
      setAccess(next);
      notify('رمز تغییر کرد. اکنون با رمز تازه وارد شوید.');
      return {ok:true,newAdminCode};
    } catch(error) {return {ok:false};}
  };
  const login=async (username,password) => {
    const u=access.users.find(u=>u.active!==false&&normalizeUsername(u.username)===normalizeUsername(username));
    if(!u || !await verifyDemoCredential(password,u)) return {ok:false,message:'نام کاربری یا رمز اشتباه است، یا حساب غیرفعال شده است.'};
    const status=employeeAccess(u);
    if(!status.allowed) return {ok:false,message:`${status.reason} وقت فعلی افغانستان: ${kabulLocalDateTime(new Date()).replace('T',' ')}`};
    sessionStorage.setItem(FRESH_STORAGE_KEYS.session,u.id);
    setSessionUserId(u.id);setPreviewUserId(null);setPage('dashboard');setMobileMenu(false);
    return {ok:true};
  };
  const logout=()=>{
    if(!demoLoginEnabled) {notify('ابتدا حساب مدیر را بسازید.');return;}
    sessionStorage.removeItem(FRESH_STORAGE_KEYS.session);
    setSessionUserId(null);setPreviewUserId(null);setPage('dashboard');setModal(null);setMobileMenu(false);
  };
  const changeOwnDemoPassword=async password=>{
    try {
      const credential=await makeDemoCredential(password);
      setAccess(previous=>setAccountPassword(previous,activeUserId,credential,{mustChangePassword:false}));
      notify('رمز نمایشی تغییر کرد.');return true;
    } catch(error) {notify(error.message);return false;}
  };
  const deleteUser = id => {
    if(!requirePermission('roles.manage')) return false;
    try { const next=removeUserRecord(access,id); setAccess(next); notify('کاربر حذف شد.'); return true; }
    catch(error){notify(error.message);return false;}
  };
  const previewAs = userId => {
    if(!requirePermission('roles.manage')) return;
    if(!access.users.some(u=>u.id===userId && !u.system)) return;
    setPreviewUserId(userId);
    const first=availablePages(access,userId).find(page=>page!=='profile' && page!=='help') || 'profile';
    setPage(first);
    setModal(null); setMobileMenu(false); setSidebarPopup('');
    notify('حالت پیش‌نمایش نقش فعال شد؛ این ورود واقعی نیست.');
  };
  const leavePreview = () => {
    setPreviewUserId(null); setPage('roles'); setModal(null); setMobileMenu(false);
    notify('به حالت مدیر سیستم برگشتید.');
  };
  const years = financialYearOptions(data, preferences.fiscalYear);
  const fiscalReport = useMemo(() => reportSummary(
    data, `${preferences.fiscalYear}/01/01`, `${preferences.fiscalYear}/12/30`
  ), [data, preferences.fiscalYear]);

  function openEntityForm(key, row = null) {
    if(!requirePermission(ENTITY_MANAGE_PERMISSION[key])) return;
    setEditId(row?.id ?? null);
    setForm(row ? { ...row } : {});
    setModal({ type: "entity", key });
  }
  function createPartyFromInvoice(key) {
    if (!['customers','suppliers'].includes(key)) return;
    if (modal?.type !== 'invoice') return;
    if (!requirePermission(ENTITY_MANAGE_PERMISSION[key])) return;
    // Navigate to the actual customer/supplier section and use its complete create form.
    setInvoicePartyReturn({invoiceType:modal.invoiceType, originPage:page, entityKey:key});
    setPage(key);
    setEditId(null);
    setForm({});
    setModal({type:'entity',key});
  }
  function cancelEntityForm() {
    const persisted=editId?data[modal.key]?.find(x=>x.id===editId):null;
    for(const [draftScan,oldScan] of [[form.identityScan,persisted?.identityScan],[form.saleContract?.guarantorScan,persisted?.saleContract?.guarantorScan]]){if(draftScan?.id&&draftScan.id!==oldScan?.id)removeIdentityScan(draftScan.id).catch(()=>{});}
    if (invoicePartyReturn) {
      setPage(invoicePartyReturn.originPage);
      setModal({type:'invoice',invoiceType:invoicePartyReturn.invoiceType});
      setInvoicePartyReturn(null);
    } else setModal(null);
  }
  function saveEntity(e) {
    e.preventDefault();
    const key = modal.key;
    if(!requirePermission(ENTITY_MANAGE_PERMISSION[key])) return;
    if(key==='employees'&&!String(form.firstName||'').trim()) {notify('نام کارمند ضروری است.');return;}
    if (['products','customers','suppliers'].includes(key) && !String(form.name || '').trim()) {
      notify(key==='customers'?'نام مشتری ضروری است.':key==='suppliers'?'نام عرضه‌کننده ضروری است.':'نام محصول ضروری است.'); return;
    }
    if (['customers','suppliers'].includes(key) && !editId && data[key].some(item=>String(item.name||'').trim().toLowerCase()===String(form.name).trim().toLowerCase())) {
      notify('این نام قبلاً ثبت شده است؛ از فهرست انتخاب کنید.');return;
    }
    if (key === "products" && ["quantity", "cost", "price"].some(k => Number(form[k] || 0) < 0)) {
      notify("تعداد و قیمت محصول نباید منفی باشد."); return;
    }
    if(key==='customers') {const error=validateContract(form.saleContract);if(error){notify(error);return;}}
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
    const previousGuarantorScan=editId&&key==='customers'?data.customers.find(x=>x.id===editId)?.saleContract?.guarantorScan:null;
    const previousDocument=editId && (key==='employees'||key==='customers') ? data[key].find(x=>x.id===editId)?.identityScan : null;
    setData((prev) => ({
      ...prev,
      [key]: editId
        ? prev[key].map((r) => (r.id === editId ? entry : r))
        : [...prev[key], entry],
    }));
    if(previousGuarantorScan?.id&&previousGuarantorScan.id!==entry.saleContract?.guarantorScan?.id)removeIdentityScan(previousGuarantorScan.id).catch(()=>{});
    if(previousDocument?.id && previousDocument.id!==entry.identityScan?.id) removeIdentityScan(previousDocument.id).catch(()=>{});
    if(invoicePartyReturn && !editId && invoicePartyReturn.entityKey === key) {
      setInvoiceForm(prev=>({...prev,party:String(entry.name||'').trim()}));
      setPage(invoicePartyReturn.originPage);
      setModal({type:'invoice',invoiceType:invoicePartyReturn.invoiceType});
      setInvoicePartyReturn(null);
      notify(key==='customers'?'مشتری ثبت شد و بل فروش دوباره باز شد.':'عرضه‌کننده ثبت شد و بل خرید دوباره باز شد.');
    } else {
      setModal(null);
      notify(editId ? "تغییرات ثبت شد." : "معلومات جدید ثبت شد.");
    }
    setForm({});
    setEditId(null);
  }
  function deleteEntity(key, id) {
    if(!requirePermission(ENTITY_MANAGE_PERMISSION[key])) return;
    if(key==='employees' && access.users.some(u=>String(u.employeeId||'')===String(id))) {
      notify('برای این کارمند حساب ورود موجود است. ابتدا حساب او را حذف کنید.');return;
    }
    if (key === "products" && (
      data.invoices.some(inv => (inv.items || []).some(line => String(line.productId) === String(id) || line.product === data.products.find(p => p.id === id)?.name)) ||
      data.stockMovements.some(m => String(m.productId) === String(id))
    )) { notify("این محصول سابقه معامله دارد؛ برای حفظ سابقه حذف نمی‌شود."); return; }
    if (key === "warehouses" && (
      data.products.some(p => String(p.warehouseId) === String(id)) ||
      data.invoices.some(i => String(i.warehouseId) === String(id)) ||
      data.stockMovements.some(m => [m.warehouseId,m.fromWarehouseId,m.toWarehouseId].some(x => String(x)===String(id)))
    )) { notify("این گدام مورد استفاده است و حذف نمی‌شود."); return; }
    const guarantorScan=key==='customers'?data.customers.find(x=>x.id===id)?.saleContract?.guarantorScan:null;
    const attached=key==='employees'||key==='customers' ? data[key].find(x=>x.id===id)?.identityScan : null;
    setData((prev) => ({
      ...prev,
      [key]: prev[key].filter((r) => r.id !== id),
    }));
    if(guarantorScan?.id) removeIdentityScan(guarantorScan.id).catch(()=>{});
    if(attached?.id) removeIdentityScan(attached.id).catch(()=>{});
    notify("مورد حذف شد.");
  }
  function openInvoice(type) {
    if(!requirePermission(INVOICE_PERMISSIONS[type]?.manage)) return;
    setInvoiceForm({ date: today, party: "", title: "", paid: 0, notes: "", warehouseId: DEFAULT_WAREHOUSE, currency:"AFN", usdRate:"", pkrRate:"", aedRate:"", eurRate:"", extraExpenses:[],shipmentId:"",soldTonnes:"" });
    setInvoiceItems([{ product: "", quantity: 1, price: "", discount: 0 }]);
    setModal({ type: "invoice", invoiceType: type });
  }
  function saveInvoice(e) {
    e.preventDefault();
    if(!requirePermission(INVOICE_PERMISSIONS[modal.invoiceType]?.manage)) return;
    if (!invoiceItems.length) { notify("حداقل یک قلم در بل اضافه کنید."); return; }
    if (!invoiceItems.every(i => String(i.product||'').trim() && i.price!=='' && i.price!=null && Number.isFinite(Number(i.price)) && Number.isFinite(Number(i.quantity)) && Number(i.quantity) > 0 && Number(i.price) >= 0 && Number.isFinite(Number(i.discount || 0)) && Number(i.discount || 0) >= 0 && Number(i.discount || 0) <= Number(i.quantity) * Number(i.price))) {
      notify("نام محصول، تعداد و قیمت هر قلم را کامل و درست وارد کنید."); return;
    }
    const extraError=validateExtras(invoiceForm.extraExpenses||[]);
    if(extraError){notify(extraError);return;}
    const invoiceRates={USD:invoiceForm.usdRate,PKR:invoiceForm.pkrRate,AED:invoiceForm.aedRate,EUR:invoiceForm.eurRate};
    let converted;
    try { converted=convertInvoiceToAfn(invoiceItems,invoiceForm.paid||0,invoiceForm.currency||'AFN',invoiceRates,invoiceForm.extraExpenses||[]); }
    catch(error) { notify(error.message); return; }
    const unknown = invoiceItems.find(i => !findProduct(i, data.products));
    if (unknown) {
      notify(`محصول «${unknown.product || "نامشخص"}» ثبت نشده است. ${modal.invoiceType==='purchase'?'از «ثبت محصول جدید» در همین فورم استفاده کنید.':'ابتدا آن را ثبت کنید.'}`);
      return;
    }
    if (modal.invoiceType === "sale") {
      const error = saleStockError(data, invoiceItems, invoiceForm.warehouseId);
      if (error) { notify(error); return; }
    }
    const subtotal = converted.total;
    const initialPaid = converted.paid;
    if (!Number.isFinite(initialPaid) || initialPaid < 0 || initialPaid > subtotal) {
      notify("مبلغ پرداخت‌شده باید بین صفر و مجموع بل باشد.");
      return;
    }
    if ((modal.invoiceType === 'purchase' || modal.invoiceType === 'return') && !canAffordCash(data,preferences.openingCash,initialPaid)) {
      notify('پول صندوق برای پرداخت این بل کافی نیست. نخست پول به صندوق اضافه کنید.'); return;
    }
    if (modal.invoiceType === "sale" && subtotal > initialPaid && !invoiceForm.party) {
      notify("برای فروش قرضه، مشتری را انتخاب کنید.");
      return;
    }
    if (modal.invoiceType === "purchase" && subtotal > initialPaid && !invoiceForm.party) {
      notify("برای خرید قرضه، عرضه‌کننده را انتخاب کنید.");
      return;
    }
    const contractCustomer=modal.invoiceType==='sale'?data.customers.find(c=>c.name===invoiceForm.party):null;
    if(contractCustomer?.saleContract?.enabled && invoiceItems.some(i=>i.weightPerUnit!==undefined&&i.weightPerUnit!==''&&(!Number.isFinite(Number(i.weightPerUnit))||Number(i.weightPerUnit)<=0))){notify('وزن هر بوجی یا واحد باید از صفر بیشتر باشد.');return;}
    const contractError=paymentContractError(subtotal,initialPaid,contractCustomer?.saleContract,invoiceForm.date);
    if(contractError){notify(contractError);return;}
    if(modal.invoiceType==='sale' && invoiceForm.shipmentId){
      const sh=data.shipments.find(x=>String(x.id)===String(invoiceForm.shipmentId));
      const tonnes=Number(invoiceForm.soldTonnes);
      const already=data.invoices.filter(x=>x.type==='sale'&&String(x.shipmentId)===String(invoiceForm.shipmentId)).reduce((s,x)=>s+Number(x.soldTonnes||0),0);
      if(!sh||!Number.isFinite(tonnes)||tonnes<=0||already+tonnes>Number(sh.tonnes)+0.000001){
        notify('مقدار تن فروش‌شده از وزن موجود همان محموله بیشتر است یا معتبر نیست.');return;
      }
    }
    const invoice = {
      id: Date.now(),
      number:
        Math.max(0,...data.invoices.filter(x=>x.type===modal.invoiceType).map(x=>Number(x.number)||0))+1,
      type: modal.invoiceType,
      ...invoiceForm,
      currency:invoiceForm.currency||'AFN',exchangeRate:converted.rate,
      usdRate:Number(invoiceForm.usdRate||0),pkrRate:Number(invoiceForm.pkrRate||0),aedRate:Number(invoiceForm.aedRate||0),eurRate:Number(invoiceForm.eurRate||0),
      extraExpenses:converted.extraExpenses,extraExpensesTotal:converted.extraExpensesTotal,
      lineSubtotal:converted.lineSubtotal,
      foreignTotal:converted.foreignTotal,foreignPaid:converted.foreignPaid,
      items: converted.items.map((x) => ({ ...x, productId: findProduct(x, data.products)?.id, unit: findProduct(x,data.products)?.unit||"" })),
      total: subtotal,
      paid: initialPaid,
      balance: converted.balance,
      payments: [],
      status: initialPaid >= subtotal ? "پرداخت کامل" : "پرداخت ناقص",
    };
    const customerContract=contractSnapshot(contractCustomer,preferences,invoice);
    if(customerContract)invoice.saleContract=customerContract;
    setData((prev) => ({ ...prev, invoices: [invoice, ...prev.invoices] }));
    setModal(null);
    notify("بل ثبت شد.");
  }
  function quickCreatePurchaseProduct(draft) {
    if(!requirePermission('inventory.manage')) return false;
    const name=String(draft.name||'').trim();
    if(!name){notify('نام محصول ضروری است.');return false;}
    if(data.products.some(p=>String(p.name||'').trim().toLowerCase()===name.toLowerCase())){
      notify('این محصول از قبل وجود دارد؛ آن را از فهرست انتخاب کنید.');return false;
    }
    const product={id:Date.now(),name,code:String(draft.code||'').trim(),unit:draft.unit||'بوری',
      quantity:0,warehouseId:invoiceForm.warehouseId||DEFAULT_WAREHOUSE,cost:0,price:0,reorder:0};
    setData(prev=>({...prev,products:[...prev.products,product]}));
    setInvoiceItems(prev=>prev.map(line=>!String(line.product||'').trim()?{...line,product:name}:line));
    notify('محصول تازه ثبت شد؛ اکنون تعداد و قیمت خرید را درج کنید.');
    return true;
  }
  function deleteInvoice(id) {
    const existing = data.invoices.find(x => x.id === id);
    if(existing?.type==='purchase' && (data.shipments||[]).some(sh=>String(sh.purchaseInvoiceId)===String(id))) {notify('نخست محموله مربوط به این بل خرید را بررسی یا حذف کنید.');return;}
    if(!existing || !requirePermission(INVOICE_PERMISSIONS[existing.type]?.manage)) return;
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
    if(!requirePermission(invoice.type==='purchase'?'purchases.manage':'sales.collect')) return;
    if (!['sale','purchase'].includes(invoice.type) || Number(invoice.balance || 0) <= 0) return;
    setPaymentForm({ amount: "", currency:"AFN", usdRate:invoice.usdRate||"", pkrRate:invoice.pkrRate||"",aedRate:invoice.aedRate||"",eurRate:invoice.eurRate||"", date: today, notes: "" });
    setModal({ type: "payment", invoiceId: invoice.id });
  }
  function savePayment(e) {
    e.preventDefault();
    const invoiceType=data.invoices.find(x=>x.id===modal?.invoiceId)?.type;
    if(!requirePermission(invoiceType==='purchase'?'purchases.manage':'sales.collect')) return;
    let amount;
    try {amount=toAfn(paymentForm.amount,paymentForm.currency||'AFN',{USD:paymentForm.usdRate,PKR:paymentForm.pkrRate,AED:paymentForm.aedRate,EUR:paymentForm.eurRate});}
    catch(error) { notify(error.message); return; }
    const invoice = data.invoices.find((x) => x.id === modal.invoiceId && ['sale','purchase'].includes(x.type));
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
    if(invoice.type==='purchase' && !canAffordCash(data,preferences.openingCash,amount)){
      notify('پول کافی در صندوق برای پرداخت قرض عرضه‌کننده موجود نیست.');return;
    }
    const payment = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      amount,
      sourceAmount:Number(paymentForm.amount),currency:paymentForm.currency||'AFN',exchangeRate:currencyRate(paymentForm.currency||'AFN',{USD:paymentForm.usdRate,PKR:paymentForm.pkrRate,AED:paymentForm.aedRate,EUR:paymentForm.eurRate}),
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
    notify(invoice.type==='purchase'?'پرداخت عرضه‌کننده ثبت شد و پول صندوق کم گردید.':'دریافت پول ثبت شد و پول صندوق زیاد گردید.');
  }
  function openStockMovement() {
    if(!requirePermission("inventory.manage")) return;
    setStockMovementForm({ kind: "in", productId: "", warehouseId: DEFAULT_WAREHOUSE, fromWarehouseId: DEFAULT_WAREHOUSE,
      toWarehouseId: "", quantity: "", date: today, notes: "" });
    setModal({ type: "stock" });
  }
  function saveStockMovement(e) {
    e.preventDefault();
    if(!requirePermission("inventory.manage")) return;
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
    if(!requirePermission("payroll.manage")) return;
    const parts = afghanCalendarParts();
    setPayrollForm({ employeeId: "", year: String(selectedYear || parts.year), month: String(selectedMonth || parts.month), base: "", bonus: "0",
      deduction: "0", date: today, notes: "" });
    setModal({ type: "payroll" });
  }
  function savePayroll(e) {
    e.preventDefault();
    if(!requirePermission("payroll.manage")) return;
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
    if(!requirePermission("payroll.pay")) return;
    const slip=data.payroll.find(x=>x.id===id);
    if(!slip || slip.status==='paid') {notify('این برگه قبلاً پرداخت شده است.');return;}
    if(!canAffordCash(data,preferences.openingCash,payrollAmounts(slip).net)) {
      notify('موجودی صندوق برای پرداخت معاش کافی نیست.');return;
    }
    setData(prev => ({ ...prev, payroll: prev.payroll.map(x => x.id === id ? { ...x, status: "paid", paidDate: today } : x) }));
    notify("پرداخت معاش ثبت شد.");
  }
  function deletePayroll(id) {
    if(!requirePermission("payroll.manage")) return;
    const record = data.payroll.find(x => x.id === id);
    if (record?.status === "paid") { notify("برگه پرداخت‌شده را نمی‌توان حذف کرد."); return; }
    setData(prev => ({ ...prev, payroll: prev.payroll.filter(x => x.id !== id) }));
    notify("برگه معاش حذف شد.");
  }
  function openJournal() {
    if(!requirePermission("accounting.manage")) return;
    setForm({ name: "", date: today, notes: "" });
    setJournalItems([{ account: "", description: "", debit: 0, credit: 0 }]);
    setModal({ type: "journal" });
  }
  function saveJournal(e) {
    e.preventDefault();
    if(!requirePermission("accounting.manage")) return;
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

  const cashState = useMemo(()=>cashRegister(data,preferences.openingCash),[data,preferences.openingCash]);
  function saveCashEntry(draft){
    if(!requirePermission('accounting.manage')) return;
    try {
      const entry=buildManualCashEntry(draft);
      if(entry.kind==='out' && !canAffordCash(data,preferences.openingCash,entry.amount)){
        notify('پول کافی در صندوق موجود نیست.'); return false;
      }
      setData(prev=>({...prev,cashEntries:[entry,...(prev.cashEntries||[])]}));
      notify('حرکت صندوق ثبت شد.');return true;
    } catch(error){notify(error.message);return false;}
  }
  function deleteCashEntry(id){
    if(!requirePermission('accounting.manage')) return;
    const entry=(data.cashEntries||[]).find(x=>String(x.id)===String(id));
    if(!entry)return;
    const proposed={...data,cashEntries:data.cashEntries.filter(x=>String(x.id)!==String(id))};
    if(cashRegister(proposed,preferences.openingCash).balance<0){notify('حذف این حرکت موجودی صندوق را منفی می‌کند.');return;}
    setData(proposed);
    notify('حرکت دستی صندوق حذف شد.');
  }
  function saveAttendanceRecord(employeeId,date,status,notes=''){
    if(!requirePermission('employees.manage')) return false;
    try {
      if(!data.employees.some(e=>String(e.id)===String(employeeId))) throw Error('کارمند موجود نیست.');
      recordAttendance([],employeeId,date,status,notes);
      setData(prev=>({...prev,attendance:recordAttendance(prev.attendance,employeeId,date,status,notes)}));
      return true;
    } catch(error){notify(error.message);return false;}
  }
  function saveAttendanceBatch(employeeIds,date){
    if(!requirePermission('employees.manage'))return false;
    const ids=new Set(employeeIds.map(String));
    const staff=data.employees.filter(e=>ids.has(String(e.id)));
    const today=afghanKabulToday();
    setData(prev=>{
      let rows=prev.attendance||[];
      for(const employee of staff){const old=rows.find(r=>String(r.employeeId)===String(employee.id)&&r.date===date);const result=resolvedAttendance(old,date,today,employee);if(result.automatic&&result.status==='present')rows=recordAttendance(rows,employee.id,date,'present',old?.notes||'');}
      return rows===prev.attendance?prev:{...prev,attendance:rows};
    });return true;
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

  const lowStockCount = useMemo(() => lowStockProducts(data).length, [data]);
  const dashboardTotals = {
    ...totals, sales: fiscalReport.sales, purchases: fiscalReport.purchases,
    expenses: fiscalReport.expenses, paidWages: fiscalReport.paidPayroll,
  };

  function saveShipmentFromForm(draft) {
    if(!requirePermission('purchases.manage')) return false;
    const shipment=createShipment(draft,data);
    const paid=shipmentCost({...data,shipments:[...data.shipments,shipment]},shipment).paidCharges;
    if(paid>0&&!canAffordCash(data,preferences.openingCash,paid)) throw Error('پول کافی در صندوق برای مصارف پرداخت‌شده محموله نیست.');
    setData(prev=>({...prev,shipments:[shipment,...prev.shipments]}));
    notify('محموله و قیمت تمام‌شده آن ثبت شد.'); return true;
  }
  function removeShipmentRecord(id){
    if(!requirePermission('purchases.manage')) return false;
    if(data.invoices.some(i=>i.type==='sale'&&String(i.shipmentId)===String(id))){notify('این محموله به بل‌های فروش وصل است. نخست ارتباط فروش را بررسی کنید.');return false;}
    setData(prev=>({...prev,shipments:prev.shipments.filter(s=>String(s.id)!==String(id))}));
    notify('محموله حذف شد؛ محاسبات قیمت و صندوق بازسازی شدند.'); return true;
  }
  function addTraderSettlement(draft){
    if(!requirePermission('accounting.manage')) return false;
    const entry=createSettlement(draft,data);
    if(entry.viaCash&&entry.kind==='pay'&&!canAffordCash(data,preferences.openingCash,entry.afn))
      throw Error('موجودی صندوق برای این پرداخت کافی نیست.');
    setData(prev=>applySettlement(prev,entry));
    notify(entry.invoiceId?'پرداخت و مانده بل به‌روز شد.':'تسویه علی‌الحساب ثبت شد.'); return true;
  }

  function renderPage() {
    if(!canView(page)) return <AccessDenied onBack={() => setCurrentPage(availablePages(access,activeUserId)[0] || 'help')} />;
    if (page === "dashboard")
      return (
        <Dashboard
          data={data}
          totals={dashboardTotals}
          cashBalance={cashState.balance}
          fiscalYear={preferences.fiscalYear}
          userName={activeUser.name}
          onNavigate={setCurrentPage}
          onInvoice={openInvoice}
          onJournal={openJournal}
          can={can}
        />
      );
    if(page==='shipments') return <ShipmentsPage data={data} onAdd={can('purchases.manage')?saveShipmentFromForm:null} onDelete={can('purchases.manage')?removeShipmentRecord:null}/>;
    if(page==='traderAccounts') return <TraderAccountsPage data={data} onAdd={can('accounting.manage')?addTraderSettlement:null}/>;
    if(page==='profitAnalysis') return <ProfitAnalysisPage data={data}/>;
    if (page === "warehouseDashboard")
      return (
        <WarehouseDashboard data={data} totals={totals} onNavigate={setCurrentPage} onStock={can('inventory.manage') ? openStockMovement : null} />
      );
    if (page === "customersDashboard")
      return (
        <CustomersDashboard
          data={data}
          totals={totals}
          onNavigate={setCurrentPage}
          onInvoice={can('sales.manage') ? openInvoice : null}
        />
      );
    if (page === "debtors")
      return <DebtorsPage data={data} onPayment={can('sales.collect') ? openPayment : null} onNavigate={setCurrentPage} />;
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
          onAdd={can(ENTITY_MANAGE_PERMISSION[page]) ? () => openEntityForm(page) : null}
          onEdit={can(ENTITY_MANAGE_PERMISSION[page]) ? (r) => openEntityForm(page, r) : null}
          onDelete={can(ENTITY_MANAGE_PERMISSION[page]) ? (id) => deleteEntity(page, id) : null}
          receivables={page === "customers" ? customerReceivables(data.invoices) : {}}
          preferences={preferences}
          inventory={inventoryState(data)}
        />
      );
    }
    if (["sales", "purchases", "returns"].includes(page))
      return (
        <InvoicesPage
          preferences={preferences}
          page={page}
          data={data}
          search={search}
          setSearch={setSearch}
          onAdd={can(INVOICE_PERMISSIONS[page === 'sales' ? 'sale' : page === 'purchases' ? 'purchase' : 'return'].manage) ? () =>
            openInvoice(
              page === "sales"
                ? "sale"
                : page === "purchases"
                  ? "purchase"
                  : "return",
            ) : null
          }
          onDelete={can(INVOICE_PERMISSIONS[page === 'sales' ? 'sale' : page === 'purchases' ? 'purchase' : 'return'].manage) ? deleteInvoice : null}
          onPayment={(can('sales.collect')||can('purchases.manage')) ? openPayment : null}
          canCollectSale={can('sales.collect')} canCollectPurchase={can('purchases.manage')}
        />
      );
    if (page === "journal")
      return (
        <JournalPage
          data={data}
          onAdd={can('accounting.manage') ? openJournal : null}
          onDelete={can('accounting.manage') ? (id) => {
            setData((p) => ({
              ...p,
              journals: p.journals.filter((x) => x.id !== id),
            }));
            notify("سند حذف شد.");
          } : null}
        />
      );
    if (page === "expenses")
      return <ExpensesPage data={data} setData={setData} notify={notify} canManage={can('accounting.manage')} cashAvailable={cashState.balance} />;
    if (page === "cashRegister") return <CashRegisterPage state={cashState} onSave={can('accounting.manage')?saveCashEntry:null} onDelete={can('accounting.manage')?deleteCashEntry:null} />;
    if (page === "payroll")
      return <PayrollPage data={data} onNavigate={setCurrentPage} onAdd={can('payroll.manage') ? openPayroll : null} onPaid={can('payroll.pay') ? markPayrollPaid : null} onDelete={can('payroll.manage') ? deletePayroll : null} />;
    if (page === "attendance") return <AttendancePage data={data} onMark={can('employees.manage')?saveAttendanceRecord:null} onMarkAll={can('employees.manage')?saveAttendanceBatch:null} />;
    if (["reports", "trialBalance", "journalReport", "ledgerReport", "documentReport"].includes(page))
      return <ReportsPage page={page} data={data} openingCash={preferences.openingCash} />;
    if (page === "settings") return <SettingsPage preferences={preferences} years={years} data={data} appearance={appearance} onSaveAppearance={saveAppearance} onSave={savePreferences} onClearTransactions={clearTransactionsProtected} onResetBusiness={resetBusinessProtected} canManage={can('settings.manage')} />;
    if (page === "roles") return <RolesPage access={access} employees={data.employees} demoLoginEnabled={demoLoginEnabled} onActivateDemoLogin={activateDemoLogin} onIssueRecovery={issueRecovery} onSaveRole={saveRole} onDeleteRole={deleteRole} onSaveUser={saveUser} onDeleteUser={deleteUser} onPreviewUser={previewAs} />;
    if (page === "profile") return <ProfilePage preferences={{...preferences,userName:activeUser.name,userTitle:activeUser.title}} onSave={saveProfile} onNavigate={setCurrentPage} canEdit={can('profile.edit')} roleName={activeRole?.name||''} />;
    if (page === "help") return <HelpPage onNavigate={setCurrentPage} canView={canView} />;
    return (
      <Dashboard
        data={data}
        totals={dashboardTotals}
        cashBalance={cashState.balance}
        fiscalYear={preferences.fiscalYear}
        userName={activeUser.name}
        onNavigate={setCurrentPage}
        onInvoice={openInvoice}
        onJournal={openJournal}
        can={can}
      />
    );
  }

  if(!demoLoginEnabled || setupResult) return <DemoFirstSetup shopName={preferences.shopName} onSetup={activateDemoLogin} setupResult={setupResult} onContinue={()=>setSetupResult(null)}/>;
  if(needsLogin) return <DemoLoginScreen shopName={preferences.shopName} onLogin={login} onRecover={resetDemoPassword}/>;
  if(shiftRestricted) return <DemoShiftClosed shopName={preferences.shopName} user={signedInUser} status={workingAccess} onLogout={logout} now={new Date(kabulTick)}/>;
  if(previewShiftRestricted) return <DemoShiftClosed shopName={preferences.shopName} user={previewEmployee} status={checkedAccess.preview} onLogout={leavePreview} preview now={new Date(kabulTick)}/>;
  if(demoLoginEnabled && signedInUser?.mustChangePassword && !previewUserId)
    return <DemoChangePasswordScreen shopName={preferences.shopName} user={signedInUser} onChangePassword={changeOwnDemoPassword}/>;
  const visiblePage = renderPage();
  return (
    <CalendarModeContext.Provider value={preferences.calendarMode || "shamsi"}>
    <div
      className={`app-shell ${mobileMenu ? "sidebar-open" : ""} ${sidebarVisible ? "" : "sidebar-collapsed"}`}
      dir="ltr"
    >
      <aside className="sidebar" dir="rtl" aria-label="منوی اصلی">
        <div className="sidebar-brand">
          <button type="button" className="sidebar-brand-home" onClick={() => setCurrentPage("dashboard")} title="بازگشت به صفحه اصلی" aria-label={`بازگشت به صفحه اصلی — ${preferences.shopName}`}>
            <div className="brand-mark" aria-hidden="true">
              {preferences.shopLogo ? <img src={preferences.shopLogo} className="sidebar-brand-image" alt="" /> : <span className="brand-initial">{preferences.shopName.trim().charAt(0) || "ع"}</span>}
            </div>
            <div className="brand-text">
              <strong title={preferences.shopName}>{preferences.shopName}</strong>
              <small>سامانه مدیریت تجارت</small>
            </div>
          </button>
          <button
            className="icon-btn sidebar-close"
            onClick={() => setMobileMenu(false)}
            aria-label="بستن منو"
          >
            <X size={17} />
          </button>
        </div>
        <button
          type="button"
          className="sidebar-period sidebar-period-button"
          aria-expanded={sidebarPopup === "year"}
          aria-controls="fiscal-year-picker"
          onClick={() => setSidebarPopup(x => x === "year" ? "" : "year")}
        >
          <span className="period-dot" aria-hidden="true"></span>
          <span className="sidebar-period-copy">
            <strong>سال مالی {number(preferences.fiscalYear)}</strong>
            <small>{formatCalendarDate(today,preferences.calendarMode)}</small>
          </span>
          <ChevronDown className={sidebarPopup === "year" ? "rotate-chevron" : ""} size={15} />
        </button>
        {sidebarPopup === "year" && (
          <div className="sidebar-year-menu" id="fiscal-year-picker">
            <label htmlFor="sidebar-fiscal-year">انتخاب سال مالی</label>
            <select
              id="sidebar-fiscal-year"
              disabled={!can('settings.manage')}
              value={preferences.fiscalYear}
              onChange={event => changeFiscalYear(Number(event.target.value))}
            >
              {years.map(year => <option value={year} key={year}>{number(year)} {year !== preferences.fiscalYear && !financialYearRecordCount(data,year) ? '— بدون معلومات' : ''}</option>)}
            </select>
            <small>اگر برای سال انتخاب‌شده ریکاردی وجود نداشته باشد، سال مالی تغییر نمی‌کند و پیغام نمایش داده می‌شود.</small>
          </div>
        )}
        <nav className="sidebar-nav">
          {navGroups.map((group) => {
            const items=group.items.filter(item=>canView(item.id));
            if(!items.length) return null;
            const Icon = group.icon;
            const expanded = expandedGroups.has(group.label);
            return (
              <section
                className={`side-nav-group ${expanded ? "expanded" : ""}`}
                key={group.label}
              >
                <button
                  type="button"
                  className="side-nav-heading"
                  aria-expanded={expanded}
                  onClick={() => setExpandedGroups(previous =>
                    previous.has(group.label) ? new Set() : new Set([group.label])
                  )}
                >
                  <Icon size={16} />
                  <span>{group.label}</span>
                  <ChevronDown className="side-nav-chevron" size={15} />
                </button>
                {expanded && (
                  <div className="side-nav-items">
                    {items.map((item) => {
                      const ItemIcon = navigationIcons[item.id] || FileText;
                      // NavLink computes its active state from React Router, never from stale button focus.
                      return (
                        <NavLink
                          key={item.id}
                          to={pathForPage(item.id)}
                          end
                          className={({isActive}) => `side-nav-link ${isActive ? 'active' : ''}`}
                          onClick={event => {
                            if (!canView(item.id)) {event.preventDefault();notify('شما به این بخش دسترسی ندارید.');return;}
                            setSearch('');setAccountOpen(false);setCalendarOpen(false);
                            setSearchOpen(false);setOpenMenu('');setSidebarPopup('');
                            setShowNotices(false);setMobileMenu(false);
                          }}
                        >
                          {({isActive}) => <>
                            <ItemIcon className="side-nav-item-icon" size={17}
                              strokeWidth={isActive ? 2.2 : 1.75} aria-hidden="true" />
                            <span>{item.label}</span>
                            {isActive && <span className="side-nav-active-dot" />}
                          </>}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </nav>
        <div className="sidebar-bottom">
          <button type="button" className="sidebar-help sidebar-action" onClick={() => setCurrentPage("help")}>
            <span className="help-icon"><CircleHelp size={17} /></span>
            <span className="sidebar-action-copy">
              <strong>راهنمای سامانه</strong>
              <small>راهنمای بخش‌های برنامه</small>
            </span>
            <ChevronDown size={14} className="help-chevron" />
          </button>
          <button type="button" className="sidebar-user sidebar-action" onClick={() => setCurrentPage("profile")}>
            <span className="avatar">{activeUser.name.trim().charAt(0) || "ح"}</span>
            <span className="sidebar-action-copy">
              <strong>{activeUser.name}</strong>
              <small>{activeRole?.name || activeUser.title}</small>
            </span>
            <MoreHorizontal size={17} />
          </button>
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
            <button type="button" className="icon-btn display-mode-toggle" aria-label={appearance.mode==='dark'?'فعال‌کردن حالت روشن':'فعال‌کردن حالت تاریک'} title={appearance.mode==='dark'?'حالت روشن':'حالت تاریک'} aria-pressed={appearance.mode==='dark'} onClick={()=>setAppearance(prev=>({...prev,mode:prev.mode==='dark'?'light':'dark'}))}>
              {appearance.mode==='dark'?<Sun size={19}/>:<Moon size={19}/>}
            </button>
            <QuickSearchBox search={search} onSearch={setSearch} results={foundItems} onSelect={goToSearchResult} open={searchOpen} setOpen={setSearchOpen} />
            <div className="header-date-wrap" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)) setCalendarOpen(false)}}>
              <button type="button" className="date-chip date-chip-button" aria-expanded={calendarOpen} aria-label="باز کردن تقویم" title="تقویم و فعالیت‌های روزانه" onClick={()=>{setCalendarOpen(v=>!v);setAccountOpen(false);setSearchOpen(false)}}><CalendarDays size={17}/><span>{formatCalendarDate(today,preferences.calendarMode)}</span></button>
              {calendarOpen && <AfghanHeaderCalendar data={data} todayLabel={today} canView={canView} onNavigate={setCurrentPage} onClose={()=>setCalendarOpen(false)}/>}
            </div>
            <div className="header-notice-wrap">
              <button
                type="button"
                className="icon-btn notification-btn"
                title="اعلان‌ها"
                aria-label="اعلان‌ها"
                aria-expanded={showNotices}
                onClick={() => setShowNotices(x => !x)}
              ><Bell size={17} /></button>
              {showNotices && <div className="notices-popover" role="status">
                <strong>اعلان‌های گدام</strong>
                <p>{lowStockCount > 0 ? `${number(lowStockCount)} محصول به موجودی کم رسیده است.` : "فعلاً اعلان تازه‌ای وجود ندارد."}</p>
                <button type="button" className="text-btn" onClick={() => setCurrentPage("warehouseDashboard")}>دیدن گدام</button>
              </div>}
            </div>
            <div className="header-account-wrap" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)) setAccountOpen(false)}}>
              <button type="button" className="user-chip" aria-expanded={accountOpen} aria-label="باز کردن منوی حساب کاربری" title="حساب کاربری، تنظیمات و خروج از حساب" onClick={()=>{setAccountOpen(v=>!v);setCalendarOpen(false);setSearchOpen(false)}}>
                <span className="avatar">{activeUser.name.trim().charAt(0) || "ح"}</span>
                <span>{activeUser.name}</span>
                <ChevronDown size={15} className={accountOpen?'rotate-chevron':''}/>
              </button>
              {accountOpen && <div className="header-account-menu" role="menu">
                <div className="account-menu-heading"><strong>{activeUser.name}</strong><small>{activeRole?.name || activeUser.title}</small></div>
                <button type="button" role="menuitem" onClick={()=>setCurrentPage('profile')}><UserRound size={17}/> پروفایل کاربر</button>
                {canView('settings') && <button type="button" role="menuitem" onClick={()=>setCurrentPage('settings')}><Settings size={17}/> تنظیمات عمده‌فروشی</button>}
                {canView('roles') && <button type="button" role="menuitem" onClick={()=>setCurrentPage('roles')}><ShieldCheck size={17}/> کاربران و صلاحیت‌ها</button>}
                {demoLoginEnabled && !previewUserId && <button type="button" role="menuitem" className="account-menu-danger" onClick={()=>{setAccountOpen(false);logout()}}><LogOut size={17}/> خروج از حساب</button>}
                {!demoLoginEnabled && canView('roles') && <button type="button" role="menuitem" onClick={()=>setCurrentPage('roles')}><LockKeyhole size={17}/> فعال‌سازی صفحه ورود</button>}
              </div>}
            </div>
          </div>
        </header>
        <div className="mobile-search-bar">
          <QuickSearchBox mobile search={search} onSearch={setSearch} results={foundItems} onSelect={goToSearchResult} open={searchOpen} setOpen={setSearchOpen}/>
        </div>
        {previewUserId && <div className="role-preview-banner" role="status" dir="rtl">
          <Eye size={18} /> <span>پیش‌نمایش صلاحیت‌های <strong>{activeUser.name}</strong> — {activeRole?.name}.</span>
          <button type="button" className="btn secondary" onClick={leavePreview}>بازگشت به مدیر سیستم</button>
        </div>}
        <main className="main-area">
          <div className="page-toolbar">
            <div>
              <div className="eyebrow">سامانه یکپارچه مدیریت عمده‌فروشی</div>
              <h1>{currentTitle}</h1>
            </div>
            <div className="toolbar-right">
              <span className="today-label">{formatCalendarDate(today,preferences.calendarMode)}</span>
            </div>
          </div>
          <Routes>
            <Route path="/" element={<Navigate to={pathForPage('dashboard')} replace />} />
            {Object.values(PAGE_PATHS).map(routePath =>
              <Route key={routePath} path={routePath} element={visiblePage} />
            )}
            <Route path="*" element={<Navigate to={pathForPage('dashboard')} replace />} />
          </Routes>
        </main>
        <footer className="app-footer">
          {preferences.shopName} <span>رابط کاربری React</span>
        </footer>
      </div>
      {toast && (
        <div className="toast" dir="rtl">
          <Check size={16} />
          {toast}
        </div>
      )}
      {settingsChallenge && <SettingsPasswordDialog
        challenge={settingsChallenge}
        onCancel={()=>setSettingsChallenge(null)}
        onApprove={verifyAndApplySettings}
      />}
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
                  ? (data.invoices.find(x=>x.id===modal.invoiceId)?.type==='purchase'?'ثبت پرداخت به عرضه‌کننده':'ثبت دریافت پول از مشتری')
                : modal.type === "journal"
                  ? "ثبت سند حسابداری"
                  : modal.type === "stock" ? "ثبت حرکت گدام"
                  : modal.type === "payroll" ? "محاسبه و ثبت معاش"
                  : "ثبت مصارف"
          }
          onClose={modal.type === 'entity' ? cancelEntityForm : () => setModal(null)}
        >
          {modal.type === "entity" && (
            <EntityForm
              preferences={preferences}
              config={entityConfigs[modal.key]}
              form={form}
              setForm={setForm}
              data={data}
              onSubmit={saveEntity}
              onCancel={cancelEntityForm}
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
              onCreateCustomer={()=>createPartyFromInvoice('customers')}
              onCreateSupplier={()=>createPartyFromInvoice('suppliers')}
              onQuickProduct={quickCreatePurchaseProduct}
              canCreateCustomer={can('customers.manage')}
              canCreateSupplier={can('customers.manage')}
              canCreateProduct={can('inventory.manage')}
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
    </CalendarModeContext.Provider>
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
function Dashboard({ data, totals, cashBalance=0, fiscalYear, userName, onNavigate, onInvoice, onJournal, can=()=>true }) {
  // No artificial figures: charts use only transactions entered by the shop.
  const chartData = data;
  const shortcuts = [
    ["صدور بل فروش", () => onInvoice("sale"), Receipt, 'sales.manage'],
    ["صدور بل خرید", () => onInvoice("purchase"), ShoppingCart, 'purchases.manage'],
    ["افزودن محصول", () => onNavigate("products"), Package, 'inventory.manage'],
    ["ثبت طرف حساب", () => onNavigate("customers"), ContactRound, 'customers.manage'],
    ["ثبت سند حسابداری", onJournal, BookOpen, 'accounting.manage'],
  ].filter(item=>can(item[3]));
  return (
    <>
      <div className="welcome-row">
        <div>
          <h2>خوش آمدید، {userName}</h2>
          <p>نمای کلی فعالیت‌های تجارتی شما در سال مالی جاری</p>
        </div>
        <div className="dashboard-period-actions">
          <span className="year-pill">سال مالی {number(fiscalYear)}</span>
        </div>
      </div>
      {shortcuts.length>0 && <div className="shortcut-grid">
        {shortcuts.map(([label, action, Icon]) => (
          <button className="shortcut" key={label} onClick={action}>
            <span>
              <Icon size={18} />
            </span>
            {label}
            <Plus size={14} className="shortcut-plus" />
          </button>
        ))}
      </div>}
      <div className="stats-grid">
        {can('accounting.view') && <div className="cash-dashboard-shortcut" onClick={()=>onNavigate('cashRegister')} role="button" tabIndex={0} onKeyDown={e=>{if(e.key==='Enter')onNavigate('cashRegister')}}><StatCard label="پول موجود در صندوق" value={money(cashBalance)} icon={CircleDollarSign} tone="green" note="دریافت و پرداخت واقعی" /></div>}
        <StatCard
          label="کل موجودی گدام"
          value={money(totals.stock)}
          icon={Warehouse}
          tone="blue"
          note="به اساس بهای تمام‌شده موجودی فعلی"
        />
        <StatCard
          label="فروشات سال مالی"
          value={money(totals.sales)}
          icon={TrendingUp}
          tone="green"
        />
        <StatCard
          label="مصارف سال مالی"
          value={money(totals.expenses)}
          icon={TrendingDown}
          tone="rose"
        />
        <StatCard
          label="معاشات پرداخت‌شده سال مالی"
          value={money(totals.paidWages)}
          icon={ChartNoAxesCombined}
          tone="violet"
        />
        <StatCard
          label="خریداری‌های سال مالی"
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
      <div className="dashboard-insights-grid">
        <Panel title="مقایسه فروشات و خریداری‌ها" action={<span className="muted-pill">سال {number(fiscalYear)}</span>}>
          <SalesPurchaseChart data={chartData} fiscalYear={fiscalYear} />
        </Panel>
        <Panel title="تحلیل قرضداری مشتریان" action={<button className="text-btn" onClick={() => onNavigate("debtors")}>دیدن مشتریان بدهکار</button>}>
          <DebtAgingChart data={chartData} />
        </Panel>
        <Panel title="اجناس با موجودی کم" action={<button className="text-btn" onClick={() => onNavigate("products")}>دیدن محصولات</button>}>
          <LowStockDashboard data={chartData} />
        </Panel>
      </div>
      <div className="dashboard-grid">
        <Panel
          title="درآمد و مصارف ماهانه"
          action={<span className="muted-pill">سال مالی {number(fiscalYear)}</span>}
        >
          <MonthlyOverview data={data} fiscalYear={fiscalYear} />
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
function SalesPurchaseChart({data,fiscalYear}) {
  const months=monthlySalesPurchases(data,fiscalYear);
  const max=Math.max(1,...months.flatMap(m=>[m.sales,m.purchases]));
  const totalSales=months.reduce((sum,m)=>sum+m.sales,0);
  const totalPurchases=months.reduce((sum,m)=>sum+m.purchases,0);
  if (!totalSales && !totalPurchases) return <EmptyState text="در این سال مالی هنوز بل فروش یا خرید ثبت نشده است."/>;
  return <>
    <div className="insight-legend"><span className="insight-sales-key">فروشات: {money(totalSales)}</span><span className="insight-purchases-key">خریداری‌ها: {money(totalPurchases)}</span></div>
    <div className="insight-chart-scroll" role="region" aria-label="نمودار فروشات و خریداری‌ها به تفکیک ماه" tabIndex={0}>
      <div className="insight-month-bars">
        {months.map(month=><div className="insight-month" key={month.month} title={`${month.name} — فروشات: ${money(month.sales)}، خریداری‌ها: ${money(month.purchases)}`}>
          <div className="insight-month-column">
            <div className="insight-month-bar sale" style={{height:`${month.sales ? Math.max(3,month.sales/max*100):0}%`}}/>
            <div className="insight-month-bar purchase" style={{height:`${month.purchases ? Math.max(3,month.purchases/max*100):0}%`}}/>
          </div>
          <span>{month.name}</span>
        </div>)}
      </div>
    </div>
    <p className="chart-note">برای دیدن مبلغ دقیق، روی ستون ماه نشانگر ببرید. در موبایل نمودار قابل کشیدن است.</p>
  </>;
}
function DebtAgingChart({data}) {
  const {buckets,unknown,unknownCount}=customerDebtAging(data);
  const max=Math.max(1,...buckets.map(bucket=>bucket.total));
  const sum=buckets.reduce((s,b)=>s+b.total,0)+unknown;
  if (!sum) return <EmptyState text="در حال حاضر هیچ بل فروش پرداخت‌نشده‌ای ثبت نشده است."/>;
  return <div className="insight-debt-list">
    {buckets.map(bucket=><div className="insight-debt-row" key={bucket.key}>
      <div className="insight-row-label"><span>{bucket.label}</span><strong>{money(bucket.total)}</strong></div>
      <div className="insight-bar-track" role="img" aria-label={`${bucket.label}: ${money(bucket.total)} در ${number(bucket.count)} بل`}>
        <div className={`insight-bar-fill debt debt-${bucket.key.replace('+','plus')}`} style={{width:`${bucket.total/max*100}%`}}/>
      </div>
      <small>{number(bucket.count)} بل</small>
    </div>)}
    {unknown>0&&<p className="chart-note">{number(unknownCount)} بل بدون تاریخ معتبر: {money(unknown)} (خارج از گروه‌بندی)</p>}
    <p className="chart-note">مدت قرضداری از تاریخ صدور بل تا امروز محاسبه می‌شود. همهٔ بل‌های پرداخت‌نشده شامل اند.</p>
  </div>;
}
function LowStockDashboard({data}) {
  const items=lowStockProducts(data);
  if (!items.length) return <EmptyState text="فعلاً جنس با موجودی کمتر یا مساوی نقطهٔ سفارش موجود نیست. برای شناسایی اجناس با موجودی کم، نقطهٔ سفارش محصولات را تعیین کنید."/>;
  return <div className="insight-stock-list">
    {items.slice(0,7).map(item=><div className="insight-stock-row" key={item.id}>
      <div className="insight-row-label"><strong>{item.name}</strong><span>{number(item.quantity)} / {number(item.reorder)} {item.unit||''}</span></div>
      <div className="insight-bar-track" role="img" aria-label={`${item.name}، موجودی ${number(item.quantity)}، نقطه سفارش ${number(item.reorder)}`}>
        <div className={`insight-bar-fill stock ${Number(item.quantity)<=0?'empty-stock':''}`} style={{width:`${Math.max(0,Math.min(100,Number(item.quantity)/Number(item.reorder)*100))}%`}}/>
      </div>
    </div>)}
    {items.length>7&&<span className="chart-note">{number(items.length-7)} جنس دیگر نیز موجودی کم دارند.</span>}
    <p className="chart-note">موجودی فعلی نسبت به نقطهٔ سفارش هر محصول</p>
  </div>;
}
function MonthlyOverview({ data, fiscalYear }) {
  const currentYear = fiscalYear;
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
        {onStock && <button className="btn primary" onClick={onStock}><ArrowLeftRight size={16}/> ثبت حرکت گدام</button>}</>}/>
    <div className="stats-grid six">
      <StatCard label="ارزش موجودی" value={money(inventory.value)} icon={CircleDollarSign} tone="blue"/>
      <StatCard label="محصولات ثبت‌شده" value={number(inventory.rows.length)} icon={Package} tone="violet"/>
      <StatCard label="تعداد موجودی" value={number(inventory.totalQuantity)} icon={Boxes} tone="green"/>
      <StatCard label="زیر نقطه سفارش" value={number(lowStock.length)} icon={Package} tone="rose"/>
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
            {onInvoice && <button className="btn primary" onClick={() => onInvoice("sale")}>
              <Plus size={15} /> صدور بل
            </button>}
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
  preferences,
}) {
  const cfg = entityConfigs[page];
  const [selectedId,setSelectedId]=useState(null);
  const rows = page === "products" ? inventory.rows : page === "warehouses" ? (data.warehouses || []).map(w => ({
    ...w, quantity: data.products.reduce((sum, product) => sum + inventory.get(product.id, w.id), 0)
  })) : page === "customers"
    ? (data[page] || []).map((row) => ({ ...row, balance: receivables[row.name] || 0 }))
    : (data[page] || []);
  const filtered = rows.filter((row) =>
    JSON.stringify(row).toLowerCase().includes(search.toLowerCase()),
  );
  const selectedRecord=rows.find(row=>String(row.id)===String(selectedId));
  const canInspect=page==='customers'||page==='employees';
  const actions = (
    <>
      <button
        className="btn secondary"
        onClick={() => downloadCsv(cfg.title, cfg.columns, rows)}
      >
        <Download size={15} /> خروجی CSV
      </button>
      {onAdd && <button className="btn primary" onClick={onAdd}>
        <Plus size={16} /> {cfg.add}
      </button>}
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
          onView={canInspect?row=>setSelectedId(row.id):null}
          empty="معلوماتی پیدا نشد. برای شروع، مورد جدید اضافه کنید."
        />
      </Panel>
      {canInspect&&selectedRecord&&<Modal title={`${page==='customers'?'معلومات مشتری':'معلومات کارمند'} — ${page==='customers'?selectedRecord.name:[selectedRecord.firstName,selectedRecord.lastName].filter(Boolean).join(' ')}`} onClose={()=>setSelectedId(null)}>
        <EntityDetails record={selectedRecord} config={cfg} page={page} data={data} preferences={preferences} onEdit={onEdit?()=>{setSelectedId(null);onEdit(selectedRecord);}:null}/>
      </Modal>}
    </>
  );
}
function DataTable({ columns, rows, onEdit, onDelete, onView, empty }) {
  const calendarMode=React.useContext(CalendarModeContext);
  return (
    <div className="table-wrap mobile-card-table">
      <table>
        <thead>
          <tr>
            {columns.map(([key, label]) => (
              <th key={key}>{label}</th>
            ))}
            {(onEdit || onDelete || onView) && <th>عملیات</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className={onView?'inspectable-row':''} tabIndex={onView?0:undefined} role={onView?'button':undefined}
              aria-label={onView?`دیدن معلومات کامل ${row.name||[row.firstName,row.lastName].filter(Boolean).join(' ')}`:undefined}
              onClick={onView?event=>{if(event.target.closest('button,a,input,select'))return;onView(row)}:undefined}
              onKeyDown={onView?event=>{if(event.target!==event.currentTarget)return;if(event.key==='Enter'||event.key===' '){event.preventDefault();onView(row)}}:undefined}>
              {columns.map(([key]) => (
                <td key={key} data-label={columns.find(([columnKey]) => columnKey === key)?.[1]}>
                  {onView && (key==='name'||key==='firstName')
                    ? <button type="button" className="table-detail-link" onClick={()=>onView(row)} title="دیدن معلومات کامل">{formatCell(row[key],key,calendarMode)}</button>
                    : formatCell(row[key], key,calendarMode)}
                </td>
              ))}
              {(onEdit || onDelete || onView) && (
                <td data-label="عملیات" className="table-action-cell">
                  <div className="row-actions">
                    {onView&&<button type="button" className="icon-btn small" title="دیدن معلومات کامل" aria-label="دیدن معلومات کامل" onClick={()=>onView(row)}><Eye size={15}/></button>}
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
function IdentityScanReadOnly({attachment}) {
  const [url,setUrl]=useState('');
  const [error,setError]=useState('');
  useEffect(()=>{
    let active=true;
    let created='';
    setUrl('');setError('');
    if(!attachment?.id)return;
    loadIdentityScan(attachment.id).then(file=>{
      if(!active)return;
      if(!file?.blob){setError('سکن تذکره در حافظه این مرورگر پیدا نشد.');return;}
      created=URL.createObjectURL(file.blob);
      setUrl(created);
    }).catch(()=>{if(active)setError('بازکردن سند امکان‌پذیر نیست.');});
    return ()=>{active=false;if(created)URL.revokeObjectURL(created);};
  },[attachment?.id]);
  if(!attachment?.id)return <span>ثبت نشده</span>;
  return <div className="detail-identity">
    <strong>{attachment.name||'سکن تذکره'}</strong>
    {url&&attachment.mime?.startsWith('image/')&&<img src={url} alt="پیش‌نمایش سند هویت"/>}
    {url&&<a className="btn secondary" href={url} download={attachment.name||'tazkira'} target="_blank" rel="noopener noreferrer"><Download size={15}/> دیدن / ذخیره سند</a>}
    {error&&<small className="form-error">{error}</small>}
  </div>;
}
function EntityDetails({record,config,page,data,preferences,onEdit}) {
  const calendarMode=React.useContext(CalendarModeContext);
  const fields=config.fields.filter(([key],index,all)=>key!=='identityScan'&&all.findIndex(([other])=>other===key)===index);
  const customerBills=page==='customers'?(data.invoices||[]).filter(x=>x.type==='sale'&&x.party===record.name):[];
  const employeePayroll=page==='employees'?(data.payroll||[]).filter(x=>String(x.employeeId)===String(record.id)):[];
  const employeeAttendance=page==='employees'?(data.attendance||[]).filter(x=>String(x.employeeId)===String(record.id)):[];
  return <div className="entity-details" dir="rtl">
    <div className="entity-details-heading"><UserRound size={20}/><div><strong>{page==='customers'?record.name:[record.firstName,record.lastName].filter(Boolean).join(' ')}</strong><small>{page==='customers'?'مشخصات مشتری و معاملات':'مشخصات کارمند و سوابق'}</small></div></div>
    <div className="entity-details-grid">
      {fields.map(([key,label])=><div key={key} className="entity-details-field"><small>{label}</small><strong>{record[key]!==undefined && record[key]!==null&&String(record[key]).trim()!==''?formatCell(record[key],key):'ثبت نشده'}</strong></div>)}
      {page==='customers'&&<div className="entity-details-field"><small>مانده قرضداری</small><strong>{money(record.balance||0)}</strong></div>}
    </div>
    <div className="entity-details-section"><h3>سکن تذکره</h3><IdentityScanReadOnly attachment={record.identityScan}/></div>
    {page==='customers'&&record.saleContract?.enabled&&<div className="entity-details-section"><h3>شرایط قرارداد مشتری</h3>{onEdit&&<button type="button" className="btn secondary" onClick={onEdit}><Pencil size={15}/> ویرایش قرارداد</button>}<p>پیش‌پرداخت {number(record.saleContract.percent)}٪ — مهلت باقی‌داری {number(record.saleContract.days)} روز</p><p className="contract-wrap-text">{record.saleContract.terms}</p><h4>سکن تذکره تضمین‌کننده (داخلی)</h4><IdentityScanReadOnly attachment={record.saleContract.guarantorScan}/><button type="button" className="btn secondary" onClick={()=>printHtml(contractPrintHtml(contractSnapshot(record,preferences,{number:'—',date:afghanKabulToday(),total:0,paid:0,balance:0}),null,calendarMode,preferences))}><Printer size={15}/> چاپ پیش‌نویس قرارداد</button></div>}
    {page==='customers'&&<div className="entity-details-section"><h3>بل‌های فروش مشتری ({number(customerBills.length)})</h3>
      {customerBills.length?<div className="table-wrap"><table><thead><tr><th>شماره بل</th><th>تاریخ</th><th>مجموع (AFN)</th><th>مانده</th></tr></thead><tbody>{customerBills.map(b=><tr key={b.id}><td>{b.number}</td><td>{b.date}</td><td>{money(b.total)}</td><td>{money(b.balance)}</td></tr>)}</tbody></table></div>:<p className="settings-muted-info">بلی ثبت نشده است.</p>}
    </div>}
    {page==='employees'&&<div className="entity-details-section"><h3>سوابق معاش ({number(employeePayroll.length)})</h3>
      {employeePayroll.length?<div className="table-wrap"><table><thead><tr><th>ماه</th><th>سال</th><th>خالص معاش</th><th>وضعیت</th></tr></thead><tbody>{employeePayroll.map(p=><tr key={p.id}><td>{afghanMonths[Number(p.month)-1]||p.month}</td><td>{number(p.year)}</td><td>{money(payrollAmounts(p).net)}</td><td>{p.status==='paid'?'پرداخت‌شده':'پرداخت‌نشده'}</td></tr>)}</tbody></table></div>:<p className="settings-muted-info">معاشی ثبت نشده است.</p>}
      <small>حاضری‌های اصلاح‌شده توسط مسئول: {number(employeeAttendance.length)} ریکارد</small>
    </div>}
  </div>;
}

function formatCell(value, key, calendarMode) {
  if (value === undefined || value === null || value === "") return "—";
  if (key === "tax") return `${number(value)}٪`;
  if (key === 'date' || key === 'paidDate' || key === 'startDate' || key === 'endDate' || key === 'birthDate') {
    if(calendarMode)return formatCalendarDate(value,calendarMode);
    try {const settings=JSON.parse(localStorage.getItem(FRESH_STORAGE_KEYS.preferences)||'{}');return formatCalendarDate(value,settings.calendarMode);} catch{return String(value);}
  }
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
              <td data-label="عملیات" className="table-action-cell">{onPayment && <button className="btn primary pay-action" onClick={()=>onPayment(invoice)}><Wallet size={15}/> ثبت دریافت پول</button>}</td>
            </tr>)}
            {!outstanding.length && <tr className="empty-data-row"><td colSpan="7" className="empty-table-cell"><EmptyState text="در حال حاضر بل پرداخت‌نشده‌ای وجود ندارد."/></td></tr>}
          </tbody>
        </table>
      </div>
    </Panel>
  </>;
}
function PaymentForm({ invoice, form, setForm, onSubmit, onCancel }) {
  const rates={USD:form.usdRate,PKR:form.pkrRate,AED:form.aedRate,EUR:form.eurRate};
  if (!invoice) return <p>بل مورد نظر پیدا نشد.</p>;
  let amount=0;let rate=0;
  try {rate=currencyRate(form.currency||'AFN',rates);amount=toAfn(form.amount||0,form.currency||'AFN',rates);} catch {rate=0;}
  const remaining = Number(invoice.balance || 0);
  const previous = Array.isArray(invoice.payments) ? invoice.payments : [];
  return <form onSubmit={onSubmit} className="payment-form">
    <div className="payment-summary-grid">
      <div className="payment-summary-item"><span>{invoice.type==='purchase'?'عرضه‌کننده':'مشتری'}</span><strong>{invoice.party || 'طرف حساب نامشخص'}</strong></div>
      <div className="payment-summary-item"><span>شماره بل</span><strong>#{number(invoice.number)}</strong></div>
      <div className="payment-summary-item"><span>مجموع بل</span><strong>{money(invoice.total)}</strong></div>
      <div className="payment-summary-item"><span>مانده فعلی</span><strong>{money(remaining)}</strong></div>
    </div>
    <div className="modal-grid">
      <label>واحد پول {invoice.type==='purchase'?'پرداخت':'دریافت'}
        <select value={form.currency||'AFN'} onChange={e=>{
          const next=e.target.value;
          try {const afn=toAfn(Number(form.amount||0),form.currency||'AFN',rates);setForm({...form,currency:next,amount:form.amount===''?'':String(fromAfn(afn,next,rates))});} catch {if(!Number(form.amount))setForm({...form,currency:next}); else alert('نرخ این ارز را پیش از تبدیل مبلغ درج کنید.'); }
        }}>
          {CURRENCIES.map(code=><option key={code} value={code} >{CURRENCY_LABELS[code]}</option>)}
        </select>
      </label>
      {form.currency!=='AFN' && <div className="invoice-fx-box">
        <strong>نرخ تبدیل هنگام {invoice.type==='purchase'?'پرداخت':'دریافت'}</strong>
        <div className="invoice-fx-fields">
          <label>۱ {form.currency} = چند AFN؟<GroupedNumberInput  dir="ltr" min="0" step="any" value={form[rateFieldFor(form.currency)]??''} onChange={e=>setForm({...form,[rateFieldFor(form.currency)]:e.target.value})}/></label>
        </div>
      </div>}
      <label>مبلغ {invoice.type==='purchase'?'پرداخت‌شده':'دریافت‌شده'} ({form.currency||'AFN'})
        <GroupedNumberInput  min="0.01" step="any" inputMode="decimal" autoFocus required value={form.amount} onChange={(e)=>setForm({...form,amount:e.target.value})} placeholder="مبلغ دریافتی" />
      </label>
      <label>تاریخ {invoice.type==='purchase'?'پرداخت':'دریافت'}
        <AfghanDatePicker required value={form.date} onChange={date=>setForm({...form,date})}/>
      </label>
    </div>
    <label className="full-label">توضیحات (اختیاری)
      <textarea rows="2" value={form.notes} onChange={(e)=>setForm({...form,notes:e.target.value})} placeholder="مثلاً دریافت نقدی از مشتری"/>
    </label>
    <p className="info-note">{rate?`معادل افغانی: ${money(amount)} — نرخ ۱ ${form.currency||'AFN'} = ${number(rate)} AFN`:'نرخ این ارز را در همین فورم وارد کنید.'}</p>
    <div className="payment-result"><span>مانده بعد از دریافت</span><strong>{money(Math.max(0,remaining-(Number.isFinite(amount)?amount:0)))}</strong></div>
    {previous.length > 0 && <div className="payment-history">
      <strong>سوابق دریافت پول</strong>
      {previous.map((payment)=><div key={payment.id} className="payment-history-row"><span>{payment.date} {payment.notes ? `— ${payment.notes}` : ""}</span><strong>{money(payment.amount)}</strong></div>)}
    </div>}
    <div className="modal-actions">
      <button type="button" className="btn secondary" onClick={onCancel}>لغو</button>
      <button className="btn primary" type="submit"><Wallet size={16}/> {invoice.type==='purchase'?'ثبت پرداخت عرضه‌کننده':'ثبت دریافت پول'}</button>
    </div>
  </form>;
}
function InvoiceDetails({invoice, data, preferences, onClose}) {
  const calendarMode=React.useContext(CalendarModeContext);
  const currency=invoice.currency||'AFN';
  const extras=invoice.extraExpenses||[];
  const extraTotal=extras.reduce((sum,extra)=>sum+Number(extra.amount||0),0);
  const goodsTotal=Number.isFinite(Number(invoice.lineSubtotal))?Number(invoice.lineSubtotal):
    (invoice.items||[]).reduce((sum,item)=>sum+Number(item.quantity||0)*Number(item.price||0)-Number(item.discount||0),0);
  const rowMoney=value=>money(Number(value||0));
  const initialPayment=Math.max(0,Number(invoice.paid||0)-(invoice.payments||[]).reduce((sum,p)=>sum+Number(p.amount||0),0));
  return <div className="invoice-detail" dir="rtl">
    <div className="invoice-detail-meta">
      <div><span>شماره بل</span><strong>#{number(invoice.number)}</strong></div>
      <div><span>تاریخ</span><strong>{formatCalendarDate(invoice.date,calendarMode)}</strong></div>
      <div><span>{invoice.type==='purchase'?'عرضه‌کننده':'مشتری'}</span><strong>{invoice.party||'ثبت نشده'}</strong></div>
      <div><span>گدام</span><strong>{data.warehouses.find(w=>String(w.id)===String(invoice.warehouseId))?.name||'گدام عمومی'}</strong></div>
      <div><span>واحد پول اصلی</span><strong>{currency} {currency!=='AFN'?`— ۱ ${currency} = ${number(invoice.exchangeRate||0)} AFN`:''}</strong></div>
      <div><span>وضعیت</span><strong>{invoice.status||'ثبت‌شده'}</strong></div>
    </div>
    <h4>جزئیات اجناس</h4>
    <div className="table-wrap"><table><thead><tr><th>نام جنس</th><th>تعداد</th><th>قیمت واحد (AFN)</th><th>تخفیف (AFN)</th><th>مجموع (AFN)</th></tr></thead><tbody>
      {(invoice.items||[]).map((item,index)=><tr key={index}><td>{item.product||'—'}</td><td>{number(item.quantity)}</td><td>{rowMoney(item.price)}</td><td>{rowMoney(item.discount)}</td><td>{rowMoney(Number(item.quantity||0)*Number(item.price||0)-Number(item.discount||0))}</td></tr>)}
    </tbody></table></div>
    <div className="invoice-detail-breakdown">
      <div className="invoice-detail-total"><span>مجموع قیمت اجناس</span><strong>{rowMoney(goodsTotal)}</strong></div>
      <h4>مصارف اضافی — تفکیک هر مصرف</h4>
      {extras.length?extras.map((extra,index)=><div key={extra.id||index} className="invoice-detail-cost"><span>{index+1}. {extra.description||'مصرف اضافی'} {currency!=='AFN'&&extra.sourceAmount!=null&&<small>({number(extra.sourceAmount)} {currency})</small>}</span><strong>{rowMoney(extra.amount)}</strong></div>):<p className="invoice-detail-muted">برای این بل مصارف اضافی ثبت نشده است.</p>}
      <div className="invoice-detail-total"><span>مجموع مصارف اضافی</span><strong>{rowMoney(invoice.extraExpensesTotal??extraTotal)}</strong></div>
      <div className="invoice-detail-grand"><span>مجموع نهایی بل (اجناس + مصارف)</span><strong>{rowMoney(invoice.total)}</strong></div>
      {currency!=='AFN'&&<div className="invoice-detail-total"><span>مجموع در {currency}</span><strong>{number(invoice.foreignTotal??(Number(invoice.total||0)/Number(invoice.exchangeRate||1)))} {currency}</strong></div>}
      <div className="invoice-detail-total"><span>مبلغ پرداخت‌شده</span><strong>{rowMoney(invoice.paid)}</strong></div>
      <div className="invoice-detail-total"><span>مانده پرداخت‌نشده</span><strong>{rowMoney(invoice.balance)}</strong></div>
    </div>
    {(initialPayment>0||(invoice.payments||[]).length>0)&&<><h4>سوابق پرداخت‌ها</h4>
      {initialPayment>0&&<div className="invoice-detail-cost"><span>پرداخت هنگام ثبت بل — {formatCalendarDate(invoice.date,calendarMode)}</span><strong>{rowMoney(initialPayment)}</strong></div>}
      {(invoice.payments||[]).map((payment,index)=><div className="invoice-detail-cost" key={payment.id||index}><span>{formatCalendarDate(payment.date,calendarMode)} {payment.notes?`— ${payment.notes}`:''} {payment.currency&&payment.currency!=='AFN'&&payment.sourceAmount!=null?`(${number(payment.sourceAmount)} ${payment.currency})`:''}</span><strong>{rowMoney(payment.amount)}</strong></div>)}
    </>}
    {invoice.notes&&<p className="invoice-detail-muted">ملاحظات: {invoice.notes}</p>}
    {invoice.saleContract&&<section className="contract-payment-summary"><strong>شرایط قرارداد هنگام فروش</strong><span>پیش‌پرداخت {number(invoice.saleContract.percent)}٪ — حداقل {money(invoice.saleContract.minimum)}</span><span>تاریخ نهایی پرداخت: {formatCalendarDate(invoice.saleContract.due,calendarMode)}</span></section>}
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onClose}>بستن جزئیات</button>{invoice.saleContract&&<button type="button" className="btn secondary" onClick={()=>printHtml(contractPrintHtml(invoice.saleContract,invoice,calendarMode,preferences))}><FileText size={15}/> چاپ قرارداد</button>}<button type="button" className="btn primary" onClick={()=>printHtml(invoicePrintHtml(invoice,data,preferences,calendarMode))}><Printer size={15}/> چاپ بل کامل</button></div>
  </div>;
}
function InvoicesPage({ page, data, preferences, search, setSearch, onAdd, onDelete, onPayment, canCollectSale=false, canCollectPurchase=false }) {
  const calendarMode=React.useContext(CalendarModeContext);
  const [selectedInvoiceId,setSelectedInvoiceId]=useState(null);
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
            {onAdd && <button className="btn primary" onClick={onAdd}>
              <Plus size={16} /> {invoiceTitle(type)}
            </button>}
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
        <div className="table-wrap mobile-card-table invoice-list-table">
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
                  <td data-label="شماره بل"><button type="button" className="table-detail-link" onClick={()=>setSelectedInvoiceId(row.id)}>#{number(row.number)} — جزئیات</button></td>
                  <td data-label="تاریخ">{formatCalendarDate(row.date,calendarMode)}</td>
                  <td data-label={type === "purchase" ? "عرضه‌کننده" : "مشتری"}>{row.party || "—"}</td>
                  <td data-label="تعداد اقلام">{number(row.items?.length || 0)}</td>
                  <td data-label="مبلغ (افغانی)">{number(row.total)}{Number(row.extraExpensesTotal||0)>0&&<small className="invoice-expense-tag">شامل مصارف: {number(row.extraExpensesTotal)} افغانی</small>}</td>
                  <td data-label="مانده">{number(row.balance)}</td>
                  <td data-label="وضعیت">
                    <span className="status success">
                      {row.status || "ثبت‌شده"}
                    </span>
                  </td>
                  <td data-label="عملیات" className="table-action-cell">
                    <div className="row-actions">
                      <button type="button" className="icon-btn small" title="دیدن جزئیات کامل بل" aria-label="دیدن جزئیات کامل بل" onClick={()=>setSelectedInvoiceId(row.id)}><Eye size={15}/></button>
                      {onPayment && ((type==='sale' && canCollectSale) || (type==='purchase' && canCollectPurchase)) && Number(row.balance || 0) > 0 && (
                        <button className="btn primary pay-action" onClick={() => onPayment(row)}>
                          <Wallet size={15} /> {type==='purchase'?'ثبت پرداخت عرضه‌کننده':'ثبت دریافت پول'}
                        </button>
                      )}
                      <button
                        className="icon-btn small"
                        onClick={() => printHtml(invoicePrintHtml(row,data,preferences,calendarMode))}
                        title="چاپ این بل"
                      >
                        <Printer size={14} />
                      </button>
                      {onDelete && <button
                        className="icon-btn small danger"
                        onClick={() => onDelete(row.id)}
                        title="حذف"
                      >
                        <Trash2 size={14} />
                      </button>}
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
      {selectedInvoiceId!=null&&data.invoices.some(x=>String(x.id)===String(selectedInvoiceId))&&<Modal title={`جزئیات بل #${number(data.invoices.find(x=>String(x.id)===String(selectedInvoiceId)).number)}`} onClose={()=>setSelectedInvoiceId(null)}>
        <InvoiceDetails invoice={data.invoices.find(x=>String(x.id)===String(selectedInvoiceId))} data={data} preferences={preferences} onClose={()=>setSelectedInvoiceId(null)}/>
      </Modal>}
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
            {onAdd && <button className="btn primary" onClick={onAdd}>
              <Plus size={16} /> ایجاد سند
            </button>}
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
function CashRegisterPage({state,onSave,onDelete}){
  const [draft,setDraft]=useState({kind:'in',amount:'',date:today,description:''});
  const [from,setFrom]=useState('');
  const [to,setTo]=useState('');
  const [search,setSearch]=useState('');
  const rows=state.entries.filter(r=>(!from||afghanDateOrder(r.date)>=afghanDateOrder(from))&&(!to||afghanDateOrder(r.date)<=afghanDateOrder(to))&&`${r.label} ${r.category} ${r.date}`.includes(search.trim()));
  const submit=e=>{e.preventDefault();if(!onSave)return;if(onSave(draft))setDraft(prev=>({...prev,amount:'',description:''}));};
  return <>
    <PageHeading title="صندوق نقدی" description="موجودی صندوق بر اساس پول واقعی دریافت‌شده و پرداخت‌شده؛ معاملات قرضه تا زمان پرداخت حساب نمی‌شوند." actions={<button type="button" className="btn secondary" onClick={()=>downloadCsv('صندوق نقدی',[['date','تاریخ'],['label','توضیحات'],['amount','دریافت/پرداخت (AFN)'],['balance','مانده (AFN)']],rows)}><Download size={16}/> CSV</button>}/>
    <div className="stats-grid four">
      <StatCard label="پول آغازین صندوق" value={money(state.opening)} icon={Wallet} tone="blue"/>
      <StatCard label="پول دریافتی" value={money(state.incoming)} icon={TrendingUp} tone="green"/>
      <StatCard label="پول پرداختی" value={money(state.outgoing)} icon={TrendingDown} tone="rose"/>
      <StatCard label="موجودی فعلی صندوق" value={money(state.balance)} icon={CircleDollarSign} tone="violet"/>
    </div>
    {onSave && <Panel title="افزودن پول مالک / برداشت از صندوق">
      <p className="settings-muted-info">فروش، دریافت قرض، خرید، معاش و مصارف ثبت‌شده خودکار محاسبه می‌شوند. برای تکراری نشدن، آن‌ها را دوباره این‌جا ثبت نکنید.</p>
      <form className="form-grid" onSubmit={submit}>
        <label>نوع حرکت<select value={draft.kind} onChange={e=>setDraft({...draft,kind:e.target.value})}><option value="in">پول گذاشتن مالک در صندوق (+)</option><option value="out">برداشت پول توسط مالک (−)</option></select></label>
        <label>مبلغ (AFN)<GroupedNumberInput  min="0.01" step="0.01" inputMode="decimal" required value={draft.amount} onChange={e=>setDraft({...draft,amount:e.target.value})}/></label>
        <label>تاریخ<AfghanDatePicker required value={draft.date} onChange={date=>setDraft({...draft,date})}/></label>
        <label className="wide">توضیح / دلیل<input required maxLength={220} placeholder="مثلاً پول شخصی مالک برای خریداری" value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
        <div><button type="submit" className="btn primary"><Save size={16}/> ثبت حرکت صندوق</button></div>
      </form>
    </Panel>}
    <Panel title="سوابق دریافت و پرداخت صندوق">
      <div className="filter-row"><label>از تاریخ<AfghanDatePicker value={from} onChange={setFrom}/></label><label>تا تاریخ<AfghanDatePicker value={to} onChange={setTo}/></label><label>جستجو<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="نام / بل / مصرف"/></label><button className="btn secondary" onClick={()=>{setFrom('');setTo('');setSearch('')}} type="button">پاک‌کردن فلتر</button></div>
      <div className="table-wrap mobile-card-table"><table><thead><tr><th>تاریخ</th><th>توضیحات</th><th>دریافت (+)</th><th>پرداخت (−)</th><th>مانده پس از حرکت</th>{onDelete&&<th>عملیات</th>}</tr></thead><tbody>
        {rows.map(item=><tr key={item.id}><td data-label="تاریخ">{item.date||'—'}</td><td data-label="توضیحات">{item.label}</td><td data-label="دریافت">{item.amount>0?money(item.amount):'—'}</td><td data-label="پرداخت">{item.amount<0?money(-item.amount):'—'}</td><td data-label="مانده">{money(item.balance)}</td>{onDelete&&<td data-label="عملیات">{item.id.startsWith('manual-')&&<button className="icon-btn small danger" type="button" title="حذف حرکت دستی" onClick={()=>{if(window.confirm('این حرکت دستی صندوق حذف شود؟'))onDelete(item.ref)}}><Trash2 size={15}/></button>}</td>}</tr>)}
        {!rows.length&&<tr><td colSpan={onDelete?6:5}><EmptyState text="حرکت نقدی برای این فلتر ثبت نشده است."/></td></tr>}
      </tbody></table></div>
    </Panel>
  </>;
}

function ExpensesPage({ data, setData, notify, canManage=true, cashAvailable=0 }) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: today,
    description: "",
  });
  const save = (e) => {
    e.preventDefault();
    if(!canManage){notify('صلاحیت ثبت مصارف را ندارید.');return;}
    const amount=Number(form.amount);
    if(!Number.isFinite(amount)||amount<=0){notify('مبلغ مصرف باید بیشتر از صفر باشد.');return;}
    if(amount>cashAvailable+0.001){notify('پول کافی در صندوق موجود نیست.');return;}
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
      {canManage && <Panel title="ثبت مصرف">
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
            <GroupedNumberInput
              
              min="0"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
          </label>
          <label>
            تاریخ
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
      </Panel>}
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
        {onAdd && <button className="btn primary" onClick={()=>onAdd(year === 'all' ? current.year : year, month === 'all' ? current.month : month)}><Plus size={16}/> محاسبه معاش</button>}</>}/>
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
            {p.status!=='paid' && <>{onPaid && <button className="btn primary" onClick={()=>onPaid(p.id)}>ثبت پرداخت</button>}{onDelete && <button className="icon-btn small danger" title="حذف برگه" onClick={()=>onDelete(p.id)}><Trash2 size={15}/></button>}</>}
          </div></td>
        </tr>})}{!rows.length && <tr className="empty-data-row"><td className="empty-table-cell" colSpan={8}><EmptyState text={data.employees.length ? 'برای این دوره برگه معاش ثبت نشده است. روی «محاسبه معاش» بزنید.' : 'ابتدا کارمند ثبت کنید و معاش ماهانه او را وارد نمایید.'}/></td></tr>}</tbody>
      </table></div>
    </Panel>
    <p className="info-note">این نسخه صرف برای نمایش معاشات است. محاسبه کسورات مطابق قوانین افغانستان به‌صورت خودکار فعال نیست.</p>
  </>;
}
function AttendancePage({data,onMark,onMarkAll}) {
  const attendanceToday=afghanKabulToday();
  const [cy,cm,cd]=attendanceToday.split("/").map(Number);
  const current={year:cy,month:cm,day:cd};
  const [year,setYear]=useState(current.year);
  const [month,setMonth]=useState(current.month);
  const [day,setDay]=useState(current.day);
  const [unit,setUnit]=useState('all');
  const [notes,setNotes]=useState({});
  const [editCell,setEditCell]=useState(null);
  const days=attendanceDays(year,month);
  const selectedDay=Math.max(1,Math.min(day,days));
  const date=attendanceKey(year,month,selectedDay);
  const units=[...new Set(data.employees.map(e=>e.unit).filter(Boolean))];
  const employees=useMemo(()=>data.employees.filter(e=>unit==='all'||e.unit===unit),[data.employees,unit]);
  const attendanceByKey=useMemo(()=>new Map((data.attendance||[]).map(x=>[`${x.employeeId}|${x.date}`,x])),[data.attendance]);
  const mark=(employee,status)=>onMark?.(employee.id,date,status,notes[`${employee.id}|${date}`]??attendanceByKey.get(`${employee.id}|${date}`)?.notes??'');
  const overview=useMemo(()=>attendanceOverview(data.attendance,employees,year,month,attendanceToday),[data.attendance,employees,year,month,attendanceToday]);
  const monthlyByKey=useMemo(()=>new Map(overview.rows.map(x=>[`${x.employeeId}|${x.date}`,x])),[overview]);
  const openAttendanceCell=React.useCallback((employee,cellDate)=>{const original=attendanceByKey.get(`${employee.id}|${cellDate}`);const result=monthlyByKey.get(`${employee.id}|${cellDate}`);setEditCell({employee,date:cellDate,status:original?.status||result?.status||'',notes:original?.notes||''});},[attendanceByKey,monthlyByKey]);
  const totals=overview.totals;
  const options=[...ATTENDANCE_OPTIONS];
  const editable=!!onMark;
  const monthlyGrid=useMemo(()=>(<Panel title="نمای ماهانه حاضری">
      <div className="attendance-legend"><span className="present">حاضر</span><span className="late">تأخیر</span><span className="absent">غایب</span><span className="off">رخصتی / جمعه</span></div>
      <div className="table-scroll-hint" aria-hidden="true">برای دیدن روزهای دیگر، جدول را به چپ یا راست بکشید. علامت‌های کم‌رنگ به معنی پیش‌فرض اند.</div>
      <div className="table-wrap wide-data-table attendance-grid" tabIndex="0"><table><thead><tr><th>کارمند</th>{Array.from({length:days},(_,i)=><th key={i}>{number(i+1)}</th>)}</tr></thead><tbody>
        {employees.map(e=><tr key={e.id}><td>{e.firstName} {e.lastName}</td>{Array.from({length:days},(_,i)=>{
          const dateAtDay=attendanceKey(year,month,i+1);
          const result=monthlyByKey.get(`${e.id}|${dateAtDay}`)||{status:"",automatic:false};
          return <td key={i}><button type="button" className={`attendance-cell ${result.status||'unmarked'} ${result.automatic?'attendance-auto':''}`} title={`${e.firstName} — روز ${i+1}: ${ATTENDANCE_OPTIONS.find(x=>x.value===result.status)?.label||'ثبت نشده'}${result.automatic?' (خودکار)':''}`} onClick={()=>editable?openAttendanceCell(e,dateAtDay):setDay(i+1)} aria-label={`${e.firstName} — ${dateAtDay} — ${ATTENDANCE_OPTIONS.find(x=>x.value===result.status)?.label||"ثبت نشده"}`}>{result.status==='present'?'✓':result.status==='late'?'◷':result.status==='absent'?'×':result.status==='off'?'–':'·'}</button></td>;
        })}</tr>)}
        {!employees.length&&<tr><td colSpan={days+1}>کارمندی پیدا نشد.</td></tr>}
      </tbody></table></div>
    </Panel>),[employees,days,year,month,monthlyByKey,editable,openAttendanceCell]);
  return <>
    <PageHeading title="حاضری کارمندان" description="روزهای کاری به‌صورت پیش‌فرض حاضر و روز جمعه رخصتی عمومی نشان داده می‌شوند. مسئول حاضری باید غیابت و تأخیر را بررسی و اصلاح کند." actions={<>
      <button className="btn secondary" type="button" onClick={()=>downloadCsv('حاضری', [['date','تاریخ'],['employeeName','کارمند'],['statusLabel','وضعیت'],['sourceLabel','منبع ثبت'],['notes','توضیحات']], overview.rows.map(x=>({...x,statusLabel:ATTENDANCE_OPTIONS.find(v=>v.value===x.status)?.label||'',sourceLabel:x.automatic?'پیش‌فرض خودکار':'ثبت مسئول'})))}><Download size={16}/> CSV حاضری ماهانه</button>
      {onMarkAll&&employees.some(e=>monthlyByKey.get(`${e.id}|${date}`)?.status==='present'&&monthlyByKey.get(`${e.id}|${date}`)?.automatic)&&<button className="btn secondary" type="button" onClick={()=>{if(window.confirm(`حاضری پیش‌فرض روز ${date} تأیید شود؟ غیابت‌های ثبت‌شده تغییر نمی‌کنند.`))onMarkAll(employees.map(e=>e.id),date)}}><ClipboardCheck size={16}/> تأیید حاضرهای پیش‌فرض</button>}
    </>}/>
    <div className="filter-row attendance-controls"><label>سال هجری شمسی<select value={year} onChange={e=>setYear(Number(e.target.value))}>{[current.year-2,current.year-1,current.year,current.year+1].map(y=><option key={y} value={y}>{number(y)}</option>)}</select></label><label>ماه<select value={month} onChange={e=>{setMonth(Number(e.target.value));setDay(1)}}>{afghanMonths.map((m,i)=><option key={m} value={i+1}>{m}</option>)}</select></label><label>روز<select value={selectedDay} onChange={e=>setDay(Number(e.target.value))}>{Array.from({length:days},(_,i)=><option key={i} value={i+1}>{number(i+1)}</option>)}</select></label><label>واحد<select value={unit} onChange={e=>setUnit(e.target.value)}><option value="all">همه واحدها</option>{units.map(u=><option key={u} value={u}>{u}</option>)}</select></label></div>
    <div className="stats-grid four"><StatCard label="حاضر (شامل پیش‌فرض)" value={number(totals.present)} icon={BadgeCheck} tone="green"/><StatCard label="تأخیر" value={number(totals.late)} icon={Clock3} tone="amber"/><StatCard label="غایب" value={number(totals.absent)} icon={Users} tone="rose"/><StatCard label="رخصتی / جمعه" value={number(totals.off)} icon={CalendarDays} tone="blue"/></div>
    <Panel title={`ثبت حاضری — ${number(selectedDay)} ${afghanMonths[month-1]} ${number(year)}`}>
      {employees.length?<div className="attendance-entry-list">
        {employees.map(e=>{
          const recorded=attendanceByKey.get(`${e.id}|${date}`);
          const result=monthlyByKey.get(`${e.id}|${date}`)||{status:"",automatic:false};
          const isFriday=!recorded&&result.status==='off';
          return <div key={e.id} className="attendance-entry-row">
            <div className="attendance-employee"><strong>{e.firstName} {e.lastName}</strong><small>{e.position||'کارمند'} {e.unit?`— ${e.unit}`:''}</small><small className="attendance-assumption">{result.automatic?(isFriday?'جمعه — رخصتی عمومی':'پیش‌فرض خودکار؛ غیابت را مسئول اصلاح کند'):(recorded?'ثبت شده توسط مسئول':'هنوز روز کاری فرا نرسیده است')}</small></div>
            <select aria-label={`حاضری ${e.firstName}`} disabled={!onMark} value={recorded?.status||result.status||''} onChange={event=>mark(e,event.target.value)}>
              <option value="">ثبت نشده</option>{options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {onMark&&<input className="attendance-note" type="text" aria-label={`یادداشت حاضری ${e.firstName}`} placeholder="توضیح (اختیاری)" value={notes[`${e.id}|${date}`]??recorded?.notes??''} onChange={event=>setNotes(p=>({...p,[`${e.id}|${date}`]:event.target.value}))} onBlur={()=>{const key=`${e.id}|${date}`;if(result.status&&notes[key]!==undefined&&notes[key]!==recorded?.notes)onMark(e.id,date,result.status,notes[key]);}}/>}
          </div>;
        })}
      </div>:<EmptyState text="ابتدا کارمند ثبت کنید یا فلتر واحد را تغییر دهید."/>}
      {!onMark&&<p className="settings-muted-info">فقط مسئول مجاز می‌تواند وضعیت حاضری کارمندان را تغییر دهد.</p>}
    </Panel>
    {monthlyGrid}
    {editCell&&onMark&&<Modal title={`ثبت حاضری — ${editCell.employee.firstName||''} ${editCell.employee.lastName||''}`} onClose={()=>setEditCell(null)}><form className="attendance-cell-editor" onSubmit={event=>{event.preventDefault();if(onMark(editCell.employee.id,editCell.date,editCell.status,editCell.notes)!==false){setNotes(prev=>{const next={...prev};delete next[`${editCell.employee.id}|${editCell.date}`];return next;});setEditCell(null);}}}><p>{editCell.date}</p><div className="attendance-choice-grid">{ATTENDANCE_OPTIONS.map(option=><button key={option.value} type="button" className={`attendance-choice ${editCell.status===option.value?'selected':''}`} aria-pressed={editCell.status===option.value} onClick={()=>setEditCell(old=>({...old,status:option.value}))}>{option.label}</button>)}</div><label>توضیح (اختیاری)<textarea rows="2" maxLength="220" value={editCell.notes} onChange={event=>setEditCell(old=>({...old,notes:event.target.value}))}/></label><div className="modal-actions"><button type="button" className="btn secondary" onClick={()=>setEditCell(null)}>لغو</button><button type="button" className="btn secondary" onClick={()=>{if(onMark(editCell.employee.id,editCell.date,'','')!==false)setEditCell(null);}}>بازگشت به پیش‌فرض</button><button className="btn primary" disabled={!editCell.status}><Save size={15}/> ثبت حاضری</button></div></form></Modal>}
  </>;
}

// Plain-language report summaries for shopkeepers; detailed accounting remains in the table below.
function SimpleReportGuide({page,business,journals,balances,ledgerLines,rows}) {
  const general=page==='reports';
  const everyday=everydayReportSummary(business);
  const accounting=accountingReportSummary({page,journals,balances,ledgerLines});
  const help={
    reports:'در این بخش می‌بینید چه اندازه فروش شده، چقدر پول دریافت شده و چه اندازه نزد مشتریان باقی مانده است.',
    trialBalance:'این گزارش نشان می‌دهد جمع دو طرف ثبت‌های حسابداری برابر است یا نه. برای بررسی درست‌بودن ثبت‌ها استفاده می‌شود.',
    journalReport:'معاملات ثبت‌شده را به ترتیب روز ببینید؛ برای پیدا کردن یک معامله از تاریخ استفاده کنید.',
    ledgerReport:'ثبت‌های مربوط به هر سرفصل حساب را در یک جا ببینید؛ از فلتر «سرفصل حساب» استفاده کنید.',
    documentReport:'شماره، تاریخ و مبلغ اسناد حسابداری را در یک فهرست ببینید.'
  };
  const amounts=general ? [
    {label:'فروشات ثبت‌شده',value:everyday.sales,description:'مجموع بل‌های فروش، نقد و قرضه'},
    {label:'پول دریافت‌شده از فروش',value:everyday.received,description:'مبلغی که بابت بل‌های فروش پرداخت شده'},
    {label:'پول باقی‌مانده نزد مشتریان',value:everyday.receivable,description:'باقی بل‌های فروش که باید وصول شود'},
    {label:'خریداری‌های ثبت‌شده',value:everyday.purchases,description:'مجموع بل‌های خرید، نه فقط پول پرداختی'},
    {label:'مصارف و معاشات',value:everyday.runningCosts,description:'مصارف ثبت‌شده و معاشات پرداخت‌شده'}
  ] : [
    {label:page==='ledgerReport'?'تعداد سطرهای همین حساب':'تعداد اسناد',value:page==='ledgerReport'?accounting.lineCount:accounting.documentCount,count:true,description:page==='ledgerReport'?'مطابق سرفصل انتخاب‌شده':'در تاریخ و محدودهٔ انتخاب‌شده'},
    {label:'مجموع دیبیت',value:accounting.debit,description:'یک جانب ثبت حسابداری؛ لزوماً پول پرداختی نیست'},
    {label:'مجموع کریدیت',value:accounting.credit,description:'جانب دیگر ثبت حسابداری؛ لزوماً پول دریافتی نیست'}
  ];
  return <section className="report-simple" aria-label="خلاصه ساده گزارش">
    <div className="report-simple-heading">
      <h3>گزارش در یک نگاه</h3>
      <p>{help[page]||help.reports}</p>
    </div>
    <div className="report-simple-grid">
      {amounts.map(item=><div className="report-simple-tile" key={item.label}>
        <span>{item.label}</span>
        <strong dir="ltr">{item.count?number(item.value):money(item.value)}</strong>
        <small>{item.description}</small>
      </div>)}
    </div>
    {general ? <div className="report-simple-note">
      <div className="report-simple-note-header"><strong>از پول بل‌های فروش چقدر دریافت شده؟</strong><span>{everyday.paidPercent}٪ پرداخت شده</span></div>
      <div className="report-simple-track" role="progressbar" aria-label="فیصدی پول پرداخت‌شده بل‌های فروش" aria-valuemin={0} aria-valuemax={100} aria-valuenow={everyday.paidPercent}><div style={{width:`${everyday.paidPercent}%`}}/></div>
      <p>{everyday.paymentBase>0 ? `دریافت‌شده: ${money(everyday.received)} • باقی نزد مشتریان: ${money(everyday.receivable)}` : 'هنوز بل فروش ثبت نشده است.'}</p>
      <p>توجه: فروش قرضه به معنی دریافت پول نقد نیست. فلتر این گزارش بر اساس تاریخ بل است، نه تاریخ دریافت پول. خریداری نیز به‌تنهایی مفاد خالص را نشان نمی‌دهد.</p>
    </div> : <div className="report-simple-note">
      {page==='trialBalance' ? <p>{accounting.documentCount===0?'هنوز سندی در این محدوده موجود نیست.':accounting.balanced?'جمع دیبیت و کریدیت برابر است؛ اما این به‌تنهایی درستی همه معاملات را ثابت نمی‌کند.':`فرق دو طرف ${money(accounting.difference)} است؛ اسناد را بررسی کنید.`}</p> : <p>{rows.length?`${number(rows.length)} ریکارد در جدول پایین دیده می‌شود.`:'برای این فلتر هنوز ریکاردی پیدا نشد.'}</p>}
      <p><strong>راهنمای ساده:</strong> دیبیت و کریدیت دو طرف یک ثبت حسابداری اند؛ آن‌ها را با «پول داخل صندوق» و «پول خارج صندوق» اشتباه نگیرید.</p>
    </div>}
  </section>;
}

function ReportsPage({ page, data, openingCash=0 }) {
  const titles = {trialBalance:'تراز آزمایشی',journalReport:'گزارش روزنامه',ledgerReport:'گزارش کل',documentReport:'گزارش اسناد',reports:'گزارش عمومی'};
  const title = titles[page] || 'گزارش عمومی';
  const calendarMode=React.useContext(CalendarModeContext);
  const [filter, setFilter] = useState({from:'',to:'',min:'',max:''});
  const [applied, setApplied] = useState({from:'',to:'',min:'',max:''});
  const [error, setError] = useState('');
  const [accountFilter, setAccountFilter] = useState('all');
  const saveFilter = (e) => {
    e.preventDefault();
    if ((filter.from && !afghanDateOrder(filter.from)) || (filter.to && !afghanDateOrder(filter.to))) {
      setError(calendarMode==='gregorian'?'تاریخ میلادی انتخاب‌شده معتبر نیست.':'تاریخ را مانند 1405/08/21 یا ۲۱ عقرب ۱۴۰۵ وارد کنید.'); return;
    }
    if (filter.from && filter.to && afghanDateOrder(filter.from) > afghanDateOrder(filter.to)) {
      setError('تاریخ شروع بعد از تاریخ پایان است.'); return;
    }
    setError(''); setApplied({...filter});
  };
  const journals = buildAccountingJournal(data,openingCash).filter(j => isInAfghanRange(j.date, applied.from, applied.to) &&
    (!applied.min || Number(j.number) >= Number(applied.min)) && (!applied.max || Number(j.number) <= Number(applied.max)));
  const balances = journalBalances(journals).map(x => ({...x, debitBalance: Math.max(0,cash(x.debit-x.credit)), creditBalance: Math.max(0,cash(x.credit-x.debit))}));
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
    : page==='trialBalance' ? [['account','سرفصل حساب'],['debit','گردش دیبیت'],['credit','گردش کریدیت'],['debitBalance','مانده دیبیت'],['creditBalance','مانده کریدیت']]
    : page==='documentReport' ? [['number','شماره سند'],['date','تاریخ'],['name','نام سند'],['debit','دیبیت'],['credit','کریدیت']]
    : [['number','شماره سند'],['date','تاریخ'],['name','نام سند'],['account','سرفصل'],['description','شرح'],['debit','دیبیت'],['credit','کریدیت']];
  const rows = page==='reports' ? businessRows : page==='trialBalance' ? balances : page==='ledgerReport' ? ledgerLines : page==='documentReport' ? documentRows : journalLines;
  return <>
    <PageHeading title={title} description="گزارش‌های قابل جستجو از معلومات ثبت‌شده در همین مرورگر"
      actions={<><button className="btn secondary" onClick={()=>downloadCsv(title,columns,rows)}><Download size={15}/> خروجی CSV</button>
      <button className="btn secondary" onClick={()=>window.print()}><Printer size={15}/> چاپ گزارش</button></>}/>
    <Panel title="فلتر گزارش">
      <form className="report-filter" onSubmit={saveFilter}>
        <label>تاریخ شروع ({calendarMode==='gregorian'?'میلادی':'شمسی'})<AfghanDatePicker value={filter.from} onChange={date=>setFilter({...filter,from:date})}/></label>
        <label>تاریخ پایان ({calendarMode==='gregorian'?'میلادی':'شمسی'})<AfghanDatePicker value={filter.to} onChange={date=>setFilter({...filter,to:date})}/></label>
        {page==='ledgerReport' && <label>سرفصل حساب<select value={accountFilter} onChange={e=>setAccountFilter(e.target.value)}><option value="all">همه سرفصل‌ها</option>{ledgerAccounts.map(name=><option key={name}>{name}</option>)}</select></label>}
        {page!=='reports' && <><label>شماره شروع سند<input type="number" min="1" value={filter.min} onChange={e=>setFilter({...filter,min:e.target.value})} placeholder="از شماره"/></label>
          <label>شماره پایان سند<input type="number" min="1" value={filter.max} onChange={e=>setFilter({...filter,max:e.target.value})} placeholder="تا شماره"/></label></>}
        <button className="btn primary" type="submit"><Search size={15}/> نمایش گزارش</button>
        <button className="btn secondary" type="button" onClick={()=>{setFilter({from:'',to:'',min:'',max:''});setApplied({from:'',to:'',min:'',max:''});setError('');setAccountFilter('all')}}>پاک کردن فلتر</button>
      </form>
      {error && <p className="form-error" role="alert">{error}</p>}
    </Panel>
    <SimpleReportGuide page={page} business={business} journals={journals} balances={balances} ledgerLines={ledgerLines} rows={rows}/>
    <Panel title={title} action={<span className="muted-pill">{number(rows.length)} ریکارد</span>}>
      <DataTable columns={columns} rows={rows} empty="در محدودهٔ انتخاب‌شده معلوماتی موجود نیست."/>
    </Panel>
    <p className="info-note">{page==='reports' ? 'این گزارش جمع‌بندی سادهٔ بل‌ها، مصارف و معاشات پرداخت‌شده است و محاسبهٔ مفاد خالص یا صورت مالی حسابرسی‌شده نیست.' :
      'این گزارش از بل‌ها، دریافت‌ها، پرداخت‌ها، معاشات، مصارف، محموله‌ها، حرکات صندوق و اسناد دستی ساخته می‌شود؛ قیمت موجودی و مفاد تخمینی است و برای حسابرسی رسمی نیاز به تأیید دارد.'}</p>
  </>;
}
function AccessDenied({onBack}) {
  return <Panel title="دسترسی محدود">
    <div className="role-access-denied" role="alert">
      <LockKeyhole size={30}/>
      <h3>شما به این بخش دسترسی ندارید</h3>
      <p>برای مشاهده یا تغییر معلومات این بخش، با مدیر سیستم صحبت کنید.</p>
      <button type="button" className="btn secondary" onClick={onBack}>بازگشت به بخش‌های مجاز</button>
    </div>
  </Panel>;
}

function RolesPage({access,employees, demoLoginEnabled,onActivateDemoLogin,onIssueRecovery,onSaveRole,onDeleteRole,onSaveUser,onDeleteUser,onPreviewUser}) {
  const [tab,setTab]=useState('users');
  const [roleDraft,setRoleDraft]=useState({id:'',name:'',permissions:[]});
  const emptyUser=()=>({id:'',employeeId:'',name:'',title:'',roleId:access.roles.find(r=>r.id!=='admin')?.id || 'seller',username:'',password:'',confirmPassword:'',active:true,...normalizeScheduleFields()});
  const [userDraft,setUserDraft]=useState(emptyUser);
  const [adminDraft,setAdminDraft]=useState({username:access.users.find(u=>u.system)?.username||'admin',password:'',confirmPassword:''});
  const [showAdminReset,setShowAdminReset]=useState(false);
  const [editingRole,setEditingRole]=useState(false);
  const [editingUser,setEditingUser]=useState(false);
  const [working,setWorking]=useState(false);
  const [formError,setFormError]=useState('');
  const [recoveryShown,setRecoveryShown]=useState(null);
  const roleById=id=>access.roles.find(r=>r.id===id);
  const [localClock,setLocalClock]=useState(()=>Date.now());
  useEffect(()=>{const refresh=()=>setLocalClock(Date.now());const h=setInterval(refresh,10000);return ()=>clearInterval(h);},[]);
  const nowAfghanistan=new Date(localClock);
  const issueCode=async userId=>{
    setWorking(true); const result=await onIssueRecovery(userId);setWorking(false);
    if(result) setRecoveryShown(result);
  };
  const recoveryPanel=recoveryShown && <div className="recovery-code-panel" role="status">
    <strong>کد بازیابی حساب: <span dir="ltr">{recoveryShown.username}</span></strong>
    <code dir="ltr">{recoveryShown.code}</code>
    <small>این کد فقط یک‌بار نمایش داده می‌شود. آن را خصوصی به کارمند بدهید. تا {new Date(recoveryShown.expires).toLocaleString('fa-AF')} معتبر است.</small>
    <div className="role-item-actions"><button type="button" className="btn secondary" onClick={()=>navigator.clipboard?.writeText(recoveryShown.code)}><ClipboardList size={16}/> کاپی کد</button><button type="button" className="btn secondary" onClick={()=>setRecoveryShown(null)}>پنهان کردن کد</button></div>
  </div>;
  const startRole=role=>{setTab('roles');setFormError('');setRoleDraft(role?{id:role.id,name:role.name,permissions:[...role.permissions]}:{id:'',name:'',permissions:[]});setEditingRole(true);};
  const startUser=user=>{setTab('users');setFormError('');setUserDraft(user?{id:user.id,employeeId:user.employeeId||'',name:user.name,title:user.title||'',roleId:user.roleId,username:user.username||'',password:'',confirmPassword:'',active:user.active!==false,...normalizeScheduleFields(user)}:emptyUser());setEditingUser(true);};
  const chooseEmployee=id=>{
    const employee=employees.find(e=>String(e.id)===String(id));
    const used=new Set(access.users.filter(u=>u.id!==userDraft.id).map(u=>normalizeUsername(u.username)));
    let proposed=employee ? proposeUsername(employee):'';
    if(used.has(proposed)) {let n=2;while(used.has(`${proposed}-${n}`)) n++;proposed=`${proposed}-${n}`;}
    setUserDraft(prev=>({...prev,employeeId:String(id),name:employee?[employee.firstName,employee.lastName].filter(Boolean).join(' ').trim():'',title:employee?.position||'',username:prev.id?prev.username:proposed}));
  };
  const togglePermission=key=>setRoleDraft(prev=>({...prev,permissions:prev.permissions.includes(key)?prev.permissions.filter(p=>p!==key):[...prev.permissions,key]}));
  const submitRole=e=>{
    e.preventDefault();setFormError('');
    const name=roleDraft.name.trim();
    if(!name){setFormError('نام نقش ضروری است.');return;}
    if(access.roles.some(r=>r.name===name && r.id!==roleDraft.id)){setFormError('نام نقش تکراری است.');return;}
    if(onSaveRole({...roleDraft,name})){setEditingRole(false);setRoleDraft({id:'',name:'',permissions:[]});}
  };
  const submitUser=async e=>{
    e.preventDefault();setFormError('');
    const employee=employees.find(e=>String(e.id)===String(userDraft.employeeId));
    if(!employee){setFormError('اول کارمند را انتخاب کنید. اگر کارمند موجود نیست، در بخش کارمندان او را اضافه کنید.');return;}
    if(access.users.some(u=>u.id!==userDraft.id && String(u.employeeId||'')===String(userDraft.employeeId))){setFormError('این کارمند حساب کاربری دارد.');return;}
    if(!validUsername(userDraft.username)){setFormError('نام کاربری باید ۳ تا ۳۲ حرف انگلیسی یا عدد داشته باشد.');return;}
    if(!roleById(userDraft.roleId)){setFormError('نقش معتبر انتخاب کنید.');return;}
    if(!validShiftTime(userDraft.shiftStart)||!validShiftTime(userDraft.shiftEnd)||userDraft.shiftStart===userDraft.shiftEnd){setFormError('ساعت آغاز و ختم شیفت متفاوت و معتبر باشد.');return;}
    if(userDraft.extraUntil && !validAfghanDateTime(userDraft.extraUntil)){setFormError('تاریخ و ساعت دسترسی اضافی معتبر نیست.');return;}
    if(!userDraft.id && !userDraft.password){setFormError('برای حساب جدید رمز موقت تعیین کنید.');return;}
    if(userDraft.password && userDraft.password.length<8){setFormError('رمز حداقل ۸ حرف یا عدد داشته باشد.');return;}
    if(userDraft.password!==userDraft.confirmPassword){setFormError('تکرار رمز با رمز مطابقت ندارد.');return;}
    setWorking(true);
    const ok=await onSaveUser({...userDraft,name:[employee.firstName,employee.lastName].filter(Boolean).join(' ').trim(),title:employee.position||''},userDraft.password);
    setWorking(false);
    if(ok){setEditingUser(false);setUserDraft(emptyUser());}
    else setFormError('ذخیره انجام نشد؛ نام کاربری تکراری و معلومات را بررسی کنید.');
  };
  const submitAdmin=async e=>{
    e.preventDefault();setFormError('');
    if(!validUsername(adminDraft.username)){setFormError('نام کاربری مدیر باید ۳ تا ۳۲ حرف انگلیسی یا عدد باشد.');return;}
    if(adminDraft.password.length<8){setFormError('رمز مدیر حداقل ۸ حرف داشته باشد.');return;}
    if(adminDraft.password!==adminDraft.confirmPassword){setFormError('رمزها یکسان نیستند.');return;}
    setWorking(true);
    const result=await onActivateDemoLogin(adminDraft.username,adminDraft.password);
    setWorking(false);
    if(result?.ok){
      setAdminDraft(p=>({...p,password:'',confirmPassword:''}));setShowAdminReset(false);
      setRecoveryShown({username:adminDraft.username,code:result.recoveryCode,expires:Date.now()+365*86400000});
    }
    else setFormError('تنظیم ورود انجام نشد؛ نام کاربری یا رمز را بررسی کنید.');
  };
  const linkedUserId=employeeId=>access.users.find(u=>String(u.employeeId||'')===String(employeeId))?.id;
  return <>
    <PageHeading title="نقش‌ها و صلاحیت‌ها" description="برای کارمندان حساب ورود بسازید و صلاحیت هر نقش را تعیین کنید."/>
    <div className="info-note" role="status"><Clock3 size={16}/> وقت فعلی افغانستان: <strong dir="ltr">{kabulLocalDateTime(nowAfghanistan).replace('T',' ')}</strong> — شیفت‌ها به همین وقت بررسی می‌شوند. <strong>حساب مدیر اصلی محدودیت ساعت ندارد.</strong> برای آزمایش واقعی از حساب کارمند وارد شوید؛ پیش‌نمایش کارمند نیز اکنون ساعت کاری را بررسی می‌کند.</div>
    <div className="role-tabs" role="tablist" aria-label="مدیریت کاربران و نقش‌ها">
      <button type="button" role="tab" aria-selected={tab==='users'} className={`btn ${tab==='users'?'primary':'secondary'}`} onClick={()=>{setTab('users');setEditingRole(false);setFormError('')}}><Users size={16}/> کاربران ({number(access.users.length)})</button>
      <button type="button" role="tab" aria-selected={tab==='roles'} className={`btn ${tab==='roles'?'primary':'secondary'}`} onClick={()=>{setTab('roles');setEditingUser(false);setFormError('')}}><ShieldCheck size={16}/> نقش‌ها ({number(access.roles.length)})</button>
    </div>
    {tab==='roles' && <>
      <Panel title="فهرست نقش‌ها" action={<button type="button" className="btn primary" onClick={()=>startRole(null)}><Plus size={16}/> ایجاد نقش</button>}>
        <div className="role-list">{access.roles.map(role=><div className="role-list-item" key={role.id}>
          <div className="role-item-main"><span className="role-item-icon"><ShieldCheck size={21}/></span><div><strong>{role.name}</strong><small>{role.system?'نقش اصلی سیستم — قابل حذف نیست':`${number(role.permissions.length)} صلاحیت • ${number(access.users.filter(u=>u.roleId===role.id).length)} کاربر`}</small></div></div>
          <div className="role-item-actions">{!role.system && <><button type="button" className="btn secondary" onClick={()=>startRole(role)}><Pencil size={15}/> ویرایش</button><button type="button" className="btn secondary danger-text" onClick={()=>{if(window.confirm(`نقش «${role.name}» حذف شود؟`)) onDeleteRole(role.id)}}><Trash2 size={15}/> حذف</button></>}</div>
        </div>)}</div>
      </Panel>
      {editingRole && <Panel title={roleDraft.id?'ویرایش نقش':'ایجاد نقش جدید'}>
        <form onSubmit={submitRole} className="roles-editor-form">
          <label>نام نقش<input value={roleDraft.name} maxLength={60} required placeholder="مثلاً: مسئول فروشات" onChange={e=>setRoleDraft({...roleDraft,name:e.target.value})}/></label>
          <div className="roles-editor-heading"><strong>تعیین صلاحیت‌ها</strong><div className="role-item-actions"><button type="button" className="btn secondary" onClick={()=>setRoleDraft({...roleDraft,permissions:PERMISSION_GROUPS.flatMap(g=>g.permissions.map(([k])=>k))})}>انتخاب همه</button><button type="button" className="btn secondary" onClick={()=>setRoleDraft({...roleDraft,permissions:[]})}>پاک کردن</button></div></div>
          <div className="role-permission-grid">{PERMISSION_GROUPS.map(group=><fieldset className="role-permission-group" key={group.name}><legend>{group.name}</legend>{group.permissions.map(([key,label])=><label key={key} className="role-permission-item"><input type="checkbox" checked={roleDraft.permissions.includes(key)} onChange={()=>togglePermission(key)}/><span>{label}</span></label>)}</fieldset>)}</div>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <div className="role-item-actions"><button type="submit" className="btn primary"><Save size={17}/> ذخیره نقش</button><button type="button" className="btn secondary" onClick={()=>{setEditingRole(false);setFormError('')}}>لغو</button></div>
        </form>
      </Panel>}
    </>}
    {tab==='users' && <>
      {recoveryPanel}
      {(!demoLoginEnabled || showAdminReset) && <Panel title={demoLoginEnabled?'تغییر رمز مدیر':'تنظیم حساب مدیر'}>
        <form className="business-settings-form role-user-form" onSubmit={submitAdmin} autoComplete="off">
          <label>نام کاربری مدیر<input required dir="ltr" value={adminDraft.username} onChange={e=>setAdminDraft({...adminDraft,username:e.target.value})} placeholder="admin"/></label>
          <label>رمز مدیر (حداقل ۸ حرف)<input required type="password" minLength={8} autoComplete="new-password" value={adminDraft.password} onChange={e=>setAdminDraft({...adminDraft,password:e.target.value})}/></label>
          <label>تکرار رمز<input required type="password" minLength={8} autoComplete="new-password" value={adminDraft.confirmPassword} onChange={e=>setAdminDraft({...adminDraft,confirmPassword:e.target.value})}/></label>
          {formError && <p role="alert" className="form-error">{formError}</p>}
          <div className="role-item-actions"><button disabled={working} className="btn primary" type="submit"><LockKeyhole size={17}/> ذخیره رمز مدیر</button></div>
        </form>
      </Panel>}
      {demoLoginEnabled && <div className="info-note">برای ورود با حساب کارمند، ابتدا از حساب مدیر خارج شوید. نام کاربری مدیر: <strong dir="ltr">{access.users.find(u=>u.system)?.username}</strong> <button type="button" className="btn secondary" onClick={()=>{setShowAdminReset(v=>!v);setFormError('')}}>تغییر رمز مدیر</button></div>}
      <Panel title="کاربران و نقش‌های آن‌ها" action={<button type="button" className="btn primary" onClick={()=>startUser(null)}><UserPlus size={16}/> افزودن کاربر</button>}>
        <div className="role-list">{access.users.map(user=><div className="role-list-item" key={user.id}>
          <div className="role-item-main"><span className="role-user-avatar">{user.name.trim().charAt(0)||'ک'}</span><div><strong>{user.name}</strong><small>{user.title||'بدون عنوان'} • {roleById(user.roleId)?.name||'نقش نامشخص'}</small><small>نام کاربری: <b dir="ltr">{user.username||'تعیین نشده'}</b> • {user.passwordHash?'رمز تنظیم شده':'بدون رمز'} • {user.active===false?'غیرفعال':'فعال'}</small>{!user.system && <><small>شیفت {normalizeScheduleFields(user).shiftStart} تا {normalizeScheduleFields(user).shiftEnd} (وقت افغانستان){normalizeScheduleFields(user).extraUntil?` • اجازهٔ اضافی تا ${normalizeScheduleFields(user).extraUntil.replace('T',' ')}`:''}</small><small className={employeeAccess(user,nowAfghanistan).allowed?'shift-current-open':'shift-current-closed'}>{employeeAccess(user,nowAfghanistan).allowed?'● اکنون اجازهٔ ورود دارد':'● اکنون ورود بسته است'}{normalizeScheduleFields(user).extraUntil && employeeAccess(user,nowAfghanistan).allowed && !employeeAccess({...user,extraUntil:''},nowAfghanistan).allowed?' (با اجازهٔ اضافی)':''}</small></>}</div></div>
          <div className="role-item-actions">{!user.system && <><button type="button" className="btn secondary" onClick={()=>onPreviewUser(user.id)}><Eye size={15}/> آزمایش صلاحیت</button><button type="button" className="btn secondary" onClick={()=>startUser(user)}><Pencil size={15}/> ویرایش / تنظیم رمز</button></>}
          {demoLoginEnabled && <button type="button" className="btn secondary" disabled={working} onClick={()=>issueCode(user.id)}><KeyRound size={15}/> ساخت کد بازیابی</button>}
          {!user.system && <button type="button" className="btn secondary danger-text" onClick={()=>{if(window.confirm(`کاربر «${user.name}» حذف شود؟`)) onDeleteUser(user.id)}}><Trash2 size={15}/> حذف</button>}
          {user.system && <span className="muted-pill">مدیر اصلی</span>}</div>
        </div>)}</div>
      </Panel>
      {editingUser && <Panel title={userDraft.id?'ویرایش حساب کارمند':'افزودن کاربر برای کارمند'}>
        <form className="business-settings-form role-user-form" onSubmit={submitUser} autoComplete="off">
          <label>انتخاب کارمند از فهرست کارمندان<select required value={userDraft.employeeId} onChange={e=>chooseEmployee(e.target.value)}><option value="">— کارمند را انتخاب کنید —</option>{employees.filter(employee=>!linkedUserId(employee.id)||linkedUserId(employee.id)===userDraft.id).map(employee=><option value={employee.id} key={employee.id}>{[employee.firstName,employee.lastName].filter(Boolean).join(' ')} — {employee.employeeCode||employee.position||'بدون کد'}</option>)}</select></label>
          {!employees.length && <p className="form-error">هیچ کارمندی ثبت نشده است. نخست از منوی «منابع بشری ← کارمندان» کارمند اضافه کنید.</p>}
          <div className="linked-employee-preview"><UserRoundCheck size={17}/><span>{userDraft.name||'نام کارمند پس از انتخاب نمایش داده می‌شود'}{userDraft.title?` — ${userDraft.title}`:''}</span></div>
          <label>نام کاربری برای ورود (حروف انگلیسی)<input required dir="ltr" autoComplete="off" minLength={3} maxLength={32} value={userDraft.username} onChange={e=>setUserDraft({...userDraft,username:e.target.value.toLowerCase()})} placeholder="ahmad01"/></label>
          <label>نقش کاربر<select value={userDraft.roleId} onChange={e=>setUserDraft({...userDraft,roleId:e.target.value})}>{access.roles.map(r=><option value={r.id} key={r.id}>{r.name}</option>)}</select></label>
          <label>رمز موقت {userDraft.id?'(فقط برای تغییر رمز)':'(ضروری)'}
            <div className="demo-password-row"><input type="text" autoComplete="off" minLength={8} value={userDraft.password} onChange={e=>setUserDraft({...userDraft,password:e.target.value})} placeholder="رمز موقت را بسازید"/><button type="button" className="btn secondary" onClick={()=>{const password=makeTemporaryPassword();setUserDraft({...userDraft,password,confirmPassword:password})}}><LockKeyhole size={15}/> ساخت رمز</button></div>
          </label>
          {userDraft.password && <label>تکرار رمز موقت<input type="text" value={userDraft.confirmPassword} onChange={e=>setUserDraft({...userDraft,confirmPassword:e.target.value})}/></label>}
          {userDraft.password && <button type="button" className="btn secondary demo-copy-btn" onClick={()=>navigator.clipboard?.writeText(`نام کاربری: ${userDraft.username}\nرمز موقت: ${userDraft.password}`)}><ClipboardList size={16}/> کاپی معلومات ورود (فقط برای فرستادن خصوصی)</button>}
          <div className="work-schedule-panel">
            <h4><Clock3 size={17}/> محدودیت ساعت کاری — به وقت افغانستان</h4>
            <div className="schedule-grid">
              <label>شروع شیفت<input type="time" required value={userDraft.shiftStart} onChange={e=>setUserDraft(prev=>({...prev,shiftStart:e.target.value,extraUntil:''}))}/></label>
              <label>ختم شیفت<input type="time" required value={userDraft.shiftEnd} onChange={e=>setUserDraft(prev=>({...prev,shiftEnd:e.target.value,extraUntil:''}))}/></label>
            </div>
            <small>به‌گونهٔ پیش‌فرض کارمند از ساعت ۰۸:۰۰ تا ۲۰:۰۰ وارد می‌شود. مدیر سیستم همیشه دسترسی دارد. با تغییر ساعت شیفت، اجازهٔ اضافی قبلی پاک می‌شود تا اشتباهاً کارمند پس از شیفت وارد نشود.</small>
            <label>اجازهٔ اضافی تا تاریخ و ساعت مشخص (وقت افغانستان)
              <input type="datetime-local" dir="ltr" value={userDraft.extraUntil||''} onChange={e=>setUserDraft({...userDraft,extraUntil:e.target.value})}/>
            </label>
            <div className="role-item-actions">
              <button type="button" className="btn secondary" onClick={()=>setUserDraft({...userDraft,extraUntil:`${kabulLocalDateTime().slice(0,10)}T23:59`})}>اجازه برای امشب تا ۱۱:۵۹</button>
              <button type="button" className="btn secondary" onClick={()=>setUserDraft({...userDraft,extraUntil:''})}>لغو اجازهٔ اضافی</button>
            </div>
            <div className="shift-live-preview" role="status">
              <Clock3 size={16}/><span>نتیجهٔ همین حالا به وقت افغانستان: <strong>{employeeAccess({...userDraft,system:false},nowAfghanistan).allowed?'اجازهٔ ورود دارد':'ورود پس از شیفت بسته است'}</strong></span>
            </div>
            <small>اگر می‌خواهید کارمند خارج از شیفت دسترسی داشته باشد، باید عمداً «اجازهٔ اضافی» را تنظیم کنید. بعد از ختم ساعت، صفحه بسته می‌شود.</small>
          </div>
          <label className="demo-active-checkbox"><input type="checkbox" checked={userDraft.active} onChange={e=>setUserDraft({...userDraft,active:e.target.checked})}/> حساب کارمند فعال باشد</label>
          {formError && <p className="form-error" role="alert">{formError}</p>}
          <p className="info-note">رمز موقت را فقط به خود کارمند بدهید. پس از اولین ورود باید رمز را تغییر دهد. برای ورود واقعی در موبایل یا کمپیوتر دیگر، سرور ضروری است.</p>
          <div className="role-item-actions"><button disabled={working||!employees.length} type="submit" className="btn primary"><Save size={17}/> ذخیره حساب کارمند</button><button type="button" className="btn secondary" onClick={()=>{setEditingUser(false);setFormError('')}}>لغو</button></div>
        </form>
      </Panel>}
    </>}
    <p className="info-note">نقش‌ها فقط در رابط نمایشی محدودیت ایجاد می‌کنند. تا زمان افزودن سرور، این ورود برای کارمندان واقعی یا معلومات حساس قابل استفاده نیست.</p>
  </>;
}

function QuickSearchBox({search,onSearch,results,onSelect,open,setOpen,mobile=false}) {
  return <div className={`header-search-wrap ${mobile?'mobile-search-wrapper':''}`} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget)) setOpen(false)}}>
    <label className={mobile?'mobile-search-input':'top-search'}>
      <Search size={18} aria-hidden="true"/>
      <input value={search} autoComplete="off" onFocus={()=>setOpen(true)} onChange={e=>{onSearch(e.target.value);setOpen(true)}}
        onKeyDown={e=>{if(e.key==='Escape')setOpen(false);if(e.key==='Enter'&&results[0]){e.preventDefault();onSelect(results[0]);}}}
        placeholder="جستجوی مشتری، جنس، بل، کارمند..." aria-label="جستجوی عمومی برنامه"/>
      {search && <button type="button" className="search-clear" title="پاک کردن جستجو" aria-label="پاک کردن جستجو" onClick={()=>{onSearch('');setOpen(false)}}><X size={15}/></button>}
    </label>
    {open && search.trim().length>=2 && <div className="header-search-results" role="listbox" aria-label="نتایج جستجو">
      <div className="search-results-heading">نتایج جستجوی عمومی <small>{number(results.length)} نتیجه</small></div>
      {results.length ? results.map((item,index)=><button key={`${item.page}-${index}`} type="button" role="option" aria-selected="false" onClick={()=>onSelect(item)}>
        <span className="result-title">{item.label}</span><small>{item.caption}</small><ChevronLeft size={16}/>
      </button>) : <p className="header-search-empty">چیزی پیدا نشد. نام مشتری، محصول، نمبر بل یا نام کارمند را امتحان کنید.</p>}
    </div>}
  </div>;
}
function AfghanHeaderCalendar({data,todayLabel,canView,onNavigate,onClose}) {
  const calendarMode=React.useContext(CalendarModeContext);
  const parts=dateChoiceParts(today)||{year:1405,month:1,day:1};
  const [display,setDisplay]=useState({year:parts.year,month:parts.month});
  const [selected,setSelected]=useState(buildAfghanDate(parts));
  const move=amount=>setDisplay(prev=>{
    const absolute=prev.year*12+prev.month-1+amount;
    return {year:Math.floor(absolute/12),month:(absolute%12+12)%12+1};
  });
  const days=Array.from({length:31},(_,i)=>i+1).filter(day=>afghanDateDayNumber(buildAfghanDate({...display,day}))!==null);
  const transactions=transactionsForDay(data,selected).filter(item=>canView(item.page));
  const dateParts=dateChoiceParts(selected);
  if(calendarMode==='gregorian')return <div className="header-calendar-popover" role="dialog" aria-label="تقویم میلادی">
    <div className="calendar-popover-title"><strong>تقویم میلادی</strong><button className="calendar-close" type="button" onClick={onClose} aria-label="بستن تقویم"><X size={17}/></button></div>
    <input className="gregorian-date-picker" type="date" value={gregorianFromAfghan(selected)} onChange={e=>setSelected(afghanFromGregorian(e.target.value))} aria-label="انتخاب تاریخ میلادی"/>
    <button type="button" className="calendar-today" onClick={()=>setSelected(buildAfghanDate(parts))}>امروز: {formatCalendarDate(today,'gregorian')}</button>
    <div className="calendar-transactions"><strong>فعالیت‌های {formatCalendarDate(selected,'gregorian')}</strong>
      {transactions.length?transactions.slice(0,8).map((x,i)=><button key={i} type="button" onClick={()=>{onNavigate(x.page,x.label);onClose();}}><span>{x.label}</span><small>{x.kind} {x.amount?money(x.amount):''}</small></button>):<p>برای این تاریخ معامله‌ای ثبت نشده است.</p>}
    </div>
  </div>;
  return <div className="header-calendar-popover" role="dialog" aria-label="تقویم و فعالیت‌ها">
    <div className="calendar-popover-title"><strong>تقویم افغانستان</strong><button type="button" className="calendar-close" aria-label="بستن تقویم" onClick={onClose}><X size={17}/></button></div>
    <div className="calendar-navigation">
      <button type="button" onClick={()=>move(-1)} aria-label="ماه گذشته"><ChevronRight size={19}/></button>
      <strong>{afghanMonths[display.month-1]} {number(display.year)}</strong>
      <button type="button" onClick={()=>move(1)} aria-label="ماه آینده"><ChevronLeft size={19}/></button>
    </div>
    <div className="calendar-days">{days.map(day=><button key={day} type="button" aria-pressed={dateParts?.year===display.year && dateParts?.month===display.month && dateParts?.day===day} className={dateParts?.year===display.year&&dateParts?.month===display.month&&dateParts?.day===day?'selected':''} onClick={()=>setSelected(buildAfghanDate({...display,day}))}>{number(day)}</button>)}</div>
    <button type="button" className="calendar-today" onClick={()=>{setDisplay({year:parts.year,month:parts.month});setSelected(buildAfghanDate(parts))}}>امروز: {todayLabel}</button>
    <div className="calendar-transactions"><strong>فعالیت‌های {dateParts?`${number(dateParts.day)} ${afghanMonths[dateParts.month-1]} ${number(dateParts.year)}`:selected}</strong>
      {transactions.length ? transactions.slice(0,8).map((x,i)=><button type="button" key={i} onClick={()=>onNavigate(x.page,x.label)}><span>{x.label}</span><small>{x.kind}{x.amount?` • ${money(x.amount)}`:''}</small></button>) : <p>در این تاریخ فروش، خرید یا سند ثبت نشده است.</p>}
    </div>
    <small className="calendar-local-info">تاریخ هجری شمسی — معلومات از همین مرورگر خوانده می‌شود.</small>
  </div>;
}

function BusinessLogoPicker({logo,shopName,onChange,disabled=false,onBusyChange,inputId,label="لوگو یا عکس عمده‌فروشی (اختیاری)",help="عکس JPG، PNG یا WebP؛ حداکثر ۵ MB. عکس برای منو کوچک و فشرده می‌شود.",printLogo=false}) {
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const upload=async event=>{
    const file=event.target.files?.[0];
    event.target.value='';
    if(!file)return;
    setError('');setBusy(true);onBusyChange?.(true);
    try {onChange(await readBusinessLogo(file));}
    catch(err) {setError(err?.message || 'بارگذاری عکس انجام نشد.');}
    finally {setBusy(false);onBusyChange?.(false);}
  };
  return <div className="business-logo-picker">
    <div className="business-logo-preview" aria-hidden="true">
      {logo ? <img src={logo} alt="" /> : printLogo ? <small>بدون عکس</small> : <span>{shopName.trim().charAt(0)||'ع'}</span>}
    </div>
    <div className="business-logo-picker-controls">
      <label htmlFor={inputId}>{label}</label>
      <input id={inputId} type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||disabled} onChange={upload}/>
      <small>{busy?'در حال آماده‌سازی عکس...':help}</small>
      {logo && !disabled && <button className="btn secondary business-logo-remove" type="button" disabled={busy} onClick={()=>{setError('');onChange('');}}>حذف عکس</button>}
      {error && <p className="form-error" role="alert">{error}</p>}
    </div>
  </div>;
}

function DemoFirstSetup({shopName,onSetup,setupResult,onContinue}) {
  const [businessName,setBusinessName]=useState('');
  const [shopLogo,setShopLogo]=useState('');
  const [logoBusy,setLogoBusy]=useState(false);
  const [openingCash,setOpeningCash]=useState('0');
  const [setupAppearance,setSetupAppearance]=useState(normalizeAppearance());
  const [adminName,setAdminName]=useState('');
  const [username,setUsername]=useState('admin');
  const [password,setPassword]=useState('');
  const [confirm,setConfirm]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const submit=async event=>{
    event.preventDefault();setMessage('');
    if(logoBusy){setMessage('لطفاً منتظر آماده‌شدن عکس بمانید.');return;}
    const first=validateFirstSetup({shopName:businessName,adminName,username,password,confirmPassword:confirm});
    if(!first.ok){setMessage(first.message);return;}
    setBusy(true);
    try {
      if(!Number.isFinite(Number(openingCash))||Number(openingCash)<0){setMessage('موجودی آغازین صندوق معتبر نیست.');setBusy(false);return;}
      const result=await onSetup(first.username,password,{...first.profile,shopLogo,openingCash:Number(openingCash),appearance:setupAppearance});
      if(!result?.ok)setMessage(result?.message||'ساخت حساب مدیر انجام نشد.');
    } catch {setMessage('ساخت حساب مدیر انجام نشد.');}
    finally {setBusy(false);}
  };
  return <div className="demo-login-page" dir="rtl"><div className="demo-login-card fresh-start-card">
    <div className="demo-login-icon"><ShieldCheck size={27}/></div>
    <div className="demo-login-brow">راه‌اندازی عمده‌فروشی</div>
    {setupResult ? <>
      <div className="setup-steps"><span className="step-done">۱. ساخت حساب</span><span className="step-active">۲. کد بازیابی</span><span>۳. ورود</span></div>
      <h1>حساب مدیر ساخته شد</h1>
      <p>کد بازیابی را در جای محفوظ یادداشت کنید. اگر رمز را فراموش کردید، با همین کد می‌توانید رمز تازه بسازید.</p>
      <div className="recovery-code-panel"><strong>نام کاربری: <span dir="ltr">{setupResult.username}</span></strong><code dir="ltr">{setupResult.recoveryCode}</code><button type="button" className="btn secondary" onClick={()=>navigator.clipboard?.writeText(setupResult.recoveryCode)}><ClipboardList size={16}/> کاپی کد بازیابی</button></div>
      <button className="btn primary login-back-button" type="button" onClick={onContinue}><LogOut size={17}/> رفتن به صفحه ورود</button>
    </> : <>
      <div className="setup-steps"><span className="step-active">۱. ساخت حساب</span><span>۲. کد بازیابی</span><span>۳. ورود</span></div>
      <h1>ساخت عمده‌فروشی جدید</h1>
      <p>ابتدا نام عمده‌فروشی و حساب مدیر سیستم را بسازید. برنامه با ریکاردهای خالی آغاز می‌شود.</p>
      <form className="demo-login-form" onSubmit={submit}>
        <label>نام عمده‌فروشی<input autoFocus required maxLength={90} value={businessName} onChange={e=>setBusinessName(e.target.value)} placeholder="مثلاً: عمده‌فروشی کابل"/></label>
        <BusinessLogoPicker inputId="new-business-logo" logo={shopLogo} shopName={businessName} onChange={setShopLogo} onBusyChange={setLogoBusy}/>
        <label>پول آغازین صندوق نقدی (افغانی)<GroupedNumberInput  min="0" step="0.01" inputMode="decimal" value={openingCash} onChange={e=>setOpeningCash(e.target.value)} required/><small>پول نقدی که در آغاز فعالیت داخل صندوق دارید؛ برای شروع از صفر، ۰ وارد کنید.</small></label>
        <ThemeSettingsControls value={setupAppearance} onChange={setSetupAppearance} compact/>
        <label>نام و تخلص مدیر<input required maxLength={80} value={adminName} onChange={e=>setAdminName(e.target.value)} placeholder="نام مدیر سیستم"/></label>
        <label>نام کاربری مدیر<input dir="ltr" required value={username} onChange={e=>setUsername(e.target.value.toLowerCase())} autoComplete="username"/></label>
        <label>رمز مدیر<div className="login-password-control"><input dir="ltr" required type={showPassword?'text':'password'} minLength={8} autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="حداقل ۸ حرف یا عدد"/><button className="password-eye" type="button" onClick={()=>setShowPassword(x=>!x)} aria-label={showPassword?'پنهان کردن رمز':'نمایش رمز'}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
        <label>تکرار رمز<input dir="ltr" required type={showPassword?'text':'password'} minLength={8} autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>
        {message&&<p className="form-error" role="alert">{message}</p>}
        <button type="submit" className="btn primary" disabled={busy||logoBusy}><ShieldCheck size={17}/>{busy?'در حال ساخت...':'ساخت حساب مدیر'}</button>
      </form>
    </>}
  </div></div>;
}

function DemoShiftClosed({shopName,user,status,onLogout,preview=false,now=new Date()}) {
  return <div className="demo-login-page" dir="rtl"><div className="demo-login-card">
    <div className="demo-login-icon"><Clock3 size={26}/></div>
    <h1>{preview?'کارمند در این ساعت اجازهٔ ورود ندارد':'دسترسی بیرون از وقت کاری بسته است'}</h1>
    <p>{user?.name}، {status.reason}</p>
    <div className="info-note">وقت فعلی افغانستان: <strong dir="ltr">{kabulLocalDateTime(now).replace('T',' ')}</strong></div>
    <p>{preview?'این پیش‌نمایش مطابق ساعت کاری کارمند بسته است. مدیر می‌تواند به پنل مدیریت برگردد یا اجازهٔ اضافی بدهد.':'مدیر سیستم می‌تواند در بخش «نقش‌ها و صلاحیت‌ها» برای شما دسترسی اضافی تا ساعت مشخص تعیین کند.'}</p>
    <button className="btn primary login-back-button" type="button" onClick={onLogout}><LogOut size={17}/>{preview?'بازگشت به مدیر سیستم':'خروج از حساب'}</button>
  </div></div>;
}
function DemoLoginScreen({shopName,onLogin,onRecover}) {
  const [view,setView]=useState('login');
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [showPassword,setShowPassword]=useState(false);
  const [code,setCode]=useState('');
  const [newPassword,setNewPassword]=useState('');
  const [confirmPassword,setConfirmPassword]=useState('');
  const [newAdminCode,setNewAdminCode]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  const submitLogin=async event=>{
    event.preventDefault();setMessage('');setBusy(true);
    try {const result=await onLogin(username,password);if(!result?.ok)setMessage(result?.message||'نام کاربری یا رمز اشتباه است، یا حساب غیرفعال شده است.');}
    catch {setMessage('امکان ورود موجود نیست.');}
    finally {setBusy(false);setPassword('');}
  };
  const submitRecovery=async event=>{
    event.preventDefault();setMessage('');
    if(newPassword.length<8){setMessage('رمز تازه باید حداقل ۸ حرف داشته باشد.');return;}
    if(newPassword!==confirmPassword){setMessage('رمز تازه و تکرار آن یکسان نیستند.');return;}
    setBusy(true);
    try {
      const result=await onRecover(username,code,newPassword);
      if(!result?.ok) setMessage('کد بازیابی اشتباه یا منقضی شده است. از مدیر سیستم کد تازه بگیرید.');
      else {setNewAdminCode(result.newAdminCode||'');setCode('');setPassword('');setNewPassword('');setConfirmPassword('');setView('success');}
    } catch {setMessage('بازیابی رمز انجام نشد.');}
    finally {setBusy(false);}
  };
  return <div className="demo-login-page" dir="rtl"><div className="demo-login-card">
    <div className="demo-login-icon"><LockKeyhole size={27}/></div>
    <div className="demo-login-brow">سامانه مدیریت عمده‌فروشی افغانستان</div>
    <h1>{view==='login'?`ورود به ${shopName}`:view==='recover'?'بازیابی رمز ورود':'رمز شما تغییر کرد'}</h1>
    {view==='login' ? <>
      <p>با نام کاربری و رمز که مدیر سیستم به شما داده است وارد شوید. ساعت کاری با <strong>وقت افغانستان</strong> بررسی می‌شود.</p>
      <form onSubmit={submitLogin} className="demo-login-form">
        <label>نام کاربری<input autoFocus dir="ltr" required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="ahmad01"/></label>
        <label>رمز ورود<div className="login-password-control"><input dir="ltr" required type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="رمز ورود"/><button type="button" className="password-eye" aria-label={showPassword?'پنهان کردن رمز':'نمایش رمز'} onClick={()=>setShowPassword(x=>!x)}>{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div></label>
        {message&&<p role="alert" className="form-error">{message}</p>}
        <button className="btn primary" type="submit" disabled={busy}><LogOut size={17}/> {busy?'بررسی...':'ورود به برنامه'}</button>
      </form>
      <button type="button" className="login-text-link" onClick={()=>{setView('recover');setMessage('')}}><KeyRound size={16}/> رمز را فراموش کرده‌ام</button>
    </> : view==='recover' ? <>
      <p>اگر رمز را فراموش کردید، از مدیر سیستم یک <strong>کد بازیابی</strong> بگیرید. سپس در همین مرورگر رمز تازه تعیین کنید.</p>
      <form onSubmit={submitRecovery} className="demo-login-form">
        <label>نام کاربری<input autoFocus dir="ltr" required autoComplete="username" value={username} onChange={e=>setUsername(e.target.value)} placeholder="ahmad01"/></label>
        <label>کد بازیابی (از مدیر سیستم)<input dir="ltr" required value={code} onChange={e=>setCode(e.target.value.toUpperCase())} placeholder="AF-XXXX-XXXX-XXXX-XXXX" autoComplete="off"/></label>
        <label>رمز تازه<input dir="ltr" required minLength={8} type="password" autoComplete="new-password" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/></label>
        <label>تکرار رمز تازه<input dir="ltr" required minLength={8} type="password" autoComplete="new-password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)}/></label>
        {message&&<p role="alert" className="form-error">{message}</p>}
        <button disabled={busy} className="btn primary" type="submit"><KeyRound size={17}/> {busy?'بررسی کد...':'تغییر رمز با کد بازیابی'}</button>
      </form>
      <button type="button" className="login-text-link" onClick={()=>{setView('login');setMessage('')}}><ChevronRight size={16}/> بازگشت به ورود</button>
    </> : <>
      <p>اکنون می‌توانید با رمز تازه وارد برنامه شوید.</p>
      {newAdminCode && <div className="recovery-code-panel" role="status"><strong>کد بازیابی تازه مدیر — این کد را خصوصی ذخیره کنید</strong><code dir="ltr">{newAdminCode}</code><button type="button" className="btn secondary" onClick={()=>navigator.clipboard?.writeText(newAdminCode)}>کاپی کد تازه</button></div>}
      <button type="button" className="btn primary login-back-button" onClick={()=>{setView('login');setMessage('');setNewAdminCode('')}}>بازگشت به صفحه ورود</button>
    </>}
  </div></div>;
}

function DemoChangePasswordScreen({shopName,user,onChangePassword}) {
  const [password,setPassword]=useState('');const [confirm,setConfirm]=useState('');
  const [error,setError]=useState('');const [busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setError('');
    if(password.length<8){setError('رمز باید حداقل ۸ حرف داشته باشد.');return;}
    if(password!==confirm){setError('رمزها یکسان نیستند.');return;}
    setBusy(true);const ok=await onChangePassword(password);setBusy(false);
    if(!ok)setError('تغییر رمز انجام نشد.');
  };
  return <div className="demo-login-page" dir="rtl"><div className="demo-login-card">
    <div className="demo-login-icon"><ShieldCheck size={28}/></div><h1>تغییر رمز موقت</h1>
    <p>{user.name}، برای ادامهٔ کار در {shopName} یک رمز تازه تعیین کنید.</p>
    <form className="demo-login-form" onSubmit={submit}>
      <label>رمز تازه<input autoFocus required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label>
      <label>تکرار رمز تازه<input required minLength={8} type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password"/></label>
      {error&&<p role="alert" className="form-error">{error}</p>}
      <button className="btn primary" disabled={busy} type="submit"><Save size={17}/> ذخیره رمز و ورود</button>
    </form>
  </div></div>;
}

function SettingsPasswordDialog({challenge,onCancel,onApprove}) {
  const [password,setPassword]=useState('');
  const [visible,setVisible]=useState(false);
  const [acknowledged,setAcknowledged]=useState(false);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const handleSubmit=async (event)=>{
    event.preventDefault();
    if(busy || (challenge.destructive && !acknowledged)) return;
    setBusy(true);setError('');
    try {
      const result=await onApprove(password);
      if(!result?.ok){setError(result?.message||'رمز تأیید نشد.');setPassword('');}
    } catch(err){setError(err?.message||'خطا در بررسی رمز.');setPassword('');}
    finally {setBusy(false);}
  };
  return <div className="settings-password-backdrop" dir="rtl" role="presentation">
    <section className="settings-password-dialog" role="dialog" aria-modal="true" aria-labelledby="settings-confirm-title" aria-describedby="settings-confirm-description">
      <div className="settings-password-heading"><span className="settings-password-icon"><LockKeyhole size={22}/></span><div>
        <h2 id="settings-confirm-title">{challenge.title}</h2>
        <p id="settings-confirm-description">توجه! شما می‌خواهید عملیات زیر را انجام دهید. پیش از اجرا، رمز حساب خود را تأیید کنید.</p>
      </div></div>
      <ul className={challenge.destructive?'settings-changes-list settings-danger-list':'settings-changes-list'}>
        {(challenge.details||[]).map((detail,i)=><li key={i}>{detail}</li>)}
      </ul>
      <form onSubmit={handleSubmit} autoComplete="off">
        <label className="settings-password-field">رمز ورود فعلی
          <span className="settings-password-input"><input required autoFocus dir="ltr" type={visible?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="رمز حساب را وارد کنید" />
            <button type="button" title={visible?'پنهان کردن رمز':'نمایش رمز'} aria-label={visible?'پنهان کردن رمز':'نمایش رمز'} onClick={()=>setVisible(v=>!v)}>{visible?<EyeOff size={18}/>:<Eye size={18}/>}</button>
          </span>
        </label>
        {challenge.destructive && <label className="settings-danger-ack"><input type="checkbox" checked={acknowledged} onChange={e=>setAcknowledged(e.target.checked)}/> می‌دانم این کار برگشت‌پذیر نیست و مسئولیت پاک‌شدن معلومات را می‌پذیرم.</label>}
        {error && <p role="alert" className="form-error">{error}</p>}
        <div className="settings-password-actions">
          <button type="button" className="btn secondary" disabled={busy} onClick={onCancel}>انصراف</button>
          <button type="submit" className={`btn ${challenge.destructive?'settings-confirm-danger':'primary'}`} disabled={busy || !password || (challenge.destructive&&!acknowledged)}>
            <LockKeyhole size={16}/> {busy?'در حال بررسی...':challenge.destructive?'تأیید رمز و اجرای عملیات':'تأیید رمز و ذخیره'}
          </button>
        </div>
      </form>
    </section>
  </div>;
}

function ThemeSettingsControls({value,onChange,disabled=false,compact=false,showMode=true}) {
  const appearance=normalizeAppearance(value);
  const [newColor,setNewColor]=useState('#dc6b31');
  const [error,setError]=useState('');
  const colors=[...THEME_PRESETS,...appearance.customColors.filter(hex=>!THEME_PRESETS.some(p=>p.hex.toLowerCase()===hex.toLowerCase())).map((hex,i)=>({name:`رنگ شخصی ${i+1}`,hex}))];
  return <div className={`theme-settings ${compact?'theme-setup-compact':''}`}>
    {showMode && <div className="theme-mode-options" role="group" aria-label="حالت نمایش">
      <button type="button" disabled={disabled} className={`theme-option ${appearance.mode==='light'?'selected':''}`} onClick={()=>onChange({...appearance,mode:'light'})}><Sun size={17}/> روشن</button>
      <button type="button" disabled={disabled} className={`theme-option ${appearance.mode==='dark'?'selected':''}`} onClick={()=>onChange({...appearance,mode:'dark'})}><Moon size={17}/> تاریک</button>
    </div>}
    <div className="theme-colors" role="group" aria-label="رنگ برنامه">
      {colors.map(item=><button type="button" key={item.hex} disabled={disabled} aria-pressed={appearance.accent.toLowerCase()===item.hex.toLowerCase()} onClick={()=>onChange({...appearance,accent:item.hex})} className={`theme-color-choice ${appearance.accent.toLowerCase()===item.hex.toLowerCase()?'selected':''}`}><span className="theme-color-circle" style={{background:item.hex}}/>{item.name}</button>)}
    </div>
    {!disabled && <div className="theme-custom-add"><label>رنگ دلخواه <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} aria-label="رنگ جدید"/></label><button type="button" className="btn secondary" onClick={()=>{try{onChange(addCustomColor(appearance,newColor));setError('');}catch(e){setError(e.message);}}}><Plus size={15}/> افزودن رنگ</button></div>}
    {error&&<p className="form-error" role="alert">{error}</p>}
    {compact&&<small>رنگ دلخواه و روشن/تاریک را همین‌جا انتخاب کنید؛ بعد از ساخت حساب ذخیره می‌شود.</small>}
  </div>;
}
function IdentityScanField({value,onChange,onBusyChange}) {
  const mounted=React.useRef(true);
  useEffect(()=>{mounted.current=true;return ()=>{mounted.current=false;};},[]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [viewUrl,setViewUrl]=useState('');
  useEffect(()=>{
    let active=true,url='';
    if(value?.id) loadIdentityScan(value.id).then(result=>{
      if(!active||!result?.blob)return;
      url=URL.createObjectURL(result.blob);
      setViewUrl(url);
    }).catch(()=>{if(active)setError('فایل قبلی در حافظه همین مرورگر پیدا نشد.');});
    else setViewUrl('');
    return ()=>{active=false;if(url)URL.revokeObjectURL(url);};
  },[value?.id]);
  const upload=async event=>{
    const file=event.target.files?.[0];if(!file)return;
    setError('');setBusy(true);onBusyChange?.(true);
    try {const attachment=await saveIdentityScan(file);if(mounted.current)onChange(attachment);else await removeIdentityScan(attachment.id);}
    catch(e){setError(e.message||'حفظ فایل انجام نشد.');}
    finally {if(mounted.current){setBusy(false);onBusyChange?.(false);}event.target.value='';}
  };
  return <div className="identity-scan-field">
    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={upload} disabled={busy} aria-label="آپلود عکس یا سکن تذکره"/>
    <small>{busy?'در حال ذخیره فایل...':'JPG / PNG / WebP / PDF، حداکثر ۸ MB؛ در حافظه همین مرورگر حفظ می‌شود.'}</small>
    {value?.id && <div className="identity-scan-preview">
      {viewUrl && value.mime!=='application/pdf' ? <img alt="پیش‌نمایش سکن تذکره" src={viewUrl}/> : <FileText size={20}/>}
      <span>{value.name||'سند هویت'}</span>
      {viewUrl&&<a className="btn secondary" href={viewUrl} target="_blank" rel="noopener noreferrer" download={value.name||'identity-scan'}>دیدن / ذخیره</a>}
      <button className="btn secondary" type="button" onClick={()=>onChange(null)}>حذف از فورم</button>
    </div>}
    {error&&<small className="form-error" role="alert">{error}</small>}
  </div>;
}

function SettingsPage({ preferences, years, data, appearance, onSaveAppearance, onSave, onClearTransactions, onResetBusiness, canManage=true }) {
  const [shopName, setShopName] = useState(preferences.shopName);
  const [shopLogo,setShopLogo] = useState(preferences.shopLogo||'');
  const [logoBusy,setLogoBusy]=useState(false);
  const [fiscalYear, setFiscalYear] = useState(preferences.fiscalYear);
  const [openingCash,setOpeningCash]=useState(String(preferences.openingCash??0));
  const [calendarMode,setCalendarMode]=useState(normalizedCalendarMode(preferences.calendarMode));
  const [themeDraft,setThemeDraft]=useState(()=>normalizeAppearance(appearance));
  useEffect(() => { setShopName(preferences.shopName); setShopLogo(preferences.shopLogo||''); setFiscalYear(preferences.fiscalYear); setOpeningCash(String(preferences.openingCash??0)); setCalendarMode(normalizedCalendarMode(preferences.calendarMode)); }, [preferences.shopName, preferences.shopLogo, preferences.fiscalYear, preferences.openingCash, preferences.calendarMode]);
  useEffect(()=>setThemeDraft(normalizeAppearance(appearance)),[appearance]);
  const save = event => {
    event.preventDefault();
    const name = shopName.trim();
    if (!name || logoBusy) return;
    if(!Number.isFinite(Number(openingCash))||Number(openingCash)<0) return;
    if(!onSave({shopName:name.slice(0,90), shopLogo:safeBusinessLogo(shopLogo), openingCash:Number(openingCash), fiscalYear:Number(fiscalYear),calendarMode})) setFiscalYear(preferences.fiscalYear);
  };
  return <>
    <PageHeading title="تنظیمات" description="نام عمده‌فروشی و سال مالی را تنظیم کنید" />
    <Panel title="معلومات عمده‌فروشی">
      <form className="business-settings-form" onSubmit={save}>
        <label>نام عمده‌فروشی
          <input type="text" required disabled={!canManage} maxLength={90} value={shopName} onChange={event=>setShopName(event.target.value)} placeholder="نام فروشگاه یا شرکت شما" />
          <small>این نام در بالای منوی سمت راست و پایین برنامه نمایش داده می‌شود.</small>
        </label>
        <BusinessLogoPicker inputId="settings-business-logo" logo={shopLogo} shopName={shopName} onChange={setShopLogo} onBusyChange={setLogoBusy} disabled={!canManage}/>
        <label>سال مالی
          <select disabled={!canManage} value={fiscalYear} onChange={event=>setFiscalYear(Number(event.target.value))}>
            {years.map(year=><option key={year} value={year}>{number(year)}{year !== preferences.fiscalYear && !financialYearRecordCount(data,year) ? ' — بدون معلومات' : ''}</option>)}
          </select>
          <small>این انتخاب در مقایسهٔ خریداری‌ها، فروشات و ارقام سالانهٔ داشبورد استفاده می‌شود.</small>
        </label>
        <label>پول آغازین صندوق نقدی (افغانی)<GroupedNumberInput  min="0" step="0.01" value={openingCash} onChange={e=>setOpeningCash(e.target.value)} disabled={!canManage}/><small>موجودی هنگام راه‌اندازی فروشگاه؛ تغییر آن با تأیید رمز مدیر انجام می‌شود.</small></label>
        {canManage && <div className="business-settings-actions"><button className="btn primary" type="submit" disabled={logoBusy}><Save size={17}/> ذخیره تنظیمات</button></div>}
      </form>
    </Panel>
    <Panel title="رنگ برنامه">
      <p className="settings-muted-info">برای تغییر حالت روشن یا تاریک از دکمهٔ ماه/آفتاب در نوار بالای برنامه استفاده کنید.</p>
      <ThemeSettingsControls value={themeDraft} onChange={setThemeDraft} disabled={!canManage} showMode={false}/>
      {canManage && <div className="business-settings-actions"><button type="button" className="btn primary" onClick={()=>onSaveAppearance(themeDraft)}><Save size={17}/> ذخیره رنگ برنامه</button></div>}
    </Panel>
    <DocumentDesignSettings kind="bill" preferences={preferences} canManage={canManage} onSave={onSave}/>
    <DocumentDesignSettings kind="contract" preferences={preferences} canManage={canManage} onSave={onSave}/>
    <Panel title="زبان و نمایش">
      <div className="business-settings-form">
        <label>نوع تقویم در برنامه
          <select value={calendarMode} onChange={e=>setCalendarMode(e.target.value)} disabled={!canManage}>
            <option value="shamsi">تاریخ شمسی (هجری شمسی افغانستان)</option>
            <option value="gregorian">تاریخ میلادی (Gregorian)</option>
          </select>
          <small>تاریخ بل‌ها، جدول‌ها و فلتر گزارش مطابق انتخاب شما نمایش داده می‌شود. تاریخ‌های قدیمی بدون پاک‌شدن قابل نمایش هستند.</small>
        </label>
        {canManage && <div className="business-settings-actions"><button type="button" className="btn primary" onClick={()=>onSave({calendarMode})}><Save size={16}/> ذخیره نوع تقویم</button></div>}
        <div className="settings-list">
          <div><strong>زبان برنامه</strong><span>دری افغانستان</span></div>
          <div><strong>جهت نمایش</strong><span>راست به چپ (RTL)</span></div>
          <div><strong>واحد پول اصلی</strong><span>افغانی (AFN)</span></div>
        </div>
      </div>
    </Panel>
    {canManage && <Panel title="مدیریت معلومات">
      <p className="settings-muted-info">پاک‌کردن معاملات، معلومات حساب مدیر و نام عمده‌فروشی را حفظ می‌کند. برای این کار تأیید رمز ضروری است.</p>
      <button className="btn secondary" type="button" onClick={onClearTransactions}><RotateCcw size={16}/> پاک‌کردن معاملات</button>
      <p className="settings-muted-info">راه‌اندازی دوباره تمام معلومات این نسخه، به شمول حساب‌ها و معاملات را پاک می‌کند. قبل از آن باید پیام را خوانده و رمز را وارد کنید.</p>
      <button className="btn secondary" type="button" onClick={onResetBusiness}><RotateCcw size={16}/> راه‌اندازی دوباره از صفر</button>
    </Panel>}
  </>;
}

function DocumentDesignSettings({kind,preferences,canManage,onSave}){
  const field=kind==='bill'?'billDesign':'contractDesign';
  const [draft,setDraft]=useState(()=>normalizeDocumentDesign(preferences[field]));
  const [busy,setBusy]=useState(false);
  const stored=preferences[field];
  useEffect(()=>setDraft(normalizeDocumentDesign(stored)),[stored]);
  const update=(key,value)=>setDraft(prev=>({...prev,[key]:value}));
  const title=kind==='bill'?'طرح چاپ بل‌های فروش و خرید':'طرح چاپ قرارداد';
  const logoLabel=kind==='bill'?'بارگذاری لوگوی بل‌های فروش و خرید':'بارگذاری لوگوی قرارداد';
  const setPrintLogo=logo=>setDraft(prev=>({...prev,logo,logoMode:logo?'custom':preferences.shopLogo?'shop':'none'}));
  const previewPrefs={...preferences,[field]:draft};
  const design=resolveDocumentDesign(previewPrefs,kind);
  const preview=()=>{
    const invoice={type:'sale',number:'نمونه',title:'نمونه چاپ',party:'مشتری نمونه',date:afghanKabulToday(),items:[{product:'جنس نمونه',quantity:2,price:100,discount:0}],total:200,paid:100,balance:100};
    if(kind==='bill') printHtml(invoicePrintHtml(invoice,{},previewPrefs,preferences.calendarMode));
    else printHtml(contractPrintHtml(contractSnapshot({name:'مشتری نمونه',saleContract:{enabled:true}},previewPrefs,invoice),null,preferences.calendarMode,previewPrefs));
  };
  return <Panel title={title}><div className="business-settings-form">
    <label>رنگ چاپ<select disabled={!canManage} value={['#214661','#165f4c','#574180','#3e4147'].includes(draft.color)?draft.color:'custom'} onChange={e=>{if(e.target.value==='custom') update('color','#007aff');else update('color',e.target.value);}}><option value="#214661">آبی رسمی</option><option value="#165f4c">سبز</option><option value="#574180">بنفش</option><option value="#3e4147">خاکستری</option><option value="custom">رنگ دلخواه</option></select></label>
    <label>انتخاب رنگ دلخواه<input type="color" value={draft.color} disabled={!canManage} onChange={e=>update('color',e.target.value)}/></label>
    <div className="print-logo-section">
      <h3>{kind==='bill'?'لوگوی بل‌های فروش و خرید':'لوگوی قرارداد مشتریان'}</h3>
      <p className="settings-muted-info">{kind==='bill'?'این عکس در بالای هر دو بل فروش و خرید چاپ می‌شود.':'این عکس در بالای قرارداد چاپ می‌شود.'} برای این سند می‌توانید لوگوی جداگانه انتخاب کنید.</p>
      <BusinessLogoPicker inputId={`print-logo-${kind}`} logo={draft.logo} shopName={preferences.shopName} disabled={!canManage} onChange={setPrintLogo} onBusyChange={setBusy} label={logoLabel} help="عکس JPG، PNG یا WebP؛ حداکثر ۵ MB. با انتخاب عکس، لوگوی چاپ به‌صورت خودکار انتخاب می‌شود." printLogo/>
      <label>لوگو در نسخه چاپی<select disabled={!canManage||busy} value={draft.logoMode} onChange={e=>update('logoMode',e.target.value)}><option value="shop">استفاده از لوگوی اصلی عمده‌فروشی (منو)</option><option value="custom" disabled={!draft.logo}>استفاده از عکس بارگذاری‌شده در بالا</option><option value="none">چاپ بدون لوگو</option></select></label>
      {draft.logoMode==='shop'&&!preferences.shopLogo&&<small>لوگوی اصلی هنوز انتخاب نشده است. عکس را در همین بخش بارگذاری کنید یا در معلومات عمده‌فروشی لوگوی اصلی را اضافه کنید.</small>}
      {draft.logoMode==='custom'&&!draft.logo&&<small>برای چاپ لوگوی جداگانه، ابتدا عکس را انتخاب کنید.</small>}
      <strong className="print-logo-preview-title">پیش‌نمایش سربرگ چاپ</strong>
      <div className="document-design-preview" style={{borderColor:design.color}}><div>{design.logo?<img src={design.logo} alt="لوگوی چاپ"/>:<small>بدون لوگو</small>}<strong>{preferences.shopName}</strong></div><span style={{background:themeColors(design.color,'light').buttonBg,color:'#fff'}}>{kind==='bill'?'جزئیات بل — نمونه':'مشخصات قرارداد — نمونه'}</span></div>
    </div>
    <div className="business-settings-actions"><button type="button" className="btn secondary" onClick={preview} disabled={busy||(draft.logoMode==='custom'&&!draft.logo)}><Printer size={16}/> پیش‌نمایش چاپ</button>{canManage&&<button type="button" className="btn primary" disabled={busy||(draft.logoMode==='custom'&&!draft.logo)} onClick={()=>onSave({[field]:normalizeDocumentDesign(draft)})}><Save size={16}/> ذخیره طرح چاپ</button>}</div>
    <small>ذخیره طرح مستلزم تأیید رمز مدیر است. رنگ برنامه تغییر نمی‌کند.</small>
  </div></Panel>;
}

function ProfilePage({preferences,onSave,onNavigate,canEdit=true,roleName=''}) {
  const [userName,setUserName] = useState(preferences.userName);
  const [userTitle,setUserTitle] = useState(preferences.userTitle);
  useEffect(()=>{setUserName(preferences.userName);setUserTitle(preferences.userTitle);},[preferences.userName,preferences.userTitle]);
  function submit(event){
    event.preventDefault();
    if (!userName.trim() || !userTitle.trim()) return;
    onSave({userName:userName.trim().slice(0,60),userTitle:userTitle.trim().slice(0,60)});
  }
  return <>
    <PageHeading title="پروفایل کاربر" description={`نقش فعلی: ${roleName}`} actions={null} />
    <Panel title="معلومات کاربر">
      <div className="profile-preview"><span className="avatar">{preferences.userName.trim().charAt(0) || "ح"}</span><div><strong>{preferences.userName}</strong><span>{preferences.userTitle}</span></div></div>
      {canEdit && <form className="business-settings-form" onSubmit={submit}>
        <label>نام نمایشی
          <input value={userName} onChange={e=>setUserName(e.target.value)} required maxLength={60} placeholder="مثلاً: احمد" />
        </label>
        <label>عنوان وظیفوی
          <input value={userTitle} onChange={e=>setUserTitle(e.target.value)} required maxLength={60} placeholder="مثلاً: حسابدار" />
        </label>
        <div className="business-settings-actions"><button className="btn primary" type="submit"><Save size={17}/> ذخیره پروفایل</button></div>
      </form>}
    </Panel>
    <p className="info-note">صلاحیت‌های نقش در صفحه «مدیریت → نقش‌ها و صلاحیت‌ها» تنظیم می‌شوند. این نسخه ورود امن ندارد؛ مدیریت دسترسی فعلاً نمایشی و در همین مرورگر است.</p>
  </>;
}

const helpSections = [
  {title:"ثبت بل فروش و دریافت پول", icon:Receipt, target:"sales", description:"در «بل‌های فروش» بل بسازید؛ برای بل‌های قرضه از گزینهٔ «ثبت دریافت پول» استفاده کنید تا مانده کم شود."},
  {title:"مشتریان بدهکار", icon:Users, target:"debtors", description:"بل‌های پرداخت‌نشده را ببینید. پس از دریافت تمام مبلغ، بل از فهرست بدهکاران خارج می‌شود."},
  {title:"ثبت خریداری", icon:ShoppingCart, target:"purchases", description:"بل خرید ثبت کنید؛ تعداد جنس خریداری‌شده به موجودی گدام اضافه می‌شود."},
  {title:"گدام و موجودی", icon:Warehouse, target:"warehouseDashboard", description:"موجودی، حرکت جنس و انتقال میان گدام‌ها را بررسی کنید. نقطهٔ سفارش هر محصول را در صفحهٔ محصولات تعیین کنید."},
  {title:"معاشات و دستمزد", icon:Wallet, target:"payroll", description:"برای کارمند معاش ماهانه محاسبه و ثبت کنید؛ سپس پرداخت آن را ثبت کنید."},
  {title:"گزارش‌ها", icon:FileBarChart, target:"reports", description:"گزارش بل‌ها، مصارف و معاشات را مشاهده، فلتر، چاپ یا به CSV صادر کنید."},
  {title:"تنظیمات", icon:Settings, target:"settings", description:"نام عمده‌فروشی و سال مالی را تغییر دهید. پروفایل کاربر از بخش پایین منو قابل ویرایش است."},
];
function HelpPage({onNavigate,canView=()=>true}) {
  return <>
    <PageHeading title="راهنمای سامانه" description="راهنمای بخش‌های برنامه و روش استفاده از آن‌ها" />
    <div className="help-guide-grid">
      {helpSections.filter(section=>canView(section.target)).map(section => {
        const Icon = section.icon;
        return <section className="help-guide-card" key={section.target}>
          <div className="help-guide-heading"><Icon size={21}/><h3>{section.title}</h3></div>
          <p>{section.description}</p>
          <button type="button" className="btn secondary" onClick={()=>onNavigate(section.target)}>رفتن به این بخش <ArrowUpLeft size={15}/></button>
        </section>;
      })}
    </div>
    <p className="info-note">این نسخهٔ React برای نمایش به مشتری آماده شده است. معلومات فقط در همین مرورگر ذخیره می‌شوند؛ بخش ورود کاربران و دیتابیس مشترک هنوز موجود نیست.</p>
  </>;
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
      <label>تعداد<GroupedNumberInput  min="0.01" step="any" required value={form.quantity} onChange={e=>update('quantity',e.target.value)}/></label>
      <label>تاریخ<AfghanDatePicker value={form.date} onChange={date=>update('date',date)} required/></label>
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
      <label>معاش اصلی (افغانی)<GroupedNumberInput  min="0" step="any" value={form.base||''} onChange={e=>update('base',e.target.value)} required/></label>
      <label>اضافه‌کاری و امتیازات<GroupedNumberInput  min="0" step="any" value={form.bonus ?? 0} onChange={e=>update('bonus',e.target.value)}/></label>
      <label>کسورات<GroupedNumberInput  min="0" step="any" value={form.deduction ?? 0} onChange={e=>update('deduction',e.target.value)}/></label>
      <label>تاریخ صدور<AfghanDatePicker value={form.date} onChange={date=>update('date',date)} required/></label>
      <label className="wide">یادداشت<textarea value={form.notes||''} onChange={e=>update('notes',e.target.value)} rows={2}/></label>
    </div>
    <div className="payment-summary-grid"><div className="payment-summary-item"><span>ناخالص</span><strong>{money(total.gross)}</strong></div>
      <div className="payment-summary-item"><span>خالص قابل پرداخت</span><strong>{money(total.net)}</strong></div></div>
    <div className="modal-actions"><button type="button" className="btn secondary" onClick={onCancel}>لغو</button><button type="submit" className="btn primary"><Save size={16}/> ثبت برگه معاش</button></div>
  </form>;
}

function AfghanDatePicker({value='', onChange, required=false}) {
  const calendarMode=React.useContext(CalendarModeContext);
  if(calendarMode==='gregorian')return <input className="gregorian-date-picker" type="date" aria-label="تاریخ میلادی" required={required} value={gregorianFromAfghan(value)} onChange={e=>onChange(afghanFromGregorian(e.target.value))}/>;
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

function EntityForm({ config, form, setForm, data, preferences, onSubmit, onCancel }) {
  const [contractScanBusy,setContractScanBusy]=useState(false);
  const [identityBusy,setIdentityBusy]=useState(false);
  return (
    <form onSubmit={event=>{if(contractScanBusy||identityBusy){event.preventDefault();return;}onSubmit(event);}}>
      <div className="modal-grid">
        {config.fields.map(([key, label]) => key==='identityScan' ? <div className="identity-form-field" key={key}><strong>{label}</strong><IdentityScanField value={form.identityScan} onBusyChange={setIdentityBusy} onChange={attachment=>setForm(previous=>({...previous,identityScan:attachment}))}/></div> : (
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
            ) : ["cost","price","tax","reorder","quantity","salary","opening"].includes(key) ? (
              <GroupedNumberInput min="0" inputMode="decimal" value={form[key] ?? ""} onChange={e=>setForm({...form,[key]:e.target.value})}/>
            ) : (
              <input
                type="text"
                inputMode={['phone','mobile'].includes(key) ? 'tel' : undefined}
                placeholder={['phone','mobile'].includes(key) ? '07xxxxxxxx یا +93 7xxxxxxxx' : key === 'tazkira' ? 'نمبر تذکره' : key === 'unit' ? 'مثلاً: بوری، کارتن، کیلوگرام' : key === 'economicNumber' ? 'اختیاری' : undefined}
                value={form[key] ?? ""}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            )}
          </label>
        ))}
      </div>
      {config===entityConfigs.customers&&<CustomerContractEditor customer={form} preferences={preferences} onChange={saleContract=>setForm(previous=>({...previous,saleContract:typeof saleContract==='function'?saleContract(previous.saleContract):saleContract}))} onBusyChange={setContractScanBusy}/>}
      <div className="modal-actions">
        <button type="button" className="btn secondary" onClick={onCancel}>
          لغو
        </button>
        <button className="btn primary" disabled={contractScanBusy||identityBusy}>
          <Save size={15} /> ثبت معلومات
        </button>
      </div>
    </form>
  );
}
function CustomerContractEditor({customer,preferences,onChange,onBusyChange}) {
  const calendarMode=React.useContext(CalendarModeContext);
  const c=contractDraft(customer.saleContract);
  const update=(key,value)=>onChange({...c,[key]:value});
  const changePreset=preset=>onChange(selectContractPreset(c,preset));
  const error=validateContract(c);
  return <section className="customer-contract-editor" dir="rtl">
    <h3><FileText size={19}/> قرارداد فروش و شرایط پرداخت</h3>
    <label className="contract-check"><input type="checkbox" checked={c.enabled} onChange={e=>{update('enabled',e.target.checked);if(!e.target.checked)onBusyChange?.(false);}}/> برای این مشتری قرارداد فروش ثبت شود</label>
    {c.enabled&&<>
      <p className="settings-muted-info">این شرایط در بل فروش مشتری اعمال می‌شود. مشخصات جنس، مبلغ و تاریخ نهایی پرداخت از همان بل تکمیل می‌گردد. قرارداد هر بل مستقل از تغییرات بعدی مشتری محفوظ می‌ماند.</p>
      <h4>۱. مشخصات قرارداد</h4><div className="contract-fields">
        <label>عنوان قرارداد<input required value={c.title} onChange={e=>update('title',e.target.value)}/></label>
        <label>نوع تذکره<input value={c.tazkiraType} onChange={e=>update('tazkiraType',e.target.value)} placeholder="کاغذی / الکترونیکی"/></label>
      </div>
      <small>لوگو و رنگ چاپ قرارداد از تنظیمات ← طرح چاپ قرارداد تعیین می‌شود.</small>
      <h4>۲ و ۳. جنس، مبلغ و شرایط پرداخت</h4><div className="contract-fields">
        <label>نوع پرداخت<select value={c.preset} onChange={e=>changePreset(e.target.value)}><option value="cash">نقدی و تصفیه کامل (۱۰۰٪)</option><option value="half">۵۰٪ نقد، باقی تا ۲۸ روز</option><option value="quarter">۲۵٪ نقد، باقی تا ۲۸ روز</option><option value="credit">تمام مبلغ نسیه</option><option value="custom">فیصدی دلخواه (وارد کردن دستی)</option></select></label>
        {c.preset==='custom'?<label>فیصدی دلخواه پیش‌پرداخت (%)<input type="number" inputMode="decimal" min="0" max="100" step="0.01" required value={c.percent??''} placeholder="مثلاً ۳۵ یا ۶۷٫۵" onChange={e=>update('percent',e.target.value)}/><small>هر فیصدی بین ۰ تا ۱۰۰ را وارد کنید؛ اعشاری هم پذیرفته می‌شود.</small></label>:<label>حداقل پیش‌پرداخت (فیصد)<input type="text" readOnly value={`${number(c.percent)}٪`}/><small>برای وارد کردن فیصدی دیگر، «فیصدی دلخواه» را انتخاب کنید.</small></label>}
        <label>مهلت باقی‌داری (روز)<input type="number" min={Number(c.percent)===100?0:1} max="3650" step="1" required value={c.days} onChange={e=>onChange({...c,preset:'custom',days:e.target.value})}/></label>
      </div><label className="full-label">شرایط توافقی و توضیحات<textarea rows="3" value={c.terms} onChange={e=>update('terms',e.target.value)}/></label>
      <h4>۴. مشخصات تضمین‌کننده</h4><div className="contract-fields">{[['guarantor','اسم ضامن'],['father','ولد'],['guarantorId','نمبر تذکره'],['guarantorPhone','شماره تماس'],['guarantorJob','وظیفه / کار مشخص']].map(([key,label])=><label key={key}>{label}<input value={c[key]} onChange={e=>update(key,e.target.value)}/></label>)}</div>
      <div className="identity-form-field"><strong>عکس / سکن تذکره تضمین‌کننده (اختیاری)</strong><IdentityScanField value={c.guarantorScan} onBusyChange={onBusyChange} onChange={attachment=>onChange(previous=>({...contractDraft(previous),guarantorScan:attachment,guarantorCopy:!!attachment}))}/><small>این سند فقط در معلومات مشتری نگهداری می‌شود و در چاپ بل یا قرارداد نمایش داده نمی‌شود.</small></div>
      <h4>۵. متن قرارداد و تأیید نهایی — قابل ویرایش</h4>{[['intro','مقدمه'],['payment','تعهد خریدار'],['guarantee','تعهد ضامن'],['delivery','تحویل جنس'],['final','تأیید نهایی']].map(([key,label])=><label key={key} className="full-label">{label}<textarea rows="3" value={c[key]} onChange={e=>update(key,e.target.value)}/></label>)}
      <div className="contract-fields">{[['representative','نماینده شرکت'],['witness1','شاهد اول'],['witness2','شاهد دوم']].map(([key,label])=><label key={key}>{label}<input value={c[key]} onChange={e=>update(key,e.target.value)}/></label>)}</div>
      <div className="contract-attachments"><label className="contract-check"><input type="checkbox" checked={c.guarantorCopy} onChange={e=>update('guarantorCopy',e.target.checked)}/> کاپی تذکره ضامن ضمیمه است</label><label className="contract-check"><input type="checkbox" checked={c.receipt} onChange={e=>update('receipt',e.target.checked)}/> رسید پرداخت ضمیمه است</label></div>
      <small>جای امضا و شصت در نسخه چاپی است؛ علامت ضمیمه فقط موجودیت سند را نشان می‌دهد؛ عکس تذکره چاپ نمی‌شود.</small>
      {error&&<p className="form-error">{error}</p>}
      <button type="button" className="btn secondary" disabled={!!error} onClick={()=>printHtml(contractPrintHtml(contractSnapshot({...customer,saleContract:c},preferences,{number:'—',date:afghanKabulToday(),total:0,paid:0,balance:0}),null,calendarMode,preferences))}><Printer size={16}/> پیش‌نمایش / چاپ پیش‌نویس قرارداد</button>
    </>}
  </section>;
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
  onCreateCustomer,
  onCreateSupplier,
  onQuickProduct,
  canCreateCustomer=false,
  canCreateSupplier=false,
  canCreateProduct=false,
}) {
  const total = items.reduce(
    (s, x) =>
      s +
      Number(x.quantity || 0) * Number(x.price || 0) -
      Number(x.discount || 0),
    0,
  );
  const currency=form.currency||'AFN';
  const rates={USD:form.usdRate,PKR:form.pkrRate,AED:form.aedRate,EUR:form.eurRate};
  const [showExtras,setShowExtras]=useState(false);
  const [newProduct,setNewProduct]=useState(null);
  const [pendingFx,setPendingFx]=useState(null);
  const expensesTotal=totalExtras(form.extraExpenses||[]);
  let currentRate=0;
  try {currentRate=currencyRate(currency,rates);} catch { currentRate=0; }
  const extraValid=!validateExtras(form.extraExpenses||[]);
  const updateExtra=(id,key,value)=>setForm(prev=>({...prev,extraExpenses:(prev.extraExpenses||[]).map(e=>e.id===id?{...e,[key]:value}:e)}));
  const removeExtra=id=>setForm(prev=>({...prev,extraExpenses:(prev.extraExpenses||[]).filter(e=>e.id!==id)}));
  const addExtra=()=>{setShowExtras(true);setForm(prev=>({...prev,extraExpenses:[...(prev.extraExpenses||[]),newExtraExpense()] }));};
  const switchCurrency = next => {
    if (next===currency) return;
    if (pendingFx) {
      if(next===pendingFx.sourceCurrency) {
        setItems(refreshCatalogPrices(pendingFx.items, pendingFx.sourceRate));
        setForm(prev=>({...prev,currency:next,paid:pendingFx.paid,extraExpenses:pendingFx.extraExpenses}));
        setPendingFx(null);
      } else {
        setForm(prev=>({...prev,currency:next}));
        setPendingFx({...pendingFx,targetCurrency:next});
      }
      return;
    }
    const hasValues = items.some(i=>(i.catalogPriceAfn==null&&Number(i.price))||Number(i.discount)) || Number(form.paid) || expensesTotal;
    let originRate=0, destinationRate=0;
    try {originRate=currencyRate(currency,rates);} catch {}
    try {destinationRate=currencyRate(next,rates);} catch {}
    if(hasValues && (!originRate || !destinationRate)) {
      if(!originRate) { alert('ابتدا نرخ ارز فعلی بل را درج کنید.'); return; }
      // Original amounts are kept until the new rate is entered, avoiding silent currency mistakes.
      setPendingFx({sourceCurrency:currency,targetCurrency:next,sourceRate:originRate,items:items.map(i=>({...i})),paid:form.paid,extraExpenses:(form.extraExpenses||[]).map(e=>({...e}))});
      setForm(prev=>({...prev,currency:next}));
      return;
    }
    if(hasValues) {
      const convert=value=>value===''?'':String(roundMoney(Number(value)*originRate/destinationRate));
      setItems(refreshCatalogPrices(items.map(item=>({...item,price:convert(item.price),discount:convert(item.discount||0)})),destinationRate));
      setForm(prev=>({...prev,currency:next,paid:convert(prev.paid||0),extraExpenses:(prev.extraExpenses||[]).map(e=>({...e,amount:convert(e.amount)}))}));
    } else {setForm(prev=>({...prev,currency:next}));setItems(refreshCatalogPrices(items,destinationRate));}
  };
  const changeSelectedRate = value => {
    const code=currency;
    const field=rateFieldFor(code);
    if(!field) return;
    setForm(prev=>({...prev,[field]:value}));
    const rate=Number(value);
    if(pendingFx && pendingFx.targetCurrency===code && Number.isFinite(rate) && rate>0) {
      const convert=value=>value===''?'':String(roundMoney(Number(value)*pendingFx.sourceRate/rate));
      setItems(refreshCatalogPrices(pendingFx.items.map(item=>({...item,price:convert(item.price),discount:convert(item.discount||0)})),rate));
      setForm(prev=>({...prev,[field]:value,paid:convert(pendingFx.paid||0),extraExpenses:pendingFx.extraExpenses.map(e=>({...e,amount:convert(e.amount)}))}));
      setPendingFx(null);
    } else if(!pendingFx) setItems(previous=>refreshCatalogPrices(previous,rate));
  };
  const calendarMode=React.useContext(CalendarModeContext);
  const saleContract=type==='sale'?data.customers.find(c=>c.name===form.party)?.saleContract:null;
  const contractMinimum=requiredDownPaymentSource(total+expensesTotal,saleContract,currentRate);
  const due=saleContract?.enabled?dueDate(form.date,Number(saleContract.days)):'';
  const underpaid=saleContract?.enabled&&Number(form.paid||0)+0.000001<contractMinimum;
  const partyLabel = type === "purchase" ? "عرضه‌کننده" : "مشتری";
  const parties = type === "purchase" ? data.suppliers : data.customers;
  const addRow = () =>
    setItems([...items, { product: "", quantity: 1, price: "", discount: 0 }]);
  const update = (index, key, value) =>
    setItems(
      items.map((item, i) => (i === index ? updateInvoiceLine(item,key,value,type,data.products,currentRate) : item)),
    );
  return (
    <form onSubmit={onSubmit}>
      <div className="modal-grid">
        <label>واحد پول بل
          <select value={currency} onChange={e=>switchCurrency(e.target.value)}>
            {CURRENCIES.map(code=><option key={code} value={code}>{CURRENCY_LABELS[code]}</option>)}
          </select>
          <small>{currency==='AFN'?'قیمت‌ها به افغانی ثبت می‌شوند.':currentRate?`نرخ همین بل: ۱ ${currency} = ${number(currentRate)} افغانی`:'نرخ ارز را در همین بل درج کنید.'}</small>
        </label>
        {currency!=='AFN' && <div className="invoice-fx-box" role="group" aria-label={`نرخ تبدیل ${currency}`}>
          <strong><CircleDollarSign size={17}/> نرخ تبدیل {currency} به افغانی</strong>
          <p>نرخ همین بل را وارد کنید. این نرخ فقط برای همین بل است.</p>
          <div className="invoice-fx-fields">
            <label>۱ {currency} = چند افغانی؟
              <GroupedNumberInput dir="ltr"  min="0" step="any" inputMode="decimal" required placeholder={`نرخ ${currency} به افغانی`} value={form[rateFieldFor(currency)]??''} onChange={e=>changeSelectedRate(e.target.value)}/>
            </label>
          </div>
          {pendingFx && <small className="invoice-muted-hint" role="status">نرخ را درج کنید تا قیمت‌ها و مصارف قبلی به {currency} تبدیل شوند.</small>}
        </div>}
        <label>
          گدام
          <select value={form.warehouseId || DEFAULT_WAREHOUSE} onChange={e => setForm({ ...form, warehouseId: e.target.value })}>
            <option value={DEFAULT_WAREHOUSE}>گدام عمومی</option>
            {data.warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
          </select>
        </label>
        {type==='sale' && (data.shipments||[]).length>0 && <>
          <label>محمولهٔ منبع فروش (اختیاری)
            <select value={form.shipmentId||''} onChange={e=>setForm({...form,shipmentId:e.target.value,soldTonnes:''})}>
              <option value="">بدون ارتباط به محموله</option>
              {data.shipments.map(sh=><option key={sh.id} value={sh.id}>{sh.reference} — {sh.tonnes} تن</option>)}
            </select>
          </label>
          {form.shipmentId && <label>وزن فروش از همین محموله (تن)
            <GroupedNumberInput required  min="0.001" step="any" value={form.soldTonnes||''} onChange={e=>setForm({...form,soldTonnes:e.target.value})}/>
            <small>برای محاسبهٔ مفاد دقیق‌تر، وزن واقعی فروخته‌شده از این محموله را درج کنید.</small>
          </label>}
        </>}
        <label>
          نام بل
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="نام بل"
          />
        </label>
        <div className="invoice-party-field">
          <label>
            {partyLabel}
            <select
              value={form.party}
              onChange={(e) => setForm({ ...form, party: e.target.value })}
            >
              <option value="">{partyLabel} را انتخاب کنید</option>
              {parties.map((p) => (
                <option key={p.id} value={p.name}>{p.name}</option>
              ))}
            </select>
          </label>
          {type==='sale' && canCreateCustomer && <button type="button" className="inline-create-link" onClick={onCreateCustomer}><UserPlus size={16}/> مشتری در فهرست نیست؟ ایجاد مشتری جدید</button>}
          {type==='purchase' && canCreateSupplier && <button type="button" className="inline-create-link" onClick={onCreateSupplier}><UserPlus size={16}/> عرضه‌کننده در فهرست نیست؟ ایجاد عرضه‌کننده جدید</button>}
        </div>
        <label>
          تاریخ بل
          <AfghanDatePicker value={form.date} onChange={date=>setForm({...form,date})} required/>
        </label>
        <label>
          مبلغ پرداخت‌شده ({currency})
          <GroupedNumberInput
            
            min="0"
            step="any"
            inputMode="decimal"
            value={form.paid}
            onChange={(e) => setForm({ ...form, paid: e.target.value })}
          />
        </label>
      </div>
      {saleContract?.enabled&&<section className="contract-payment-summary"><strong><FileText size={17}/> شرایط قرارداد مشتری</strong><span>حداقل پیش‌پرداخت: {number(saleContract.percent)}٪ — {number(contractMinimum)} {currency}</span><span>مهلت باقی‌داری: {number(saleContract.days)} روز — {formatCalendarDate(due,calendarMode)}</span><button type="button" className="btn secondary" onClick={()=>setForm(prev=>({...prev,paid:String(contractMinimum)}))}>درج مبلغ حداقل پیش‌پرداخت</button>{underpaid&&<small className="form-error">مبلغ پرداخت‌شده کمتر از پیش‌پرداخت قرارداد است.</small>}</section>}
      <div className="invoice-lines">
        <div className="lines-title">
          <strong>اقلام بل</strong>
          <span>مالیات در بل فروش نمایش داده نمی‌شود.</span>
        </div>
        {type==='sale'&&<small className="invoice-muted-hint">با انتخاب جنس، قیمت فروش ثبت‌شده به‌صورت خودکار درج می‌شود. قیمت قابل تغییر است.</small>}
        <datalist id="products-list">{data.products.map(p=><option key={p.id} value={p.name}/>)}</datalist>
        <div className="table-wrap responsive-entry-lines">
          <table>
            <thead>
              <tr>
                <th>محصول / خدمات</th>
                <th>تعداد</th>
                <th>قیمت واحد ({currency})</th>
                <th>تخفیف ({currency})</th>
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
                      disabled={!!pendingFx}
                      list="products-list"
                    />

                  </td>
                  <td data-label="تعداد">
                    <GroupedNumberInput
                      aria-label={`تعداد، قلم ${index + 1}`}
                      
                      min="0"
                      value={item.quantity}
                      onChange={(e) =>
                        update(index, "quantity", e.target.value)
                      }
                    />
                  </td>
                  <td data-label="قیمت واحد">
                    <GroupedNumberInput
                      aria-label={`قیمت واحد، قلم ${index + 1}`}
                      
                      min="0"
                      step="any"
                      inputMode="decimal"
                      value={item.price}
                      disabled={!!pendingFx}
                      onChange={(e) => update(index, "price", e.target.value)}
                    />
                  </td>
                  <td data-label="تخفیف">
                    <GroupedNumberInput
                      aria-label={`تخفیف، قلم ${index + 1}`}
                      
                      min="0"
                      step="any"
                      inputMode="decimal"
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
        <div className="invoice-line-actions">
          <button type="button" className="add-line" onClick={addRow}><Plus size={14}/> افزودن قلم</button>
          {type==='purchase'&&canCreateProduct&&<button type="button" className="add-line" onClick={()=>setNewProduct(v=>v?null:{name:'',code:'',unit:'بوری'})}><Package size={15}/> {newProduct?'بستن ثبت محصول':'ثبت محصول جدید در همین بل'}</button>}
        </div>
        {newProduct && <section className="inline-create-panel" aria-label="افزودن محصول تازه">
          <h4>محصول جدید</h4>
          <div className="invoice-fx-fields">
            <label>نام محصول<input placeholder="مثلاً برنج درجه یک" value={newProduct.name} onChange={e=>setNewProduct({...newProduct,name:e.target.value})}/></label>
            <label>واحد<input placeholder="مثلاً بوری یا کارتن" value={newProduct.unit} onChange={e=>setNewProduct({...newProduct,unit:e.target.value})}/></label>
            <label>کد محصول (اختیاری)<input value={newProduct.code} onChange={e=>setNewProduct({...newProduct,code:e.target.value})}/></label>
          </div>
          <button type="button" className="btn primary" onClick={()=>{if(onQuickProduct(newProduct))setNewProduct(null)}}><Plus size={15}/> ثبت محصول و ادامه خرید</button>
        </section>}
        {type==='purchase'&&<small className="invoice-muted-hint">اگر جنس در فهرست نیست، آن را همین‌جا ثبت کنید؛ سپس مقدار و قیمت خرید را درج کنید.</small>}
      </div>
      <section className="invoice-extras">
        <button type="button" className="invoice-more-toggle" aria-expanded={showExtras||(form.extraExpenses||[]).length>0} onClick={()=>setShowExtras(v=>!v)}><MoreHorizontal size={17}/> مصارف اضافی بل (کرایه موتر، بارگیری و سایر) <ChevronDown size={16}/></button>
        {(showExtras||(form.extraExpenses||[]).length>0)&&<div className="invoice-extra-body">
          <small>مصارف درج‌شده به جمع کل بل اضافه می‌شود. برای خریداری می‌توانید کرایه موتر، محصول گمرکی و سایر مصارف را ثبت کنید.</small>
          {(form.extraExpenses||[]).map(extra=><div className="invoice-extra-row" key={extra.id}>
            <label>نام و شرح مصرف
              <input type="text" maxLength="200" required placeholder="مثلاً کرایه موتر، مالیه، بارگیری..." value={extra.description||''} onChange={e=>updateExtra(extra.id,'description',e.target.value)}/>
            </label>
            <label>مبلغ ({currency})<GroupedNumberInput  min="0" step="any" inputMode="decimal" value={extra.amount??''} onChange={e=>updateExtra(extra.id,'amount',e.target.value)}/></label>
            <button type="button" className="icon-btn small danger invoice-extra-remove" title="حذف مصرف" aria-label="حذف مصرف" onClick={()=>removeExtra(extra.id)}><Trash2 size={16}/></button>
          </div>)}
          <button type="button" className="add-line" onClick={addExtra}><Plus size={15}/> افزودن مصرف دیگر</button>
          {!extraValid&&<p role="alert" className="form-error">مبلغ مصارف اضافی را بررسی کنید.</p>}
        </div>}
      </section>
      {saleContract?.enabled&&<section className="customer-contract-editor"><h4>مشخصات وزن جنس برای قرارداد (اختیاری)</h4><div className="contract-fields">{items.map((item,index)=><label key={index}>{item.product||`قلم ${index+1}`} — وزن فی بوجی / واحد (کیلوگرام)<GroupedNumberInput min="0" inputMode="decimal" value={item.weightPerUnit??''} onChange={event=>update(index,'weightPerUnit',event.target.value)}/></label>)}</div></section>}
      <label className="full-label">
        توضیحات
        <textarea
          rows="2"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
      </label>
      <div className="invoice-total">
        <span>اجناس: {number(roundMoney(total))} {currency} + مصارف اضافی: {number(roundMoney(expensesTotal))} {currency}</span>
        <strong>{currentRate?money(roundMoney((total+expensesTotal)*currentRate)):'نرخ تبدیل این بل تعیین نشده'}</strong>
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
          تاریخ بل
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
                    <GroupedNumberInput
                      aria-label={`بدهکار، تراکنش ${i + 1}`}
                      
                      min="0"
                      value={item.debit}
                      onChange={(e) => update(i, "debit", e.target.value)}
                    />
                  </td>
                  <td data-label="بستانکار">
                    <GroupedNumberInput
                      aria-label={`بستانکار، تراکنش ${i + 1}`}
                      
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
  let calendarMode='shamsi';
  try {calendarMode=JSON.parse(localStorage.getItem(FRESH_STORAGE_KEYS.preferences)||'{}').calendarMode||'shamsi';}catch{}
  const csv = [
    columns.map((x) => x[1]).join(","),
    ...rows.map((row) =>
      columns
        .map(([key]) => `"${String(['date','paidDate'].includes(key)?formatCalendarDate(row[key]??'',calendarMode):row[key]??'').replaceAll('"', '""')}"`)
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
      ["extraExpensesTotal", "مصارف اضافی"],
      ["currency", "ارز بل"],
      ["exchangeRate", "نرخ تبدیل"],
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
      ["debit", "دیبیت"],
      ["credit", "کریدیت"],
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

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);
