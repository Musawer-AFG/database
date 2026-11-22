CREATE TABLE warehouses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 name text NOT NULL, location text, UNIQUE(business_id,name)
);
CREATE TABLE stock_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 product_id uuid NOT NULL REFERENCES products(id),
 warehouse_id uuid NOT NULL REFERENCES warehouses(id),
 quantity_delta numeric(18,3) NOT NULL CHECK(quantity_delta<>0),
 reason text NOT NULL,source_type text,source_id uuid,
 recorded_at timestamptz NOT NULL DEFAULT now(), recorded_by uuid REFERENCES users(id)
);
