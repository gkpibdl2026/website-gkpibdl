-- =============================================
-- CLEANUP SCRIPT: Songs Table BE Category
-- Jalankan ini SETELAH backup terverifikasi
-- =============================================

-- ⚠️  PASTIKAN sudah menjalankan backup-songs-table.sql terlebih dahulu!

-- =============================================
-- STEP 1: PREVIEW CHANGES
-- Lihat data yang akan diubah sebelum update
-- =============================================

SELECT 
    id,
    title as current_title,
    song_number as current_number,
    -- Extract song number from title (pattern: "BE 720 TITLE...")
    REGEXP_REPLACE(title, '^BE\s+(\d+)\s+.*$', '\1') as new_number,
    -- Extract clean title (remove "BE 720", trailing period, and "– BatakPedia")
    TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(title, '^BE\s+\d+\s+', ''),  -- Remove "BE 720 " prefix
            '(\.\s*)?(\s*–\s*BatakPedia)?$', ''         -- Remove ". – BatakPedia" suffix
        )
    ) as new_title
FROM songs
WHERE category = 'BE'
    AND (
        title ~* '^BE\s+\d+'                    -- Has "BE <number>" prefix
        OR title ~* '–\s*BatakPedia'            -- Has "– BatakPedia" suffix
    )
ORDER BY song_number;

-- ⏸️  REVIEW HASIL DI ATAS SEBELUM LANJUT!
-- ⏸️  Pastikan new_number dan new_title sudah benar

-- =============================================
-- STEP 2: UPDATE DATA
-- Jalankan ini setelah mereview preview di atas
-- =============================================

-- Update songs with "BE <number> TITLE" pattern
UPDATE songs
SET 
    song_number = REGEXP_REPLACE(title, '^BE\s+(\d+)\s+.*$', '\1'),
    title = TRIM(
        REGEXP_REPLACE(
            REGEXP_REPLACE(title, '^BE\s+\d+\s+', ''),
            '(\.\s*)?(\s*–\s*BatakPedia)?$', ''
        )
    ),
    updated_at = NOW()
WHERE category = 'BE'
    AND title ~* '^BE\s+\d+';

-- Update songs that only have "– BatakPedia" suffix (no "BE" prefix)
UPDATE songs
SET 
    title = TRIM(
        REGEXP_REPLACE(title, '(\.\s*)?(\s*–\s*BatakPedia)$', '')
    ),
    updated_at = NOW()
WHERE category = 'BE'
    AND title ~* '–\s*BatakPedia'
    AND title !~* '^BE\s+\d+';

-- =============================================
-- STEP 3: VERIFY RESULTS
-- Cek hasil update
-- =============================================

-- Check sample results
SELECT 
    id,
    title,
    song_number,
    category
FROM songs
WHERE category = 'BE'
ORDER BY CAST(song_number AS INTEGER)
LIMIT 20;

-- Count cleanup status
SELECT 
    COUNT(*) as total_be_songs,
    COUNT(CASE WHEN title ~* 'BatakPedia' THEN 1 END) as still_has_batakpedia,
    COUNT(CASE WHEN title ~* '^BE\s+\d+' THEN 1 END) as still_has_be_prefix
FROM songs
WHERE category = 'BE';

-- ✅ Jika still_has_batakpedia = 0 dan still_has_be_prefix = 0, cleanup berhasil!

-- =============================================
-- ROLLBACK (Jika ada masalah)
-- =============================================

-- Uncomment dan jalankan jika perlu restore:
-- DROP TABLE songs;
-- ALTER TABLE songs_backup_20260117 RENAME TO songs;
-- (Ganti 20260117 dengan suffix backup table Anda)
