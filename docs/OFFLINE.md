# Offline design plan

The structure follows the PDF: React UI -> IndexedDB -> sync manager -> Express API -> PostgreSQL.

`frontend/src/offline/indexedDB.js` is a minimal database opener only.
`syncManager.js` is intentionally disabled. Offline changes are **not synchronized**.

Before enabling sync, add globally unique operation IDs, server idempotency,
conflict policies, and server-controlled invoice numbering and inventory locks.
Never treat a browser's locally computed cash balance as central truth.
