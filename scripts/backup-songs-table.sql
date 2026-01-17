-- Backup script for songs table
-- Run this in Supabase SQL Editor BEFORE running the cleanup script

-- Create backup table with timestamp
-- Replace 'YYYYMMDD_HHMM' with current timestamp, e.g., songs_backup_20260117_1848
CREATE TABLE songs_backup_20260117 AS 
SELECT * FROM songs;

-- Verify backup was created successfully
SELECT 
    'songs' as table_name, 
    COUNT(*) as row_count 
FROM songs
UNION ALL
SELECT 
    'songs_backup_20260117' as table_name, 
    COUNT(*) as row_count 
FROM songs_backup_20260117;

-- To restore from backup if needed:
-- DROP TABLE songs;
-- ALTER TABLE songs_backup_20260117 RENAME TO songs;
