# Afghan Wholesale Management System

This repository now follows the uploaded three-page folder-structure document.

## Project layout

```text
afghan-wholesale-system/
├── frontend/          React + Vite (existing app, reorganized)
├── backend/           Node.js + Express API starter (health/ready only)
├── database/          PostgreSQL SQL migrations, seeds, schema and backups/
├── shared/            Shared validation and JSDoc types
├── docs/              Setup, API, offline plan, architecture and history
├── scripts/           PostgreSQL migration script
├── package.json       npm workspaces and commands
└── .gitignore
```

## Run the existing React frontend

```powershell
npm install
npm run dev
```

To run tests: `npm test`  
To build the frontend: `npm run build`

See `docs/SETUP.md` and `docs/MIGRATION_NOTES.md` for details.

## Implementation status

**Working prototype:** the existing Dari RTL React UI, React Router and previous
business features. Data is currently stored **locally in the browser**.

**Backend scaffold only:** Express has `/api/health` and `/api/ready`. It does not
securely authenticate employees, save bills, enforce shifts or connect the UI.

**Database schema draft:** ten SQL migrations for a new PostgreSQL database.
They have not been deployed or reconciled with the Excel accounting history.

**Offline sync:** directories and initial store opener exist; multi-device sync
is intentionally disabled until safe idempotent endpoints are available.

Identity scans and real wholesale financial data should not be entered into the
browser-local demo as a replacement for secure production storage.

## Employee edit/delete permissions (demo)

The React prototype separates create vs. edit vs. delete permissions. Admin can grant per-employee overrides under مدیریت → نقش‌ها و صلاحیت‌ها → کاربران, or configure a role for multiple employees. Details in `docs/EDIT_DELETE_PERMISSIONS_DARI.md`. This remains client-side only; do not trust it for production security until the Express API implements authorization.
