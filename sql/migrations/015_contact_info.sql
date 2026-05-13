-- =============================================
-- MIGRATION 015: CONTACT INFO TABLE
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Tabel untuk menyimpan informasi kontak publik (satu baris konfigurasi)
CREATE TABLE IF NOT EXISTS contact_info (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Alamat
  address_line1 TEXT NOT NULL DEFAULT 'Jl. Turi Raya No.40',
  address_line2 TEXT NOT NULL DEFAULT 'Tj. Senang, Kec. Tj. Senang',
  address_line3 TEXT NOT NULL DEFAULT 'Kota Bandar Lampung, Lampung 35141',
  -- Telepon
  phone TEXT NOT NULL DEFAULT '+62 812-3456-7890',
  phone_hours TEXT NOT NULL DEFAULT 'Senin - Sabtu, 08.00 - 16.00 WIB',
  -- Email
  email TEXT NOT NULL DEFAULT 'info@gkpibdl.org',
  -- Sosial Media
  facebook_url TEXT DEFAULT 'https://facebook.com/gkpibandarlampung',
  instagram_url TEXT DEFAULT 'https://instagram.com/gkpibandarlampung',
  youtube_url TEXT DEFAULT 'https://youtube.com/@gkpibandarlampung',
  -- Google Maps embed URL (opsional)
  maps_embed_url TEXT DEFAULT '',
  -- Timestamps
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE contact_info ENABLE ROW LEVEL SECURITY;

-- Public bisa baca
CREATE POLICY "Public can read contact info" ON contact_info
  FOR SELECT USING (true);

-- Insert data awal (satu baris)
INSERT INTO contact_info (
  address_line1, address_line2, address_line3,
  phone, phone_hours,
  email,
  facebook_url, instagram_url, youtube_url,
  maps_embed_url
) VALUES (
  'Jl. Turi Raya No.40',
  'Tj. Senang, Kec. Tj. Senang',
  'Kota Bandar Lampung, Lampung 35141',
  '+62 812-3456-7890',
  'Senin - Sabtu, 08.00 - 16.00 WIB',
  'info@gkpibdl.org',
  'https://facebook.com/gkpibandarlampung',
  'https://instagram.com/gkpibandarlampung',
  'https://youtube.com/@gkpibandarlampung',
  ''
);
