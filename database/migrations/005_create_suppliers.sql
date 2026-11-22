CREATE TABLE suppliers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 name text NOT NULL,phone text,address text,province text,tin text,
 created_at timestamptz NOT NULL DEFAULT now()
);
