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
