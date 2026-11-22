-- Accounts, businesses, roles, and employee logins.
CREATE TABLE businesses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 name text NOT NULL, logo_object_key text,
 opening_cash_afn numeric(18,2) NOT NULL DEFAULT 0,
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE employees (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id),
 full_name text NOT NULL, phone text, position text, salary_afn numeric(18,2) NOT NULL DEFAULT 0,
 tazkira_number text, tazkira_object_key text, active boolean NOT NULL DEFAULT true,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE roles (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id),
 name text NOT NULL, permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
 UNIQUE(business_id,name)
);
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), business_id uuid NOT NULL REFERENCES businesses(id),
 employee_id uuid REFERENCES employees(id), role_id uuid REFERENCES roles(id),
 username text NOT NULL, password_hash text NOT NULL, active boolean NOT NULL DEFAULT true,
 shift_start time, shift_end time, extra_access_until timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(business_id,username)
);
CREATE TABLE recovery_codes (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 code_hash text NOT NULL, expires_at timestamptz NOT NULL, used_at timestamptz
);
