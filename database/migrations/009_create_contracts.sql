CREATE TABLE customer_contracts (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 customer_id uuid NOT NULL REFERENCES customers(id),version integer NOT NULL DEFAULT 1,
 down_payment_percent numeric(5,2) NOT NULL CHECK(down_payment_percent BETWEEN 0 AND 100),
 payment_due_days integer NOT NULL DEFAULT 0 CHECK(payment_due_days>=0),
 clauses text NOT NULL DEFAULT '',design jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(customer_id,version)
);
CREATE TABLE contract_guarantors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),contract_id uuid NOT NULL REFERENCES customer_contracts(id) ON DELETE CASCADE,
 name text NOT NULL,father_name text,phone text,tazkira_number text,
 tazkira_object_key text,occupation text
);
