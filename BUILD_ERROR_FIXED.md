# Vite duplicate declaration fix

The Vite error `Identifier 'roleById' has already been declared` was caused by two
`const roleById` definitions in the `RolesPage` component of `src/main.jsx`.

This edition keeps the first declaration and removes the duplicate declaration.
It preserves the navbar controls, login and password-recovery demo, business
pages, and previous data storage keys.

To test locally:

```powershell
npm install
npm run dev
```

To validate the logic:

```powershell
npm test
```

These are browser-local demo credentials and not production security.
