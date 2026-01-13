-- =============================================
-- SAMPLE DATA: Lagu Kidung Jemaat (KJ) Populer
-- Jalankan di Supabase SQL Editor
-- =============================================

-- Pastikan constraint unique ada
ALTER TABLE songs DROP CONSTRAINT IF EXISTS songs_song_number_category_key;
ALTER TABLE songs ADD CONSTRAINT songs_song_number_category_key UNIQUE (song_number, category);

-- Insert sample lagu KJ populer
INSERT INTO songs (title, song_number, category, lyrics) VALUES

-- KJ 1 - Haleluya, Pujilah
('Haleluya, Pujilah', '1', 'KJ', '[
  {"verse": 1, "content": "Haleluya, pujilah Tuhan yang Mahaesa, Bapa, Putra, Roh Kudus, Allah satu!"},
  {"verse": 2, "content": "Nyanyikanlah bagi Dia pujipujian yang mulia sepanjang zaman!"},
  {"verse": 3, "content": "Haleluya, pujilah Tuhan yang Mahaesa, Bapa, Putra, Roh Kudus, Allah satu!"}
]'::jsonb),

-- KJ 10 - Besar Tuhan Saja
('Besar Tuhan Saja', '10', 'KJ', '[
  {"verse": 1, "content": "Besar Tuhan saja, besar kuasa-Nya, kemuliaan-Nya meliputi bumi dan surga."},
  {"verse": 2, "content": "Hikmat-Nya teguh, rencana-Nya kekal, perbuatan-Nya adil sepanjang segala abad."},
  {"verse": 3, "content": "Besar kasih-Nya, besar rahmat-Nya, kasih setia-Nya baharu setiap pagi."}
]'::jsonb),

-- KJ 17 - Tuhan Allah Hadir
('Tuhan Allah Hadir', '17', 'KJ', '[
  {"verse": 1, "content": "Tuhan Allah hadir, marilah menyembah dengan takut dan hormat di hadapan-Nya."},
  {"verse": 2, "content": "Tuhan Allah hadir, semua makhluk patut memuliakan Dia yang mahakuasa."},
  {"verse": 3, "content": "Aku, ya Tuhan, milik-Mu selamanya, Kujadikan hidupku korban bagi-Mu."}
]'::jsonb),

-- KJ 21 - Hari Minggu, Hari Yang Mulia
('Hari Minggu, Hari Yang Mulia', '21', 'KJ', '[
  {"verse": 1, "content": "Hari Minggu, hari yang mulia, hari kebangkitan Tuhan Yesus."},
  {"verse": 2, "content": "Marilah kita berkumpul bersama, memuji Tuhan yang telah bangkit."},
  {"verse": 3, "content": "Kristus sudah bangkit dari kubur, mengalahkan maut dan kuasa dosa."},
  {"verse": 4, "content": "Bersyukurlah kepada Tuhan, karena Ia baik dan kekal kasih setia-Nya."}
]'::jsonb),

-- KJ 28 - Puji Tuhanmu, Haiku
('Puji Tuhanmu, Haiku', '28', 'KJ', '[
  {"verse": 1, "content": "Puji Tuhanmu, haiku, dan janganlah lupakan semua kasih-Nya!"},
  {"verse": 2, "content": "Yang mengampuni semua dosamu, yang menyembuhkan penyakitmu."},
  {"verse": 3, "content": "Yang menebus hidupmu dari liang kubur, yang memahkotaimu dengan kasih."}
]'::jsonb),

-- KJ 38 - Hai Mari Berhimpun
('Hai Mari Berhimpun', '38', 'KJ', '[
  {"verse": 1, "content": "Hai mari berhimpun dan sembahlah Tuhan di dalam kemuliaan-Nya."},
  {"verse": 2, "content": "Yesus Kristus hadir di tengah kita, Ia penuh rahmat dan kebenaran."},
  {"verse": 3, "content": "Ia menerangi jalan kita dengan terang kasih-Nya yang kekal."}
]'::jsonb),

-- KJ 40 - Hai Semua Bangsa
('Hai Semua Bangsa', '40', 'KJ', '[
  {"verse": 1, "content": "Hai semua bangsa, bertepuk tanganlah, bersoraklah bagi Allah dengan suara girang!"},
  {"verse": 2, "content": "Sebab TUHAN, Yang Mahatinggi, adalah dahsyat, Raja yang besar atas seluruh bumi."},
  {"verse": 3, "content": "Nyanyikanlah mazmur bagi Allah, nyanyikanlah! Nyanyikanlah mazmur bagi Raja kita!"}
]'::jsonb),

