# SQL Migrations

Folder ini berisi semua file SQL migration untuk database Supabase.

## Cara Penggunaan

Jalankan file-file SQL ini di **Supabase SQL Editor** secara berurutan:

1. `001_initial_schema.sql` - Schema awal (users, warta, keuangan, pengumuman, jadwal, struktur, galeri, album)
2. `002_warta_refactor.sql` - Refactor warta + tabel songs
3. `003_verses_table.sql` - Tabel bible_books dan bible_verses

## Urutan Penting!

> ⚠️ Jalankan file sesuai urutan nomor (001, 002, 003, dst) karena ada dependensi antar tabel.

## Menambah Migration Baru

Gunakan format: `{nomor}_{deskripsi}.sql`

Contoh:

- `004_warta_modules.sql`
- `005_warta_templates.sql`
