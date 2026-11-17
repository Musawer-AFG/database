**Latest additions:** theme color and dark mode, customer Tazkira fields, per-invoice USD/PKR rates, optional extra invoice charges, inline customer/supplier/product creation. See [NEW_INVOICE_AND_THEME_FEATURES_DARI.md](NEW_INVOICE_AND_THEME_FEATURES_DARI.md).

# شروع جدید — ایجاد حساب مدیر و ورود اجباری

این نسخه با معلومات تجارتی خالی آغاز می‌شود. بار اول، فرم ساخت عمده‌فروشی و مدیر سیستم نمایش داده می‌شود؛ پس از ذخیرهٔ **کد بازیابی**، صفحهٔ ورود باز می‌شود. بدون ورود، داشبورد نمایش داده نمی‌شود.

بنرهای اخطاری نمایشی و نمودارهای نمونه از رابط حذف شده‌اند. پیام‌های خطای فورم و محدودیت دسترسی همچنان باقی می‌مانند.

**توجه:** این نسخه همچنان فقط React و ذخیره‌سازی مرورگر است؛ با دیتابیس/بک‌اند واقعی متصل نیست. نسخهٔ جدید کلیدهای ذخیره‌سازی جداگانه دارد؛ معلومات قبلی خودکار انتقال نمی‌یابد و پاک نمی‌شود.

راهنمای کامل: `FRESH_START_DARI.md`.

---

# آخرین تغییرات: ورود، ارز و شیفت کارمندان

- **صفحه ورود در آغاز:** نخستین بار، ساخت حساب مدیر و کد بازیابی نمایش داده می‌شود؛ پس از آن نام کاربری و رمز برای ورود لازم است.
- **شیفت:** ساعت پیش‌فرض کارمندان ۰۸:۰۰ تا ۲۰:۰۰ به وقت افغانستان؛ مدیر می‌تواند زمان‌ها را تغییر دهد یا برای یک شب دسترسی اضافی بدهد.
- **USD و PKR:** نرخ تبدیل را مدیر در تنظیمات وارد می‌کند. محصولات، بل‌ها و دریافت قرضداری به افغانی تبدیل می‌شوند؛ ارزش اصلی و نرخ بل نگه‌داری می‌گردد.
- **امنیت:** همچنان نسخه نمایشی React با localStorage است و **دیتابیس یا احراز هویت سروری ندارد**. برای کار واقعی/اشتراک معلومات بین کاربران از سرور امن استفاده شود.
- راهنمای کامل: `LOGIN_CURRENCY_SHIFTS_DARI.md`

---

# عمده‌فروشی افغانستان — React Frontend

An Afghan Dari / RTL wholesale management **frontend demo** built with React and Vite.

## Run locally

Requires Node.js 18+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (normally `http://localhost:5173`).

To build a deployable version:

```bash
npm run build
```

The output is in `dist/`. For Vercel or Netlify, use `npm run build` and `dist` as the output directory.

## Responsive updates

This package is an update to your uploaded `afghan-wholesale-react-ui(1).zip` project, **not a new or reduced one-page design**.

- Smartphone layout supports 320, 360, 375, 390, 430 and 600 pixel widths.
- Tablet and small-desktop layouts have fewer columns and larger fields.
- Inputs use 16px text and 48px minimum heights on phones to remain readable and avoid iOS zoom-on-focus.
- Product/customer/invoice listings change into vertically stacked, labelled cards on narrow screens.
- Sales/purchase and accounting entry line items change from a cramped 6-column table into labelled input cards.
- The attendance grid stays a swipeable horizontal table because it has 30 days of columns.
- The mobile search field stays visible below the top bar.
- The right-side sidebar remains expandable, with a slide-out drawer on mobile.
- Forms and dialogs stay within the viewport and scroll internally when necessary.
- The original Apple-inspired visual styling, Afghan Dari text, RTL reading direction and AFN formatting remain.

All mobile rules are kept in `src/responsive.css` rather than mixed into the legacy stylesheet. That file is imported at the end of `src/main.jsx`.

## Existing customizations retained

- Right-side collapsible navigation and category dropdowns
- «داشبورد» terminology
- Afghan Dari and Solar Hijri month names
- AFN currency display
- No «پورتل من» or leave-request feature
- No bank-account management screens
- No sales invoice tax fields; product tax is still present
- Saving a bill does not open an extra confirmation dialog

## Important limitations

This is **still a React-only demo**. It stores sample data in browser `localStorage`. It is **not** connected to Node.js, PostgreSQL, or Supabase. Information entered on one device will not appear on another.

The React JSX was syntax-checked. The responsive CSS was inspected in Chromium using representative UI markup across viewport widths from 320 to 1440px, and no page-level horizontal overflow was found in those layout checks. A complete Vite build and end-to-end verification of every page could not be performed because dependencies were not available for installation in the current environment.

