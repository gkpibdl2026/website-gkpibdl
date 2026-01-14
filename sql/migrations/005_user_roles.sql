-- =============================================
-- USER ROLES & APPROVAL SYSTEM MIGRATION
-- Run in Supabase SQL Editor
-- =============================================

-- 1. Update role constraint to support new tiers
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'editor', 'jemaat'));
ALTER TABLE users ALTER COLUMN role SET DEFAULT 'jemaat';

-- 2. Add approval column for admin approval workflow
ALTER TABLE users ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;

-- 3. Add google_name column to store display name from Google
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_name TEXT;

-- 4. Update any existing admins to be approved
UPDATE users SET approved = true WHERE role IN ('admin', 'super_admin');

-- 5. Migrate super_admin to admin (consolidating roles)
UPDATE users SET role = 'admin' WHERE role = 'super_admin';

-- 6. Seed pre-approved admin emails
INSERT INTO users (firebase_uid, email, name, role, approved) VALUES
  ('seed_fourstringslide', 'fourstringslide@gmail.com', 'Admin', 'admin', true),
  ('seed_kevinlubis', 'kevinlubis2909@gmail.com', 'Kevin Lubis', 'admin', true),
  ('seed_admin_gkpibld', 'admin@gkpibld.org', 'Admin GKPI BLD', 'admin', true),
  ('seed_admin_gkpibdl', 'admin@gkpibdl.org', 'Admin GKPI BDL', 'admin', true)
ON CONFLICT (email) DO UPDATE SET role = 'admin', approved = true;

-- 7. Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_approved ON users(approved);
