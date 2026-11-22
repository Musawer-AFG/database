CREATE TABLE products (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 sku text,name text NOT NULL,unit text NOT NULL DEFAULT 'بوجی',
 cost_afn numeric(18,2) NOT NULL DEFAULT 0 CHECK(cost_afn>=0),
 sale_price_afn numeric(18,2) NOT NULL DEFAULT 0 CHECK(sale_price_afn>=0),
 reorder_level numeric(18,3) NOT NULL DEFAULT 0, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(business_id,sku)
);
