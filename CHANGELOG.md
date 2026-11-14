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
