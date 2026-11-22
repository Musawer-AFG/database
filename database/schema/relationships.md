# Database relationships (first-pass design)

The SQL migration files define businesses, employees, roles, users, products,
warehouses, inventory movements, customers, suppliers, sales and purchase bills,
item lines, extra costs, receipts and payments, customer agreements, guarantors,
shipments, salary entries, employee attendance, cash movements and journal lines.

All monetary totals use numeric types. `rate_to_afn` records the **rate used at transaction time**;
never retroactively recalculate an old receipt using today's rate.

A sale should update stock, customer balance, cash (if paid), and accounting journals
inside **one database transaction**, with proper locking and idempotency keys. The
current React frontend does not yet call those APIs.

File scans belong in private object storage; only the storage object key should live in SQL.
