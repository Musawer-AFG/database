# Setup on Windows (PowerShell)

1. Extract `afghan-wholesale-system.zip`.
2. Open the `afghan-wholesale-system` folder in VS Code / PowerShell.
3. Run `npm install` at the **repository root** (Node.js 20+).
4. Run `npm run dev`. Open the URL printed by Vite.
5. For frontend-only Vercel deployment use the repository root `vercel.json`,
   or set Vercel Root Directory to `frontend` and use `npm run build`, output `dist`.

Backend scaffold:
1. Create `backend/.env` from `backend/.env.example` and update DATABASE_URL.
2. Run `npm run dev:backend` (health endpoint on port 3001 by default).
3. In a separate shell, run `npm run db:migrate` **only on a new empty PostgreSQL database**.

Currently, the frontend does not send its records to the API. All existing screens
continue to use local browser data; changing the folders does not migrate those
records into PostgreSQL. Never upload real tazkira images or sensitive shop data
until protected file storage and authenticated APIs are ready.
