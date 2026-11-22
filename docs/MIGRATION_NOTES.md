# Source migration notes

- Last supplied frontend: `afghan-wholesale-react-visible-print-logo-upload.zip`.
- The UI shell and many feature screens remain in `frontend/src/App.jsx` to avoid
  breaking the heavily customized application during the structural migration.
- Reusable rules moved to `frontend/src/services/`, calendar/currency/print
  functions to `src/utils/`, Dari locale to `src/locales/`, and CSS to `src/styles/`.
- Reusable UI primitives extracted to `src/components/ui/Primitives.jsx`.
- Container, trader account, and profit analysis import from distinct feature folders.
- The empty feature directories under `src/pages/` are **boundaries for gradual
  extraction**, not claims of a complete component-by-component refactor.
- PostgreSQL SQL migration files define an initial schema; they are **not applied**
  and the frontend does not connect to them yet. Legacy drafts are in
  `docs/legacy-sql-drafts/` and should not be applied alongside these migrations.
- The schema must be reviewed for row-level access/tenant checks, journal balancing,
  safe conflict resolution, secure identity file storage and automated backups.
