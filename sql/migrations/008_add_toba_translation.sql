-- =============================================
-- MIGRATION: Add TOBA translation support
-- DESCRIPTION: Add Alkitab Batak Toba to supported translations
-- =============================================

-- 1. Drop existing constraint
ALTER TABLE bible_verses DROP CONSTRAINT IF EXISTS bible_verses_translation_check;

-- 2. Add new constraint with TOBA
ALTER TABLE bible_verses ADD CONSTRAINT bible_verses_translation_check 
  CHECK (translation IN ('TB', 'BIS', 'TL', 'FAYH', 'AYT', 'TOBA'));

-- 3. Add index for TOBA translation
CREATE INDEX IF NOT EXISTS idx_verses_toba ON bible_verses(translation) WHERE translation = 'TOBA';
