CREATE TABLE expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 description text NOT NULL,amount_afn numeric(18,2) NOT NULL CHECK(amount_afn>=0),
 occurred_at timestamptz NOT NULL DEFAULT now(),paid boolean NOT NULL DEFAULT false
);
CREATE TABLE payroll (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 employee_id uuid NOT NULL REFERENCES employees(id),pay_period text NOT NULL,
 gross_afn numeric(18,2) NOT NULL CHECK(gross_afn>=0),deduction_afn numeric(18,2) NOT NULL DEFAULT 0,
 net_afn numeric(18,2) NOT NULL CHECK(net_afn>=0),paid_at timestamptz,
 UNIQUE(employee_id,pay_period)
);
CREATE TABLE employee_attendance (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),employee_id uuid NOT NULL REFERENCES employees(id),
 day date NOT NULL,status text NOT NULL CHECK(status IN ('present','absent','late','leave','holiday')),
 recorded_by uuid REFERENCES users(id),recorded_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(employee_id,day)
);
CREATE TABLE shipments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 purchase_id uuid REFERENCES purchases(id),reference text NOT NULL,
 container_count integer NOT NULL DEFAULT 1 CHECK(container_count>0),
 net_tonnes numeric(18,3) CHECK(net_tonnes>0),origin text,destination text,arrived_at date
);
CREATE TABLE shipment_costs (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),shipment_id uuid NOT NULL REFERENCES shipments(id) ON DELETE CASCADE,
 description text NOT NULL,amount_afn numeric(18,2) NOT NULL CHECK(amount_afn>=0),paid boolean NOT NULL DEFAULT false
);
CREATE TABLE journal_entries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 source_type text,source_id uuid,description text NOT NULL,occurred_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid REFERENCES users(id),posted_at timestamptz
);
CREATE TABLE journal_lines (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),entry_id uuid NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
 account_code text NOT NULL,debit_afn numeric(18,2) NOT NULL DEFAULT 0 CHECK(debit_afn>=0),
 credit_afn numeric(18,2) NOT NULL DEFAULT 0 CHECK(credit_afn>=0),
 CHECK ((debit_afn>0 AND credit_afn=0) OR (credit_afn>0 AND debit_afn=0))
);
CREATE INDEX journal_lines_entry_idx ON journal_lines(entry_id);
-- Services must check each journal sums to zero before setting posted_at.