Do not enter real financial or personal data until a proper backend, authentication, authorization and backups are implemented.

## Customer credit payments (frontend demo)
1. Create a customer in **مشتریان**.
2. Create a sale in **بل‌های فروش** and select that customer. Enter the initially paid amount, which can be 0.
3. Open **مشتریان → مشتریان بدهکار** to see sales invoices with outstanding balances.
4. Press **ثبت دریافت پول**, enter a positive amount not exceeding the balance, then save.
5. The balance is reduced, the payment is recorded in invoice history, and the entry disappears from the debtors list when fully paid.

All demo data is stored in this browser's localStorage. Do not use for real client accounting or rely on it as a reliable financial record.

## Updated: warehouse, payroll and reports

### Working inventory demonstration

Go to `محصولات`, add a product with **موجودی آغازین** and choose **گدام عمومی** or a created warehouse. Purchases add to current stock, sales deduct stock, sale returns add stock, and manual movements/warehouse transfers are entered through **داشبورد گدام → ثبت حرکت گدام**. Stock figures are *derived* from records and recalculate if an invoice is deleted. Overselling a warehouse is blocked for new invoices.

### Working payroll demonstration

Create an employee and set **معاش ماهانه**. Then open **معاشات و دستمزد → محاسبه معاش**; choose an Afghan month and enter base salary, bonus and deductions. Save a draft salary slip and press **ثبت پرداخت** to mark it paid. Only one slip per employee/month is permitted. These calculations are simple examples and do not implement Afghan labor/tax/insurance obligations.

### Reports

The sidebar now includes **گزارش عمومی**, **تراز آزمایشی**, **گزارش روزنامه**, **گزارش کل** and **گزارش اسناد**. Date range filtering uses Afghan months (for example `1405/08/21`). CSV export uses the displayed, filtered records. Reports are based on current browser data.

**Accounting limitation:** Sales/purchase bills are included in the *general business report*, but are NOT automatically posted as balanced journal entries in this frontend. Consequently, the trial balance, general ledger and journal reports show only the manually recorded journal entries. Do not use them as formal financial statements.

For step-by-step test cases, see `DEMO_QA.md`.

### Run the included calculation tests

Requires Node.js 20+ for the built-in test runner:

```bash
npm run test
```

These tests verify the calculation helpers. They do not replace browser-level or production end-to-end testing.

## Afghanistan-localized form fields

See `AFGHAN_LOCALIZATION.md` for changes to TIN, Tazkira, provinces, districts, Afghan Solar Hijri date pickers and payroll fields. This is an update to the existing frontend project, not a separate database implementation.

## Dashboard and sidebar update (Dari / Afghanistan)

- `صفحه اصلی → داشبورد` now includes **مقایسه فروشات و خریداری‌ها** (sales vs purchases by Afghan month), **تحلیل قرضداری مشتریان** (unpaid sales invoice balances aged by invoice date), and **اجناس با موجودی کم** (stock at/below its configured reorder point).
- Click **سال مالی** in the sidebar to pick a year; the yearly summary cards and sales/purchase charts use that year. Debt balances and current inventory are snapshots of all records, *not* restricted to the chosen fiscal year.
- Click **تنظیمات** and use **نام عمده‌فروشی** to set your company name; it immediately replaces the default sidebar heading. Settings are persisted using the new `afghan-wholesale-fresh-v1-preferences` browser storage key.
- Click **راهنمای سامانه** for an interactive help page with links to business sections.
- Click the bottom **user profile** or top-bar user chip to edit the display name and job title. Browser-local demo roles and login are included; they are not server-enforced.
- The top-bar bell displays a low-stock notice when relevant.
- New installations use isolated `afghan-wholesale-fresh-v1-*` keys and begin empty. Older records in `afghan-wholesale-ui-*` are not deleted, but are not automatically imported.

**Privacy / limitations:** This is still a React-only prototype without user accounts or a shared database. Browser storage is device- and origin-specific; do not enter real customer financial information into a public demo. This version does not claim production-quality financial-year closing, audit trails, or user permissions.

### Running

```bash
npm install
npm run dev
npm test
npm run build
```

If deploying to Vercel, keep `npm run build` as the build command and `dist` as the output directory. Do not push `node_modules` to GitHub.

The three new charts automatically show a **clearly labelled sample preview** on a newly empty installation. Toggle **دیدن نمودارهای واقعی** to see empty-state charts using your own records. This preview never writes invoices/products to storage. When the user starts entering real records, the dashboard automatically switches to real graphs.

### Financial year and roles (demo edition)