-- KJ 44 - Ye Yo Layani Tuhan
('Ye Yo Layani Tuhan', '44', 'KJ', '[
  {"verse": 1, "content": "Ye yo layani Tuhan dengan sukacita, datanglah ke hadapan-Nya dengan sorak-sorai!"},
  {"verse": 2, "content": "Ketahuilah, bahwa TUHANlah Allah, Dialah yang menjadikan kita dan punya Dia kita."},
  {"verse": 3, "content": "Masuklah melalui pintu gerbang-Nya dengan nyanyian syukur, ke dalam pelataran-Nya dengan puji-pujian!"}
]'::jsonb),

-- KJ 48 - Mintalah Hujan
('Mintalah Hujan', '48', 'KJ', '[
  {"verse": 1, "content": "Mintalah hujan kepada TUHAN pada musim hujan akhir! TUHANlah yang membuat awan hujan."},
  {"verse": 2, "content": "Hujan yang melimpah akan Ia berikan kepada mereka, tanaman di ladang bagi tiap orang."}
]'::jsonb),

-- KJ 64 - Aku Mau Cinta
('Aku Mau Cinta', '64', 'KJ', '[
  {"verse": 1, "content": "Aku mau cinta dan bhakti pada-Mu, Yesus, Tuhanku."},
  {"verse": 2, "content": "Kau mengasihiku, Kau menebusiku, Kau kubur dosaku."},
  {"verse": 3, "content": "Kasih-Mu kekal, anugerah-Mu besar, rahmat-Mu melimpah."}
]'::jsonb),

-- KJ 75 - Yesus, Pengharapanku
('Yesus, Pengharapanku', '75', 'KJ', '[
  {"verse": 1, "content": "Yesus, pengharapanku, Tuhan yang kusembah."},
  {"verse": 2, "content": "Dalam senang dan susah, Kau slalu menyertai."},
  {"verse": 3, "content": "Engkau gembala yang baik, menuntun langkahku."}
]'::jsonb),

-- KJ 89 - Sungguh Indah Nama Yesus
('Sungguh Indah Nama Yesus', '89', 'KJ', '[
  {"verse": 1, "content": "Sungguh indah nama Yesus, seperti lagu di hatiku."},
  {"verse": 2, "content": "Sungguh indah nama Yesus, bagaikan bisik kasih-Nya."},
  {"verse": 3, "content": "Sungguh indah nama Yesus, nama tercermin di hatiku."}
]'::jsonb),

-- KJ 108 - Di Bawah Naungan-Mu
('Di Bawah Naungan-Mu', '108', 'KJ', '[
  {"verse": 1, "content": "Di bawah naungan-Mu, aku berlindung, Tuhan."},
  {"verse": 2, "content": "Pada sayap-Mu yang teduh, aku merasa aman."},
  {"verse": 3, "content": "Tiada yang dapat menggoncangkan imanku pada-Mu."}
]'::jsonb),

-- KJ 134 - Malam Kudus
('Malam Kudus', '134', 'KJ', '[
  {"verse": 1, "content": "Malam kudus, sunyi senyap, dunia terlelap, malaikat nampak."},
  {"verse": 2, "content": "Gembalanya di padang menjaga kawanan domba di malam yang gelap."},
  {"verse": 3, "content": "Kristus, Juruselamat, telah lahir! Kristus, Juruselamat, telah lahir!"}
]'::jsonb),

-- KJ 151 - Yesus, Kekasih Jiwaku
('Yesus, Kekasih Jiwaku', '151', 'KJ', '[
  {"verse": 1, "content": "Yesus, kekasih jiwaku, biarlah aku berlindung pada-Mu."},
  {"verse": 2, "content": "Bila badai menyerang dengan dahsyat, bersembunyilah, hai jiwaku."},
  {"verse": 3, "content": "Tuhan, Engkau perisaiku yang teguh, sembunyikan aku di dalam-Mu."}
]'::jsonb),

-- KJ 160 - Di Bukit Golgota
('Di Bukit Golgota', '160', 'KJ', '[
  {"verse": 1, "content": "Di bukit Golgota, Kristus mati tersalib."},
  {"verse": 2, "content": "Di kayu salib itu, Ia menanggung dosa kita."},
  {"verse": 3, "content": "Curahkan darah-Mu, ya Tuhan, bagi penebusan kami."}
]'::jsonb),

