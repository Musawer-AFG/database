-- FUTURE BACKEND SCHEMA ONLY. This file is NOT connected to the current React-only demo.
-- Requires PostgreSQL with pgcrypto for gen_random_uuid(), or PostgreSQL 13+ with built-in UUID support.
-- SECURITY: do not trust React/localStorage roles; authorize EVERY endpoint against the server's session.

CREATE TABLE IF NOT EXISTS app_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name_dari TEXT NOT NULL,
  is_system BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT app_roles_slug_check CHECK (length(slug) BETWEEN 1 AND 80)
);
CREATE TABLE IF NOT EXISTS app_permissions (
  code TEXT PRIMARY KEY,
  name_dari TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS app_role_permissions (
  role_id UUID NOT NULL REFERENCES app_roles(id) ON DELETE CASCADE,
  permission_code TEXT NOT NULL REFERENCES app_permissions(code) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_code)
);
CREATE TABLE IF NOT EXISTS app_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID UNIQUE, -- server authentication identity; set and verify server-side
  employee_id UUID UNIQUE, -- link to the employee table when employee IDs are UUIDs
  username TEXT UNIQUE, -- unique login alias; authentication handled on server
  display_name TEXT NOT NULL,
  job_title TEXT NOT NULL DEFAULT '',
  role_id UUID NOT NULL REFERENCES app_roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_app_users_role_id ON app_users(role_id);
CREATE INDEX IF NOT EXISTS idx_app_role_permissions_permission_code ON app_role_permissions(permission_code);

-- This SQL only defines the relational structure. Do not deploy as a security system
-- until authentication, row policies (if needed), and authorization middleware exist.

-- Employee link must be enforced with a FOREIGN KEY to your actual employees table.
-- Do not add password hashes to app_users when using Supabase Auth: it manages credentials.
-- NEVER allow browser-side admin role assignment without authenticated server authorization.
