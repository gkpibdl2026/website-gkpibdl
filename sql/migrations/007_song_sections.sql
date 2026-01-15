-- =============================================
-- MIGRATION: Song Sections Support
-- Migrate lyrics from verse format to section format
-- =============================================

-- Note: This migration assumes songs table already exists from 002_warta_refactor.sql
-- The lyrics JSONB field will now use section format:
-- { "section": "reff"|"bait"|"interlude"|"bridge", "number": 1, "content": "..." }

-- 1. Add comment to document the new lyrics format
COMMENT ON COLUMN songs.lyrics IS 'Array of song sections: [{section: "reff"|"bait"|"interlude"|"bridge", number: int, content: string}]';

-- 2. Migrate existing lyrics data (verse -> bait)
-- This converts old format {verse: 1, content: "..."} to new format {section: "bait", number: 1, content: "..."}
UPDATE songs
SET lyrics = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'section', 'bait',
      'number', (elem->>'verse')::int,
      'content', elem->>'content'
    )
  )
  FROM jsonb_array_elements(lyrics) AS elem
  WHERE elem ? 'verse'
),
updated_at = NOW()
WHERE lyrics IS NOT NULL 
  AND jsonb_array_length(lyrics) > 0
  AND (lyrics->0) ? 'verse';

-- 3. Create index for faster song search
CREATE INDEX IF NOT EXISTS idx_songs_category ON songs(category);
CREATE INDEX IF NOT EXISTS idx_songs_number ON songs(song_number);
