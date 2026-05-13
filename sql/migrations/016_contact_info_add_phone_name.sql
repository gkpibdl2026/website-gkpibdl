-- =============================================
-- MIGRATION 016: ADD PHONE_NAME TO CONTACT INFO
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tambah kolom phone_name ke tabel contact_info yang sudah ada
ALTER TABLE contact_info
  ADD COLUMN IF NOT EXISTS phone_name TEXT NOT NULL DEFAULT 'Sekretariat Gereja';
