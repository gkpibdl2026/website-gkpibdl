-- =============================================
-- DATABASE SCHEMA GKPI BANDAR LAMPUNG
-- Jalankan di Supabase SQL Editor
-- =============================================

-- 1. TABEL USERS (Admin)
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL WARTA (Berita Gereja)
CREATE TABLE warta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  image_url TEXT,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABEL KEUANGAN (Laporan Keuangan)
CREATE TABLE keuangan (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  period TEXT NOT NULL,
  description TEXT,
  document_url TEXT,
  pemasukan DECIMAL(15,2) DEFAULT 0,
  pengeluaran DECIMAL(15,2) DEFAULT 0,
  saldo DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABEL PENGUMUMAN
CREATE TABLE pengumuman (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('normal', 'important', 'urgent')),
  visible BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABEL JADWAL IBADAH
CREATE TABLE jadwal_ibadah (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  day TEXT NOT NULL,
  time TEXT NOT NULL,
  location TEXT,
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE warta ENABLE ROW LEVEL SECURITY;
ALTER TABLE keuangan ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengumuman ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal_ibadah ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES - PUBLIC READ
-- =============================================

-- Warta: Public bisa baca yang published
CREATE POLICY "Public can read published warta" ON warta
  FOR SELECT USING (published = true);

-- Keuangan: Public bisa baca semua
CREATE POLICY "Public can read keuangan" ON keuangan
  FOR SELECT USING (true);

-- Pengumuman: Public bisa baca yang visible dan belum expired
CREATE POLICY "Public can read visible pengumuman" ON pengumuman
  FOR SELECT USING (visible = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Jadwal: Public bisa baca yang active
CREATE POLICY "Public can read active jadwal" ON jadwal_ibadah
  FOR SELECT USING (active = true);

-- =============================================
-- POLICIES - ADMIN FULL ACCESS (via service_role)
-- Admin menggunakan service_role key yang bypass RLS
-- =============================================

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_warta_published ON warta(published);
CREATE INDEX idx_warta_created_at ON warta(created_at DESC);
CREATE INDEX idx_pengumuman_visible ON pengumuman(visible);
CREATE INDEX idx_pengumuman_expires ON pengumuman(expires_at);
CREATE INDEX idx_jadwal_active ON jadwal_ibadah(active);
CREATE INDEX idx_jadwal_day ON jadwal_ibadah(day);

-- =============================================
-- INSERT SAMPLE DATA
-- =============================================

-- Sample Jadwal Ibadah
INSERT INTO jadwal_ibadah (name, day, time, location, description, sort_order) VALUES
('Ibadah Minggu Pagi', 'Minggu', '07:00 WIB', 'Gedung Utama', 'Ibadah umum bahasa Indonesia', 1),
('Ibadah Minggu Siang', 'Minggu', '10:00 WIB', 'Gedung Utama', 'Ibadah umum bahasa Indonesia', 2),
('Ibadah Pemuda', 'Sabtu', '17:00 WIB', 'Aula Pemuda', 'Ibadah khusus pemuda-pemudi', 3),
('Ibadah Doa', 'Rabu', '18:30 WIB', 'Ruang Doa', 'Persekutuan doa mingguan', 4),
('Sekolah Minggu', 'Minggu', '08:00 WIB', 'Gedung Sekolah Minggu', 'Untuk anak-anak usia 3-12 tahun', 5);

-- Sample Pengumuman
INSERT INTO pengumuman (title, content, priority) VALUES
('Selamat Datang di Website GKPI Bandar Lampung', 'Website resmi GKPI Bandar Lampung telah hadir. Dapatkan informasi terbaru seputar kegiatan gereja di sini.', 'important');

-- =============================================
-- 6. TABEL STRUKTUR ORGANISASI
-- =============================================

CREATE TABLE struktur_organisasi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  image_url TEXT,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE struktur_organisasi ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active struktur" ON struktur_organisasi
  FOR SELECT USING (active = true);

CREATE INDEX idx_struktur_active ON struktur_organisasi(active);
CREATE INDEX idx_struktur_order ON struktur_organisasi(sort_order);

-- =============================================
-- 7. TABEL GALERI DOKUMENTASI
-- =============================================

CREATE TABLE galeri (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  category TEXT DEFAULT 'umum',
  description TEXT,
  event_date DATE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE galeri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read active galeri" ON galeri
  FOR SELECT USING (active = true);

CREATE INDEX idx_galeri_active ON galeri(active);
CREATE INDEX idx_galeri_category ON galeri(category);
CREATE INDEX idx_galeri_date ON galeri(event_date DESC);

-- =============================================
-- ALBUM GALLERY SYSTEM
-- Run this in Supabase SQL Editor
-- =============================================

-- 1. TABEL ALBUM (Kegiatan/Event)
CREATE TABLE album (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  cover_image TEXT,
  category TEXT DEFAULT 'umum',
  event_date DATE,
  photo_count INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL ALBUM PHOTOS (Foto dalam Album)
CREATE TABLE album_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  album_id UUID NOT NULL REFERENCES album(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  caption TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE album ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_photos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES - PUBLIC READ
-- =============================================

CREATE POLICY "Public can read active album" ON album
  FOR SELECT USING (active = true);

CREATE POLICY "Public can read album photos" ON album_photos
  FOR SELECT USING (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_album_active ON album(active);
CREATE INDEX idx_album_category ON album(category);
CREATE INDEX idx_album_date ON album(event_date DESC);
CREATE INDEX idx_album_photos_album_id ON album_photos(album_id);
CREATE INDEX idx_album_photos_order ON album_photos(sort_order);

-- =============================================
-- FUNCTION TO UPDATE PHOTO COUNT
-- =============================================

CREATE OR REPLACE FUNCTION update_album_photo_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE album SET photo_count = photo_count + 1, updated_at = NOW() WHERE id = NEW.album_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE album SET photo_count = photo_count - 1, updated_at = NOW() WHERE id = OLD.album_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_album_photo_count
AFTER INSERT OR DELETE ON album_photos
FOR EACH ROW EXECUTE FUNCTION update_album_photo_count();
