-- ================================================
-- SQL Fix: Extend column lengths in renungan table  
-- Run this in Supabase SQL Editor
-- ================================================

-- Change referensi from VARCHAR(255) to TEXT to accommodate longer values
ALTER TABLE renungan ALTER COLUMN referensi TYPE TEXT;

-- Also extend lagu to TEXT in case it's long
ALTER TABLE renungan ALTER COLUMN lagu TYPE TEXT;
