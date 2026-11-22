CREATE TABLE customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 name text NOT NULL,phone text,address text,province text,district text,
 tazkira_number text,tazkira_object_key text,tin text,
 created_at timestamptz NOT NULL DEFAULT now()
);