-- KJ 182 - O Kepala yang Berdarah
('O Kepala yang Berdarah', '182', 'KJ', '[
  {"verse": 1, "content": "O kepala yang berdarah, penuh luka dan cercaan."},
  {"verse": 2, "content": "O kepala yang bermahkota duri yang menusuk dalam."},
  {"verse": 3, "content": "Dosa hambamu-Mu ini menikam kepala-Mu."}
]'::jsonb),

-- KJ 196 - Yesus Juruselamatku
('Yesus Juruselamatku', '196', 'KJ', '[
  {"verse": 1, "content": "Yesus Juruselamatku, Kau yang menang atas maut."},
  {"verse": 2, "content": "Kasih-Mu yang menebus dosa, mengangkat jiwaku."},
  {"verse": 3, "content": "Kubangun dan berdiri teguh dalam nama-Mu."}
]'::jsonb),

-- KJ 269 - Tinggal Bersamaku
('Tinggal Bersamaku', '269', 'KJ', '[
  {"verse": 1, "content": "Tinggal bersamaku, hari sudah mulai gelap."},
  {"verse": 2, "content": "Malam turun kelam, tolong aku, ya Tuhanku."},
  {"verse": 3, "content": "Bilamana pembantu lain gagal dan hilang penghiburan, tinggallah bersama aku."}
]'::jsonb),

-- KJ 294 - Tuhan Yesus, Gembala Yang Baik
('Tuhan Yesus, Gembala Yang Baik', '294', 'KJ', '[
  {"verse": 1, "content": "Tuhan Yesus, Gembala yang baik, Engkau menuntun langkahku."},
  {"verse": 2, "content": "Di padang hijau Kau membaringkan aku, di air tenang Kau membawaku."},
  {"verse": 3, "content": "Sekalipun aku berjalan di lembah kekelaman, aku tidak takut."}
]'::jsonb),

-- KJ 392 - Roh Kudus, Turunlah
('Roh Kudus, Turunlah', '392', 'KJ', '[
  {"verse": 1, "content": "Roh Kudus, turunlah ke dalam hatiku."},
  {"verse": 2, "content": "Bersihkan dan kuduskanlah hidupku."},
  {"verse": 3, "content": "Penuhi aku dengan kuasa-Mu, ya Tuhan."}
]'::jsonb),

-- KJ 393 - Roh Kudus, Hadirlah
('Roh Kudus, Hadirlah', '393', 'KJ', '[
  {"verse": 1, "content": "Roh Kudus, hadirlah, penuhi hati kami."},
  {"verse": 2, "content": "Nyalakan api cinta-Mu dalam hati kami."},
  {"verse": 3, "content": "Berikan kami kuasa untuk melayani-Mu."}
]'::jsonb),

-- KJ 409 - Besarlah Setia-Mu
('Besarlah Setia-Mu', '409', 'KJ', '[
  {"verse": 1, "content": "Besarlah setia-Mu, ya Bapa surgawi. Tiada berubah kasih-Mu dari dahulu."},
  {"verse": 2, "content": "Kasih-Mu seperti bapa, lemah lembut dan murah. Engkau pengasih, pemberi tiap berkat."},
  {"verse": 3, "content": "Besarlah setia-Mu! Besarlah setia-Mu! Setiap pagi kurasakan pembaharuan-Mu."}
]'::jsonb),

-- KJ 425 - Hari Ini, Tuhan
('Hari Ini, Tuhan', '425', 'KJ', '[
  {"verse": 1, "content": "Hari ini, Tuhan, aku memuja-Mu. Kasih-Mu yang besar telah menebusiku."},
  {"verse": 2, "content": "Kuserahkan jiwaku, tubuhku, dan rasaku, untuk memuliakan nama-Mu."}
]'::jsonb),

-- KJ 452 - Berkat Yang Melimpah
('Berkat Yang Melimpah', '452', 'KJ', '[
  {"verse": 1, "content": "Berkat yang melimpah Tuhan curahkan kepadamu."},
  {"verse": 2, "content": "Kasih-Nya menyertaimu di mana saja kau pergi."},
  {"verse": 3, "content": "Damai sejahtera-Nya meliputi hidupmu."}
]'::jsonb)

ON CONFLICT (song_number, category) DO UPDATE SET
  title = EXCLUDED.title,
  lyrics = EXCLUDED.lyrics,
  updated_at = NOW();
