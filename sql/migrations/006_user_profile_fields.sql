-- =============================================
-- USER PROFILE FIELDS MIGRATION
-- Run in Supabase SQL Editor
-- =============================================

-- Add new profile fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS lingkungan INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS alamat TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS has_password BOOLEAN DEFAULT false;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_lingkungan ON users(lingkungan);
