CREATE TABLE sales (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 customer_id uuid NOT NULL REFERENCES customers(id),warehouse_id uuid REFERENCES warehouses(id),
 bill_number text NOT NULL,sold_at timestamptz NOT NULL DEFAULT now(),
 currency text NOT NULL DEFAULT 'AFN' CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 rate_to_afn numeric(18,6) NOT NULL DEFAULT 1 CHECK(rate_to_afn>0),
 goods_total_afn numeric(18,2) NOT NULL DEFAULT 0,extras_total_afn numeric(18,2) NOT NULL DEFAULT 0,
 total_afn numeric(18,2) NOT NULL DEFAULT 0,
 contract_snapshot jsonb,created_by uuid REFERENCES users(id),
 UNIQUE(business_id,bill_number)
);
CREATE TABLE sale_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
 product_id uuid REFERENCES products(id),product_name text NOT NULL,
 quantity numeric(18,3) NOT NULL CHECK(quantity>0),unit_price_afn numeric(18,2) NOT NULL CHECK(unit_price_afn>=0),
 discount_afn numeric(18,2) NOT NULL DEFAULT 0 CHECK(discount_afn>=0)
);
