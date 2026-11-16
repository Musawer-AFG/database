-- DRAFT ONLY. NOT connected to this React app. Adapt to the actual backend schema.
-- All authorization MUST be enforced by trusted API code before returning records.
-- Prefer PostgreSQL timestamptz and server time to client-provided clock values.
CREATE TABLE IF NOT EXISTS employee_access_schedule (
  user_id uuid PRIMARY KEY,
  shift_start time NOT NULL DEFAULT '08:00',
  shift_end time NOT NULL DEFAULT '20:00',
  timezone text NOT NULL DEFAULT 'Asia/Kabul',
  temporary_access_until timestamptz,
  updated_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT distinct_shift CHECK (shift_start <> shift_end)
);
CREATE TABLE IF NOT EXISTS currency_rates (
  currency_code varchar(3) PRIMARY KEY CHECK (currency_code IN ('USD','PKR')),
  afn_per_unit numeric(20,8) NOT NULL CHECK (afn_per_unit > 0),
  set_by uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
-- Suggested additional invoice fields, add to your actual table when it exists:
-- currency_code varchar(3) NOT NULL DEFAULT 'AFN';
-- exchange_rate_afn numeric(20,8) NOT NULL DEFAULT 1;
-- source_total numeric(20,2);
-- total_afn numeric(20,2) NOT NULL;
-- Server access middleware must verify: authenticated user, assigned role,
-- user account active, current time within the Kabul schedule OR exception expiry,
-- and record-level authorization on EVERY read and write API request.
