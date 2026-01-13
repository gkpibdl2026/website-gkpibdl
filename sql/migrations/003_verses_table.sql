-- =============================================
-- MIGRATION: 2026-01-13
-- DESCRIPTION: Create Verses Table for Bible Data
-- =============================================

-- 1. TABEL BIBLE BOOKS (Daftar Kitab Alkitab)
CREATE TABLE bible_books (
  id SERIAL PRIMARY KEY,
  book_name TEXT NOT NULL,              -- "Kejadian", "Keluaran", dll
  book_abbr TEXT NOT NULL,              -- "Kej", "Kel", dll
  testament TEXT NOT NULL CHECK (testament IN ('PL', 'PB')), -- Perjanjian Lama/Baru
  book_order INTEGER NOT NULL,          -- Urutan kitab (1-66)
  total_chapters INTEGER NOT NULL,      -- Jumlah pasal
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL BIBLE VERSES (Ayat-ayat Alkitab)
CREATE TABLE bible_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id INTEGER NOT NULL REFERENCES bible_books(id),
  chapter INTEGER NOT NULL,             -- Nomor pasal
  verse INTEGER NOT NULL,               -- Nomor ayat
  translation TEXT NOT NULL CHECK (translation IN ('TB', 'BIS', 'TL', 'FAYH', 'AYT')),
  content TEXT NOT NULL,                -- Isi ayat
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Unique constraint: satu ayat per terjemahan
  UNIQUE(book_id, chapter, verse, translation)
);

-- =============================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================

ALTER TABLE bible_books ENABLE ROW LEVEL SECURITY;
ALTER TABLE bible_verses ENABLE ROW LEVEL SECURITY;

-- =============================================
-- POLICIES - PUBLIC READ
-- =============================================

CREATE POLICY "Public can read bible_books" ON bible_books
  FOR SELECT USING (true);

CREATE POLICY "Public can read bible_verses" ON bible_verses
  FOR SELECT USING (true);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_verses_book_chapter ON bible_verses(book_id, chapter);
CREATE INDEX idx_verses_translation ON bible_verses(translation);
CREATE INDEX idx_books_abbr ON bible_books(book_abbr);
CREATE INDEX idx_books_order ON bible_books(book_order);

-- =============================================
-- INSERT DAFTAR KITAB ALKITAB (66 Kitab)
-- =============================================

