-- =============================================
-- BACKUP SCRIPT: Songs Table
-- Jalankan ini PERTAMA sebelum cleanup
-- =============================================

-- Create backup table with timestamp
-- Ganti 20260117 dengan tanggal hari ini (format: YYYYMMDD)
CREATE TABLE songs_backup_20260117 AS 
SELECT * FROM songs;

-- =============================================
-- VERIFY BACKUP
-- Jalankan query di bawah ini TERPISAH untuk verifikasi
-- =============================================

-- Check row count comparison
SELECT 
    'songs (original)' as table_name, 
    COUNT(*) as total_rows,
    COUNT(CASE WHEN category = 'BE' THEN 1 END) as be_category_count
FROM songs
UNION ALL
SELECT 
    'songs_backup_20260117' as table_name, 
    COUNT(*) as total_rows,
    COUNT(CASE WHEN category = 'BE' THEN 1 END) as be_category_count
FROM songs_backup_20260117;
