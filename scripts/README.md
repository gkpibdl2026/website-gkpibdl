# Scripts Import Data

## Persiapan

```bash
npm install dotenv
```

> Package `@supabase/supabase-js` sudah ada di project.

---

## Import Alkitab

```bash
# Import Yohanes (21 pasal) - TB
node -e "require('./scripts/import-bible.js').importBook('Yoh', 21, 'tb')"

# Import Mazmur (150 pasal) - TB
node -e "require('./scripts/import-bible.js').importBook('Mzm', 150, 'tb')"

# Import Matius (28 pasal) - BIS
node -e "require('./scripts/import-bible.js').importBook('Mat', 28, 'bis')"
```

---

## Import Kidung Jemaat

```bash
# Import semua KJ (1-478)
node -e "require('./scripts/import-songs.js').importAllKJ()"

# Import sebagian (1-50)
node -e "require('./scripts/import-songs.js').importAllKJ(1, 50)"

# Import satu lagu
node -e "require('./scripts/import-songs.js').importSong(21, 'KJ')"
```

---

## Kode Kitab Alkitab

| PL                        | PB                     |
| ------------------------- | ---------------------- |
| Kej, Kel, Im, Bil, Ul     | Mat, Mrk, Luk, Yoh     |
| Yos, Hak, Rut, 1Sam, 2Sam | Kis, Rm, 1Kor, 2Kor    |
| 1Raj, 2Raj, 1Taw, 2Taw    | Gal, Ef, Flp, Kol      |
| Ezr, Neh, Est, Ayb, Mzm   | 1Tes, 2Tes, 1Tim, 2Tim |
| Ams, Pkh, Kid, Yes, Yer   | Tit, Flm, Ibr, Yak     |
| Rat, Yeh, Dan, Hos, Yl    | 1Ptr, 2Ptr, 1Yoh, 2Yoh |
| Am, Ob, Yun, Mi, Nah      | 3Yoh, Yud, Why         |
| Hab, Zef, Hag, Za, Mal    |                        |

---

## Cleanup Songs BE Category

Script untuk membersihkan data yang tidak konsisten pada tabel `songs` kategori `BE`.

### Langkah-langkah

#### 1. **Backup Database (WAJIB!)**

Buka Supabase SQL Editor dan jalankan:

```sql
-- File: scripts/backup-songs-table.sql
CREATE TABLE songs_backup_20260117 AS 
SELECT * FROM songs;
```

Ganti `20260117` dengan tanggal hari ini (format: YYYYMMDD).

#### 2. **Install Dependencies** (jika belum)

```bash
npm install
```

#### 3. **Jalankan Cleanup Script**

```bash
npm run cleanup:songs-be
```

Script akan:
- Menanyakan konfirmasi bahwa backup sudah dibuat
- Menampilkan preview perubahan yang akan dilakukan
- Meminta konfirmasi untuk melanjutkan
- Melakukan update data

### Restore dari Backup

Jika ada masalah dan perlu restore, jalankan di Supabase SQL Editor:

```sql
DROP TABLE songs;
ALTER TABLE songs_backup_20260117 RENAME TO songs;
```

