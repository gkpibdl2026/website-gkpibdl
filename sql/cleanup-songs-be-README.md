# Cleanup Songs BE Category - SQL Only

## 📋 Workflow

### 1️⃣ Backup (WAJIB!)

File: `sql/backup-songs-table.sql`

```bash
Buka Supabase SQL Editor → Copy paste seluruh isi file
```

Script akan:
- Membuat table `songs_backup_20260117` (ganti dengan tanggal hari ini)
- Menampilkan verifikasi row count
- Menampilkan sample data comparison

**✅ Pastikan row count sama sebelum lanjut!**

---

### 2️⃣ Cleanup  

File: `sql/cleanup-songs-be.sql`

```bash
Buka Supabase SQL Editor → Copy paste step-by-step
```

**STEP 1: Preview Changes**
- Copy paste bagian "STEP 1: PREVIEW CHANGES"
- Review hasilnya, pastikan `new_number` dan `new_title` sudah benar

**STEP 2: Update Data**
- Setelah yakin, copy paste bagian "STEP 2: UPDATE DATA"
- Ini akan mengupdate semua data BE category

**STEP 3: Verify Results**
- Copy paste bagian "STEP 3: VERIFY RESULTS"
- Pastikan `still_has_batakpedia = 0` dan `still_has_be_prefix = 0`

---

### 3️⃣ Rollback (Jika Diperlukan)

Jika ada masalah, restore dari backup:

```sql
DROP TABLE songs;
ALTER TABLE songs_backup_20260117 RENAME TO songs;
```

---

## 🔄 Contoh Transformasi

**Before:**
```
title: "BE 720 NAENG MARSINONDANG NGOLUNGKU. – BatakPedia"
song_number: ""
```

**After:**
```
title: "NAENG MARSINONDANG NGOLUNGKU"
song_number: "720"
```

---

## 📁 Files

- `sql/backup-songs-table.sql` - Backup script dengan verifikasi
- `sql/cleanup-songs-be.sql` - Cleanup script dengan preview & verify
- `sql/cleanup-songs-be-README.md` - Dokumentasi ini
