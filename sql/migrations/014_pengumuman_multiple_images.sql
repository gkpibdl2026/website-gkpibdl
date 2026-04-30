-- =============================================
-- MIGRATION 014: Ganti image_url tunggal menjadi image_urls array
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Hapus kolom lama
ALTER TABLE pengumuman DROP COLUMN IF EXISTS image_url;

-- Tambah kolom array baru
ALTER TABLE pengumuman ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}';

-- Berikan komentar
COMMENT ON COLUMN pengumuman.image_urls IS 'Array URL gambar pengumuman (bisa lebih dari satu)';
