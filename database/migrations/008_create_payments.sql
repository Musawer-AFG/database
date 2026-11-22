CREATE TABLE payments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 sale_id uuid REFERENCES sales(id),purchase_id uuid REFERENCES purchases(id),
 customer_id uuid REFERENCES customers(id),supplier_id uuid REFERENCES suppliers(id),
 direction text NOT NULL CHECK(direction IN ('in','out')),
 amount_original numeric(18,2) NOT NULL CHECK(amount_original>0),
 currency text NOT NULL CHECK(currency IN ('AFN','USD','PKR','AED','EUR')),
 rate_to_afn numeric(18,6) NOT NULL CHECK(rate_to_afn>0),
 amount_afn numeric(18,2) NOT NULL CHECK(amount_afn>0),
 paid_at timestamptz NOT NULL DEFAULT now(),received_in_cash boolean NOT NULL DEFAULT true,
 third_party text,recorded_by uuid REFERENCES users(id),notes text
);
CREATE TABLE cash_movements (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),business_id uuid NOT NULL REFERENCES businesses(id),
 payment_id uuid UNIQUE REFERENCES payments(id),
 direction text NOT NULL CHECK(direction IN ('in','out')),
 amount_afn numeric(18,2) NOT NULL CHECK(amount_afn>0),description text NOT NULL,
 occurred_at timestamptz NOT NULL DEFAULT now(),recorded_by uuid REFERENCES users(id)
);
