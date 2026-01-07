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
