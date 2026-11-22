CREATE TABLE purchases (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 supplier_id uuid NOT NULL REFERENCES suppliers(id),warehouse_id uuid REFERENCES warehouses(id),
 bill_number text NOT NULL,purchased_at timestamptz NOT NULL DEFAULT now(),
 currency text NOT NULL DEFAULT 'AFN' CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 rate_to_afn numeric(18,6) NOT NULL DEFAULT 1 CHECK(rate_to_afn>0),
 goods_total_afn numeric(18,2) NOT NULL DEFAULT 0,extras_total_afn numeric(18,2) NOT NULL DEFAULT 0,
 total_afn numeric(18,2) NOT NULL DEFAULT 0,created_by uuid REFERENCES users(id),
 UNIQUE(business_id,bill_number)
);
CREATE TABLE purchase_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),purchase_id uuid NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
 product_id uuid REFERENCES products(id),product_name text NOT NULL,
 quantity numeric(18,3) NOT NULL CHECK(quantity>0),unit_cost_afn numeric(18,2) NOT NULL CHECK(unit_cost_afn>=0)
);
CREATE TABLE invoice_extra_expenses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),sale_id uuid REFERENCES sales(id) ON DELETE CASCADE,
 purchase_id uuid REFERENCES purchases(id) ON DELETE CASCADE,
 description text NOT NULL,amount_afn numeric(18,2) NOT NULL CHECK(amount_afn>=0),
 CHECK ((sale_id IS NOT NULL) <> (purchase_id IS NOT NULL))
);
