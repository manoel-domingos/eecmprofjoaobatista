-- Table: app_users
CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'MONITOR',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Seed initial users if table is empty
INSERT INTO app_users (email, name, role)
SELECT 'manoeldomingos2@gmail.com', 'Manoel', 'GESTOR'
WHERE NOT EXISTS (SELECT 1 FROM app_users);

INSERT INTO app_users (email, name, role)
SELECT 'maykon', 'Maykon', 'GESTOR'
WHERE NOT EXISTS (SELECT 1 FROM app_users WHERE email = 'maykon');

-- Add RLS (optional but good)
ALTER TABLE app_users ENABLE ROW LEVEL SECURITY;

-- Policy: everyone can read users (needed for role matching)
CREATE POLICY "Everyone can read users" ON app_users FOR SELECT USING (true);

-- Policy: only GESTOR can modify users (handled in app logic, but DB level is better)
-- This is tricky because we don't have a direct role in Supabase auth metadata yet.
-- For now, keep it simple or allow authenticated users to read.
