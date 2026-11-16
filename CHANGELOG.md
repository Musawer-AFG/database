## Sidebar navigation improvement
- Removed «خروج از حساب» from the sidebar to leave more vertical space for navigation.
- Logout remains under the account dropdown in the upper navigation bar for signed-in users.
- Sidebar section scrolling remains independent on desktop and mobile.

## November 2026 — Start-screen login, currency conversion, employee schedules

- Added first-run administrator setup and login-first experience, keeping local demo recovery.
- Added Kabul-time employee shift limits (default 08:00–20:00) and expiring after-hours admin overrides.
- Added administrator-controlled USD/PKR to AFN rates in Settings.
- Added currency conversion to sales/purchase/return invoices, customer debt payments and product prices, preserving AFN as the accounting currency.
- Added currency and schedule tests, responsive UI adjustments, a PostgreSQL migration draft, and a Dari setup guide.
- All restrictions remain client-side demo logic; the SQL is a draft and is not connected.

## Brand initial alignment fix
- Centered the blue sidebar logo initial optically, including the Arabic letter «ع».
- The symbol still derives automatically from the first letter of the shop name in settings.
- No data storage or feature changes.

# Changes

## Bank-account feature removal

- Removed bank-account management from the accounting sidebar, page routing, and editable entity definitions.
- Removed bank details from the employee form.
- Changed the dashboard from bank balance to unpaid sales invoices.
- Filtered unsupported legacy fields when reading local demo data.
- Kept the Apple-inspired light theme, right-hand sidebar, Dari/RTL content and expandable navigation sections.

## Verification

- Project archive contents verified.
- No bank-related labels or feature references remain in the bundled source or documentation.
- React JSX syntax parsed successfully with TypeScript's JSX parser.
- Dependency installation timed out, so a complete Vite build was not verified.

## Mobile and tablet readability update

- Added a dedicated `src/responsive.css` layer and a visible mobile search field.
- Converted generic listings and the invoice list to labelled cards on small displays.
- Converted sales/purchase item editors and journal entries to card-style form rows on mobile/tablet.
- Enlarged labels, text fields, action buttons and touch targets.
- Improved responsive column layouts at tablet/small-desktop widths (761–1100px).
- Kept the 30-day attendance view horizontally scrollable with a visible instruction and accessible focus region.
- Maintained the right-side menu, Afghan Dari, RTL, AFN and previously removed modules.

## Customer debt collection
- Added **مشتریان بدهکار** under مشتریان. Shows open sales bills and total receivables derived from invoice balances.
- Added **ثبت دریافت پول** on unpaid sales invoices and the debtor list. Partial/full payments update the original bill, paid amount and outstanding balance.
- Payment date, notes and payment history are stored with each invoice in browser localStorage.
- Settled invoices automatically leave the debtor list. If a customer has other unpaid sales bills, they remain listed.
- Frontend-only demo: there is no shared database, authentication, accounting ledger, or multi-device synchronization.

## Functional warehouse, payroll and report fixes

- Added reusable, tested calculations in `src/business.js`, including Afghan date filters.
- Added opening stock and default warehouse selection to the product form.
- Warehouse dashboard now uses actual purchase, sale, return, and manual stock movement records.
- New **ثبت حرکت گدام** modal handles stock increases, decreases and warehouse transfers.
- New sales cannot exceed stock at the selected warehouse; deletion of a purchase bill cannot create new negative stock.
- Added monthly salary to employee creation, a salary slip form, deductions/allowances, prevention of duplicate employee-month slips, and marking slips as paid.
- General business report now shows real totals; journal report, account ledger, document report and trial balance now display manual journal data, with working date filters, CSV export and print.
- Removed static placeholder zero figures in the warehouse/payroll/reports sections.
- Nine pure calculation tests are included: `npm run test`.
- Still frontend-only: no database, shared data, automatic accounting ledger posting, or verified production payroll rules.

## Afghan-specific forms and calendars
- Localized customer/supplier/employee/warehouse input labels and choices to Afghanistan.
- Added all 34 provinces and district/neighborhood fields.
- Changed customer/supplier business-tax field label to optional Afghan TIN, preserving the old stored data key.
- Added Afghan day-month-year selector to invoices, customer collections, salaries, expenses, journals, inventory transfers, report date filters, and employee dates.
- Removed Iranian-style product-group electronic tax classification and the employer-insurance UI (kept product SSTID and product tax).
- Preserved previous right-sidebar, responsive mobile layout, bank-account removal, payments, inventory, salary and report functionality.

