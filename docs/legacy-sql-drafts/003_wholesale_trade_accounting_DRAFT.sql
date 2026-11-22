-- FUTURE BACKEND SCHEMA DRAFT ONLY. It is NOT applied by this React ZIP.
-- Implementation MUST validate membership, shifts, permissions and business ownership
-- on every API request. Never trust role or business_id supplied by the browser.
-- Timestamps are UTC timestamptz; business dates are recorded separately as
-- validated Solar Hijri YYYY/MM/DD text (or a normalized integer YYYYMMDD).
-- Base money is AFN NUMERIC(20,2); historical original currency/rate is immutable.

CREATE TABLE IF NOT EXISTS business_shops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS business_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id uuid NOT NULL REFERENCES business_shops(id),
  username text NOT NULL,
  password_hash text NOT NULL, -- store Argon2id hash, NEVER browser/demo hashes
  is_admin boolean NOT NULL DEFAULT false,
  active boolean NOT NULL DEFAULT true,
  shift_start time,
  shift_end time,
  extra_access_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(shop_id,username)
);
CREATE TABLE IF NOT EXISTS business_roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 name text NOT NULL,
 permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
 UNIQUE(shop_id,name)
);
CREATE TABLE IF NOT EXISTS business_user_roles (
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 user_id uuid NOT NULL REFERENCES business_users(id),
 role_id uuid NOT NULL REFERENCES business_roles(id),
 PRIMARY KEY(shop_id,user_id,role_id)
);
CREATE TABLE IF NOT EXISTS trading_parties (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 party_type text NOT NULL CHECK (party_type IN ('customer','supplier','both')),
 name text NOT NULL,
 phone text,
 UNIQUE(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 name text NOT NULL,
 unit text NOT NULL,
 UNIQUE(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_invoices (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 invoice_no text NOT NULL,
 invoice_type text NOT NULL CHECK(invoice_type IN ('sale','purchase','return')),
 party_id uuid REFERENCES trading_parties(id),
 business_date text NOT NULL,
 currency char(3) NOT NULL CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 exchange_rate numeric(20,6) NOT NULL CHECK(exchange_rate>0),
 total_source numeric(20,2) NOT NULL CHECK(total_source>=0),
 total_afn numeric(20,2) NOT NULL CHECK(total_afn>=0),
 status text NOT NULL DEFAULT 'posted',
 created_by uuid NOT NULL REFERENCES business_users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(shop_id,invoice_type,invoice_no),
 UNIQUE(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_invoice_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 invoice_id uuid NOT NULL,
 product_id uuid NOT NULL,
 quantity numeric(20,4) NOT NULL CHECK(quantity>0),
 unit_price_source numeric(20,4) NOT NULL CHECK(unit_price_source>=0),
 discount_source numeric(20,2) NOT NULL DEFAULT 0,
 line_total_afn numeric(20,2) NOT NULL,
 FOREIGN KEY(shop_id,invoice_id) REFERENCES trading_invoices(shop_id,id),
 FOREIGN KEY(shop_id,product_id) REFERENCES trading_products(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_shipments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 purchase_invoice_id uuid NOT NULL,
 reference text NOT NULL,
 container_count integer NOT NULL CHECK(container_count>0),
 net_weight_tonnes numeric(20,4) NOT NULL CHECK(net_weight_tonnes>0),
 origin text,destination text,
 business_date text NOT NULL,
 created_by uuid NOT NULL REFERENCES business_users(id),
 UNIQUE(shop_id,id),
 UNIQUE(shop_id,purchase_invoice_id),
 FOREIGN KEY(shop_id,purchase_invoice_id) REFERENCES trading_invoices(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_shipment_costs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 shipment_id uuid NOT NULL,
 description text NOT NULL,
 amount_source numeric(20,2) NOT NULL CHECK(amount_source>0),
 currency char(3) NOT NULL CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 rate numeric(20,6) NOT NULL CHECK(rate>0),
 amount_afn numeric(20,2) NOT NULL CHECK(amount_afn>=0),
 paid boolean NOT NULL DEFAULT false,
 FOREIGN KEY(shop_id,shipment_id) REFERENCES trading_shipments(shop_id,id),
 UNIQUE(shop_id,id)
);
CREATE TABLE IF NOT EXISTS trading_settlements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 party_id uuid NOT NULL,
 invoice_id uuid,
 settlement_kind text NOT NULL CHECK(settlement_kind IN ('receive','pay','debit','credit')),
 amount_source numeric(20,2) NOT NULL CHECK(amount_source>0),
 currency char(3) NOT NULL CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 rate numeric(20,6) NOT NULL CHECK(rate>0),
 amount_afn numeric(20,2) NOT NULL CHECK(amount_afn>0),
 via_cash boolean NOT NULL DEFAULT true,
 third_party text,
 business_date text NOT NULL,
 created_by uuid NOT NULL REFERENCES business_users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(shop_id,party_id) REFERENCES trading_parties(shop_id,id),
 FOREIGN KEY(shop_id,invoice_id) REFERENCES trading_invoices(shop_id,id),
 UNIQUE(shop_id,id)
);
-- Posting should be a single SERVER transaction. An immutable posting id and
-- transaction reference prevent retries creating duplicate journal postings.
CREATE TABLE IF NOT EXISTS ledger_postings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 source_kind text NOT NULL,
 source_id uuid NOT NULL,
 business_date text NOT NULL,
 posted_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(shop_id,source_kind,source_id),
 UNIQUE(shop_id,id)
);
CREATE TABLE IF NOT EXISTS ledger_posting_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 posting_id uuid NOT NULL,
 account_code text NOT NULL,
 debit_afn numeric(20,2) NOT NULL DEFAULT 0 CHECK(debit_afn>=0),
 credit_afn numeric(20,2) NOT NULL DEFAULT 0 CHECK(credit_afn>=0),
 CHECK ((debit_afn>0 AND credit_afn=0) OR (credit_afn>0 AND debit_afn=0)),
 FOREIGN KEY(shop_id,posting_id) REFERENCES ledger_postings(shop_id,id)
);
-- The application service must also enforce sum(debits) = sum(credits)
-- at COMMIT (or a deferred constraint trigger). Not enforced by this draft.
CREATE TABLE IF NOT EXISTS trading_import_batches (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 original_file_name text NOT NULL,
 source_sha256 text NOT NULL,
 status text NOT NULL DEFAULT 'staged' CHECK(status IN ('staged','reviewed','approved','rejected')),
 reviewed_by uuid REFERENCES business_users(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(shop_id,source_sha256)
);
CREATE TABLE IF NOT EXISTS trading_import_rows (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 batch_id uuid NOT NULL REFERENCES trading_import_batches(id),
 sheet_name text NOT NULL,
 excel_row integer NOT NULL,
 parsed_json jsonb NOT NULL,
 proposed_target text,
 approved boolean NOT NULL DEFAULT false,
 UNIQUE(batch_id,sheet_name,excel_row)
);
CREATE TABLE IF NOT EXISTS trading_audit_events (
 id bigserial PRIMARY KEY,
 shop_id uuid NOT NULL REFERENCES business_shops(id),
 actor_id uuid REFERENCES business_users(id),
 action text NOT NULL,
 entity_type text NOT NULL,
 entity_id uuid,
 metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
 recorded_at timestamptz NOT NULL DEFAULT now()
);
-- Required before production: RLS/tenant policy, server auth, shift enforcement,
-- password reset, document encryption, atomic cash/stock updates, immutable
-- reversals instead of hard DELETE, backups, idempotency, and reconciliation.
