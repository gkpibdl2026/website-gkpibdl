-- MIGRATION: 2026-01-13
-- DESCRIPTION: Refactor Warta table and create Songs table

-- 1. Refactor Warta Table
ALTER TABLE warta 
DROP COLUMN content, 
DROP COLUMN excerpt,
ADD COLUMN date DATE DEFAULT CURRENT_DATE,
ADD COLUMN minggu_name TEXT;

-- 2. Create Songs Table
CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  song_number TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('KJ', 'PKJ', 'NKB', 'BE', 'KK')),
  lyrics JSONB DEFAULT '[]'::jsonb, -- Array of { verse: number, content: string }
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable RLS for Songs
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy for Songs (Public Read)
CREATE POLICY "Public can read songs" ON songs FOR SELECT USING (true);