- Switching to a fiscal year with no dated business records is blocked with a Dari message; the selected year remains unchanged.
- Open **مدیریت → نقش‌ها و صلاحیت‌ها** to create/edit/delete roles and assign them to users.
- Restrict section visibility, mutations, money collection and wage payments using role permissions; preview another user's UI with **آزمایش دسترسی**.
- The original admin cannot be deleted. A role assigned to users cannot be deleted until reassignment.
- These are **localStorage-based interface demonstrations only**. No authentication, shared database, or server-enforced role security exists yet. See `ROLES_AND_FINANCIAL_YEAR_DARI.md` and the future schema template under `postgres/`.


## ورود کارمندان (نمایشی)

کاربر را اکنون می‌توان از فهرست کارمندان انتخاب کرد و برای او نام کاربری، رمز موقت و نقش تعیین نمود. صفحهٔ ورود نمایشی پس از تنظیم رمز مدیر فعال می‌شود. **این ورود فقط در مرورگر همان دستگاه کار می‌کند و برای استفادهٔ واقعی یا اشتراک بین دستگاه‌ها امن نیست.** راهنما: `EMPLOYEE_LOGIN_DARI.md`.

### Update: working header controls and demo password recovery

The topbar user dropdown now opens profile/settings/roles/log-out actions. The Afghan calendar shows saved records for a selected day. Global search locates products, parties, invoices, employees and warehouses (only in sections the user can view). On phone, use the search input below the topbar.

To test login, open **مدیریت ← نقش‌ها و صلاحیت‌ها**, activate demo login and privately save the one-time-displayed administrator recovery code. Create employees and their users as before. Log out via the top account menu. The login page has a **رمز را فراموش کرده‌ام** flow using codes issued by the admin in Roles. See `HEADER_LOGIN_UPDATE_DARI.md`.

**Not secure for real use:** data, roles, account hashes and recovery-code hashes are saved only in the same browser's local storage. Staff cannot use these accounts on different devices. Do not use real personal/financial records before implementing server-side authentication and authorization.


### اصلاح ساعت کار کارمندان
در نسخهٔ تازه، پیش‌نمایش کارمند در خارج از شیفت قفل می‌شود، ساعت افغانستان و وضعیت ورود در صفحهٔ نقش‌ها دیده می‌شود، با تغییر ساعت شیفت اجازهٔ اضافی قبلی پاک می‌شود و تب‌های همان مرورگر تغییرات را همگام می‌کنند. راهنما: `SHIFT_ACCESS_FIX_DARI.md`. حساب مدیر اصلی مستثنا است. این نسخه همچنان فقط نمایش React است و کنترل امنیتی سرور ندارد.


## Latest: theme & invoice workflow fixes

See `THEME_AND_INVOICE_FIXES_DARI.md` for fixes to dark/light/color hover states; customer/supplier full creation forms returning to the invoice; free-text invoice expenses; and conditional USD/PKR exchange-rate inputs.

## افزوده‌های جدید — صندوق و حاضری و عکس تذکره

از «حسابداری ← صندوق نقدی» تاریخچه پول‌های دریافت‌شده و پرداخت‌شده را ببینید. هنگام راه‌اندازی اولیه می‌توانید پول آغازین صندوق را وارد کنید. معاش پرداخت‌شده، مصارف، پرداخت نقدی بل خرید، و بدهی پرداخت‌شده عرضه‌کننده از صندوق کم می‌شوند؛ دریافت پول از فروش و مشتری به صندوق اضافه می‌شود.

در «منابع بشری ← حاضری» حالا می‌توانید حاضری هر کارمند را برای روزهای ماه ثبت کنید. در فورم «ایجاد مشتری» و «افزودن کارمند» می‌توانید اسکن تذکره به‌شکل JPG/PNG/WebP/PDF اضافه کنید. رنگ و حالت تاریک نیز در «تنظیمات» و صفحه ساخت فروشگاه جدید قرار دارند.

راهنمای کامل: `CASH_ATTENDANCE_IDENTITY_DARI.md`. **این پروژه هنوز React-localStorage + IndexedDB است؛ جایگزین دیتابیس امن PostgreSQL یا نگهداری اسناد حساس در سرور نمی‌شود.**


## تازه‌ترین تغییرات: رنگ، جزئیات مشتری/کارمند و حاضری
راهنمای `THEME_DETAILS_ATTENDANCE_DARI.md` را ببینید. دکمهٔ تاریک/روشن در بالای صفحه است؛ رنگ‌ها از تنظیمات تغییر می‌کنند. در فهرست مشتریان یا کارمندان روی ریکارد کلیک کنید تا معلومات کامل باز شود. روز جمعه رخصتی عمومی و روزهای کاری به‌صورت پیش‌فرض حاضر نمایش داده می‌شوند، ولی مسئول باید غیابت را اصلاح کند.