INSERT INTO bible_books (book_name, book_abbr, testament, book_order, total_chapters) VALUES
-- PERJANJIAN LAMA (39 Kitab)
('Kejadian', 'Kej', 'PL', 1, 50),
('Keluaran', 'Kel', 'PL', 2, 40),
('Imamat', 'Im', 'PL', 3, 27),
('Bilangan', 'Bil', 'PL', 4, 36),
('Ulangan', 'Ul', 'PL', 5, 34),
('Yosua', 'Yos', 'PL', 6, 24),
('Hakim-hakim', 'Hak', 'PL', 7, 21),
('Rut', 'Rut', 'PL', 8, 4),
('1 Samuel', '1Sam', 'PL', 9, 31),
('2 Samuel', '2Sam', 'PL', 10, 24),
('1 Raja-raja', '1Raj', 'PL', 11, 22),
('2 Raja-raja', '2Raj', 'PL', 12, 25),
('1 Tawarikh', '1Taw', 'PL', 13, 29),
('2 Tawarikh', '2Taw', 'PL', 14, 36),
('Ezra', 'Ezr', 'PL', 15, 10),
('Nehemia', 'Neh', 'PL', 16, 13),
('Ester', 'Est', 'PL', 17, 10),
('Ayub', 'Ayb', 'PL', 18, 42),
('Mazmur', 'Mzm', 'PL', 19, 150),
('Amsal', 'Ams', 'PL', 20, 31),
('Pengkhotbah', 'Pkh', 'PL', 21, 12),
('Kidung Agung', 'Kid', 'PL', 22, 8),
('Yesaya', 'Yes', 'PL', 23, 66),
('Yeremia', 'Yer', 'PL', 24, 52),
('Ratapan', 'Rat', 'PL', 25, 5),
('Yehezkiel', 'Yeh', 'PL', 26, 48),
('Daniel', 'Dan', 'PL', 27, 12),
('Hosea', 'Hos', 'PL', 28, 14),
('Yoel', 'Yl', 'PL', 29, 3),
('Amos', 'Am', 'PL', 30, 9),
('Obaja', 'Ob', 'PL', 31, 1),
('Yunus', 'Yun', 'PL', 32, 4),
('Mikha', 'Mi', 'PL', 33, 7),
('Nahum', 'Nah', 'PL', 34, 3),
('Habakuk', 'Hab', 'PL', 35, 3),
('Zefanya', 'Zef', 'PL', 36, 3),
('Hagai', 'Hag', 'PL', 37, 2),
('Zakharia', 'Za', 'PL', 38, 14),
('Maleakhi', 'Mal', 'PL', 39, 4),
-- PERJANJIAN BARU (27 Kitab)
('Matius', 'Mat', 'PB', 40, 28),
('Markus', 'Mrk', 'PB', 41, 16),
('Lukas', 'Luk', 'PB', 42, 24),
('Yohanes', 'Yoh', 'PB', 43, 21),
('Kisah Para Rasul', 'Kis', 'PB', 44, 28),
('Roma', 'Rm', 'PB', 45, 16),
('1 Korintus', '1Kor', 'PB', 46, 16),
('2 Korintus', '2Kor', 'PB', 47, 13),
('Galatia', 'Gal', 'PB', 48, 6),
('Efesus', 'Ef', 'PB', 49, 6),
('Filipi', 'Flp', 'PB', 50, 4),
('Kolose', 'Kol', 'PB', 51, 4),
('1 Tesalonika', '1Tes', 'PB', 52, 5),
('2 Tesalonika', '2Tes', 'PB', 53, 3),
('1 Timotius', '1Tim', 'PB', 54, 6),
('2 Timotius', '2Tim', 'PB', 55, 4),
('Titus', 'Tit', 'PB', 56, 3),
('Filemon', 'Flm', 'PB', 57, 1),
('Ibrani', 'Ibr', 'PB', 58, 13),
('Yakobus', 'Yak', 'PB', 59, 5),
('1 Petrus', '1Ptr', 'PB', 60, 5),
('2 Petrus', '2Ptr', 'PB', 61, 3),
('1 Yohanes', '1Yoh', 'PB', 62, 5),
('2 Yohanes', '2Yoh', 'PB', 63, 1),
('3 Yohanes', '3Yoh', 'PB', 64, 1),
('Yudas', 'Yud', 'PB', 65, 1),
('Wahyu', 'Why', 'PB', 66, 22);

-- =============================================
-- CONTOH INSERT AYAT (Mazmur 23 - TB)
-- =============================================

-- Untuk import bulk, gunakan script terpisah
-- atau fetch dari Beeble API: https://beeble.vercel.app/api/v1/passage/Mzm/23?ver=tb

INSERT INTO bible_verses (book_id, chapter, verse, translation, content) VALUES
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 1, 'TB', 'Mazmur Daud. TUHAN adalah gembalaku, takkan kekurangan aku.'),
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 2, 'TB', 'Ia membaringkan aku di padang yang berumput hijau, Ia membimbing aku ke air yang tenang;'),
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 3, 'TB', 'Ia menyegarkan jiwaku. Ia menuntun aku di jalan yang benar oleh karena nama-Nya.'),
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 4, 'TB', 'Sekalipun aku berjalan dalam lembah kekelaman, aku tidak takut bahaya, sebab Engkau besertaku; gada-Mu dan tongkat-Mu, itulah yang menghibur aku.'),
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 5, 'TB', 'Engkau menyediakan hidangan bagiku, di hadapan lawanku; Engkau mengurapi kepalaku dengan minyak; pialaku penuh melimpah.'),
((SELECT id FROM bible_books WHERE book_abbr = 'Mzm'), 23, 6, 'TB', 'Kebajikan dan kemurahan belaka akan mengikuti aku, seumur hidupku; dan aku akan diam dalam rumah TUHAN sepanjang masa.');
