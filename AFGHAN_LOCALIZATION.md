# Afghanistan-specific form localization — React frontend

This release updates the *existing* responsive React app, rather than rebuilding it.

## Changed UI

- Customer and supplier forms: Afghan TIN label (`نمبر مالیاتی (TIN) — اختیاری`) instead of the Iran-style `شماره اقتصادی`; the underlying `economicNumber` key is kept to protect existing browser demo records.
- Customer type: choose شخصی, دکان, شرکت, مؤسسه.
- Customer, supplier, employee and warehouse forms: selectable 34 provinces; separate district/neighborhood input.
- Employee: `تخلص`, `نمبر تذکره`, optional passport, Afghan terminology for branch/place of work, contract status, and employment.
- Date fields: visual Afghan Solar Hijri controls with day, Afghan month name, and year; stored in `YYYY/MM/DD` format. Existing date strings such as `۲۲ عقرب ۱۴۰۵` still parse.
- Payroll: the employer-insurance form field and insurance dashboard tile are hidden; salary, deductions, payment confirmation, and history remain. This demo does not calculate local statutory deductions.
- Product groups: removed Iran-style sales/service tax classification. Product `SSTID` and product tax remain as previously requested.
- Existing business content and local browser records are preserved. No backend/server/database is included in this frontend package.

## Manual demo check

1. Customers → Add → check type dropdown, TIN (optional), province and district. Save; edit to verify values persist.
2. Suppliers → Add → select a province and test phone placeholder with `07…` or `+93…`.
3. Employees → Add → check Tazkira, Afghan dates, place of work, employment type and salary fields.
4. Warehouse → Add → select a province and district.
5. Sales invoices, purchase invoices, payments, salary slips and reports → date picker should offer `حمل … حوت` and keep dates in the correct order.
6. Confirm that bank-account management, My Portal and leave-request features remain removed.

## Limitations

This application is still React-only and saves demo records in each browser's localStorage; it is not a secure shared accounting backend. The date picker supports Afghan Solar Hijri month names and basic day bounds, but is not a complete leap-year-aware legal calendar library. The UI does not determine or apply Afghanistan tax or payroll legislation. TIN and SSTID are optional UI fields, not automated identity or tax validation.