## Updated dashboard + interactive sidebar
- Added live (record-driven) sales/purchases monthly chart, customer debt aging, and low-stock graph to the home dashboard.
- Replaced inactive financial-year sidebar decoration with a saved year selector affecting annual dashboard reports and summary cards.
- Added settings for wholesale shop name; updates sidebar brand and footer.
- Added working help page, editable profile display labels, and low-stock notification popover.
- Kept business data in the existing browser-storage key and preferences in an independent key.
- Added tests for month aggregation, Persian calendar day conversion, debt aging, low stock, and fiscal year choices.

## 2026-11-16 — Fiscal year & demo roles
- Prevent switching to an empty fiscal year; show Dari message and retain selected year.
- Add local-only roles and user management with configurable view/manage/collect/pay permissions.
- Hide unauthorized navigation and actions, and validate mutation handlers within React.
- Protect the primary administrator, block deletion of assigned roles, and add safe demo impersonation.
- Provide tests and a future PostgreSQL schema draft. No backend authentication or security is claimed.


### ورود کارمندان — Demo-only
- «افزودن کاربر»: انتخاب از فهرست کارمندان و جلوگیری از حساب‌های تکراری.
- نام کاربری مستقل از ایمیل، رمز موقت و امکان ساخت / کاپی معلومات ورود.
- تنظیم رمز مدیر و صفحهٔ ورود اختیاری روی همان مرورگر، همراه با خروج و تغییر رمز موقت در ورود اول.
- غیرفعال‌سازی حساب، ریست رمز توسط مدیر و حفظ نقش‌ها.
- احراز هویت واقعی و محدودیت‌های سروری هنوز وجود ندارند.

## Header, Afghan calendar, and login recovery update (2026-11-16)
- User dropdown in the top bar now opens a real account menu with permission-filtered actions and sign out.
- Afghan calendar button opens a month/day selector, displays stored daily transactions, and links to matching sections.
- Header search now finds customers, suppliers, products, invoices, employees and warehouses, respects view permissions, and navigates to matching lists. It is accessible on phones.
- Login screen now includes a show/hide password control and a recovery screen using one-time browser-local recovery codes issued by the administrator.
- On activation, the admin is shown a recovery code; existing demo accounts can generate theirs in the Roles page. Codes expire after 24 hours for employees / 365 days for administrators; old codes become invalid when passwords change.
- This is a **client-only demonstration**, not production authentication. Backend sessions, server-side password recovery, throttling, and a database remain unimplemented.


## Shift access regression fix
- Fixed role preview bypassing employee working hours.
- Added live Kabul-time status to employee management.
- Reset previously granted extra access when start/end time changes.
- Recheck browser session every 5 seconds and after visibility/focus, and synchronize access changes across browser tabs.
- Added regression tests and user instructions.

## 2026-11-16 — لوگوی عمده‌فروشی و بازگشت به داشبورد
- در مرحلهٔ ساخت حساب مدیر می‌توان عکس اختیاری برای لوگوی منوی سمت راست انتخاب کرد (JPG/PNG/WebP).
- عکس به تصویر کوچکِ مناسب تبدیل می‌شود؛ بدون عکس، حرف اول نام عمده‌فروشی نمایش داده می‌شود.
- لوگو از صفحهٔ تنظیمات قابل تعویض یا حذف است.
- کلیک روی لوگو یا نام عمده‌فروشی در بالای سایدبار کاربر را با رعایت صلاحیت‌ها به صفحهٔ اصلی می‌برد.

## Settings password confirmation
- Added a fresh password challenge before saving Settings (shop name, logo, fiscal year, USD/PKR rates).
- Protected fiscal-year switching from the right sidebar with the same confirmation.
- Replaced browser confirmation dialogs for clearing transactions and resetting the shop with a password dialog, an explicit reminder and irreversible-action acknowledgment.
- No data or settings are changed when an action is cancelled or a password is incorrect.
- Security is still frontend-only; a backend must enforce authorization in production.
