# API status

`GET /api/health`: checks the Express process without requiring PostgreSQL.

`GET /api/ready`: checks connection to the database when `DATABASE_URL` is set.

**No business CRUD or login endpoints are connected yet.** The React application
continues to use browser-local storage. Never interpret a successful health check
as evidence that employee authentication, role restrictions, payment processing,
or offline sync is production-ready.

Implement routes under `backend/src/modules/<feature>/` with validation,
server authentication/authorization, audit logs, and database transactions.
