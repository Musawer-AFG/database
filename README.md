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
