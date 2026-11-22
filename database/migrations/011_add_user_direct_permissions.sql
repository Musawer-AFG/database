-- User-specific action permissions; effective rights = role permissions + grants.
-- The authoritative API must check these on EVERY mutation; React UI checks alone are unsafe.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS direct_permissions jsonb NOT NULL DEFAULT '[]'::jsonb;
COMMENT ON COLUMN users.direct_permissions IS 'Admin-assigned additional edit/delete permissions for this employee; do not trust browser-supplied roles.';
