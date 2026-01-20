-- ================================================
-- SQL Migration: Create Renungan Table
-- For: GKPI Bandar Lampung Website
-- Date: 2026-01-20
-- ================================================

-- Create renungan table for daily devotions
CREATE TABLE IF NOT EXISTS renungan (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(500) NOT NULL,
  date DATE NOT NULL,
  ayat_kunci TEXT NOT NULL,
  referensi VARCHAR(255) NOT NULL,
  isi_renungan TEXT NOT NULL,
  kutipan TEXT,
  lagu VARCHAR(255),
  doa TEXT,
  source VARCHAR(50) DEFAULT 'manual', -- 'manual' | 'gkpi_sinode'
  source_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_renungan_date ON renungan(date DESC);
CREATE INDEX IF NOT EXISTS idx_renungan_visible ON renungan(visible);
CREATE INDEX IF NOT EXISTS idx_renungan_source ON renungan(source);

-- Create unique constraint for date (one renungan per day)
-- Note: Use IF NOT EXISTS or check before creating
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_renungan_unique_date'
    ) THEN
        CREATE UNIQUE INDEX idx_renungan_unique_date ON renungan(date);
    END IF;
END
$$;

-- Enable Row Level Security
ALTER TABLE renungan ENABLE ROW LEVEL SECURITY;

-- Allow public read for visible renungan (drop if exists then create)
DROP POLICY IF EXISTS "Allow public read" ON renungan;
CREATE POLICY "Allow public read" ON renungan
  FOR SELECT USING (visible = true);

-- Allow all for service role (drop if exists then create)
DROP POLICY IF EXISTS "Allow service role all" ON renungan;
CREATE POLICY "Allow service role all" ON renungan
  FOR ALL USING (true);
