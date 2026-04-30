-- =============================================
-- MIGRATION 013: Tambah kolom image_url pada tabel pengumuman
-- Jalankan di Supabase SQL Editor
-- =============================================

ALTER TABLE pengumuman ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update index untuk memastikan performa query tetap optimal
COMMENT ON COLUMN pengumuman.image_url IS 'URL gambar/poster pengumuman (opsional), disimpan di Cloudflare R2';
