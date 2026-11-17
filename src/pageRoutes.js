/** Stable URL paths for every existing sidebar and account page. */
export const PAGE_PATHS = Object.freeze({
  "dashboard": "/dashboard",
  "sales": "/sales",
  "purchases": "/purchases",
  "returns": "/returns",
  "journal": "/accounting/journal",
  "accounts": "/accounting/accounts",
  "expenses": "/accounting/expenses",
  "cashRegister": "/accounting/cash-register",
  "reports": "/reports",
  "trialBalance": "/reports/trial-balance",
  "journalReport": "/reports/journal",
  "ledgerReport": "/reports/ledger",
  "documentReport": "/reports/documents",
  "warehouseDashboard": "/warehouse",
  "products": "/warehouse/products",
  "groups": "/warehouse/groups",
  "warehouses": "/warehouse/locations",
  "employees": "/employees",
  "payroll": "/employees/payroll",
  "attendance": "/employees/attendance",
  "customersDashboard": "/customers/overview",
  "customers": "/customers",
  "debtors": "/customers/debtors",
  "suppliers": "/suppliers",
  "settings": "/settings",
  "roles": "/roles",
  "profile": "/profile",
  "help": "/help"
});
const PATH_TO_PAGE = Object.freeze(Object.fromEntries(Object.entries(PAGE_PATHS).map(([page,path]) => [path,page])));
export const pathForPage = (page) => PAGE_PATHS[page] ?? PAGE_PATHS.dashboard;
export function pageForPath(pathname) {
  const normalized = ('/' + String(pathname || '').replace(/^\/+|\/+$/g, '')).toLowerCase();
  return PATH_TO_PAGE[normalized] ?? null;
}
export function activeSidebarPage(pathname, pageId) {
  return pageForPath(pathname) === pageId;
}
