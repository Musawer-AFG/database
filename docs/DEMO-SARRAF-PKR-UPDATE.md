# Demo update only — روزنامچه، کهاته، صرافان، نرخ کلدار

This is the browser-local Vercel preview, not the PostgreSQL production project. All backend/database/shared files in the supplied demo have been kept unchanged. Do not copy this patch into the PostgreSQL project. Existing browser invoice quotes are migrated once (PKR per unit → PKR per 1000); historical AFN amounts remain unchanged. Use fictional data only.

## Client demonstration

1. حسابداری → روزنامچه: view automatically generated journal entries, filter by date, click معاملات امروز, or print/export. Existing manual journal entry option is available.
2. حسابداری → کهاته: choose an account, view debit/credit and running balance, or open customer/supplier/sarraf account statements.
3. Create a supplier and a credit purchase bill. Select PKR and enter the agreed rate per **1000 PKR**. Example only: 1000 PKR = 250 AFN, so 100,000 PKR = 25,000 AFN. USD/AED/EUR are quoted per one unit. When switching an existing draft to a currency with a missing rate, enter the full rate and click تایید تبدیل. The bill cannot be saved before conversion.
4. Add sufficient opening cash or record a cash deposit in صندوق نقدی using test data. Create a sarraf in حسابداری → صرافان. Register a deposit of 25,000 AFN (receipt number required). Then choose پرداخت به عرضه‌کننده توسط صراف, select the purchase bill, enter 100,000 PKR at 250 AFN per 1000, and register the confirmed remittance. Supplier balance and sarraf balance decrease by 25,000 AFN; cash is not deducted again. A customer receipt increases the sarraf account and reduces the chosen sale balance. Withdrawal moves money from sarraf to cash.
5. All sarraf transactions appear in the sarraf statement, the journal and ledger. Currency, original amount, quote and reference are retained. The sarraf account is an AFN book-value account, not separate currency wallets; conversion fees, FX gains/losses and pending remittance workflows are not implemented. This demo records confirmed transfers only and does not transmit money. Deletion of bills linked to sarraf payments is blocked.

## Verification

158 frontend tests passed; one pre-existing document-template test cannot load due to missing DOCUMENT_DEFAULT_CONTENT export in the original supplied demo. 3 unchanged scaffold backend tests passed. All 46 frontend JS/JSX modules parsed successfully. Vite build/browser verification blocked by unavailable dependencies (npm install timed out). New accounting tests: tests/sarrafCurrencyDemo.test.js. The customer’s exact original FX complaint was unclear; verify using their sample bill and rates.
