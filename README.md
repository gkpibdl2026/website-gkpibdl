# Website GKPI Bandar Lampung

Website resmi gereja GKPI Bandar Lampung dengan Next.js, Supabase, Firebase Auth, dan Tailwind CSS.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Buka http://localhost:3000

> **Note:** Jika terjadi error "out of memory", jalankan dengan:
>
> ```bash
> set NODE_OPTIONS=--max-old-space-size=4096 && npm run dev
> ```

## ✨ Fitur

### Halaman Publik

- **Home** - Landing page dengan informasi gereja
- **Warta Jemaat** - Berita dan renungan mingguan
- **Jadwal Ibadah** - Jadwal kegiatan ibadah
- **Pengumuman** - Pengumuman untuk jemaat
- **Laporan Keuangan** - Transparansi keuangan gereja
- **Kontak** - Form untuk menghubungi gereja

### Dashboard Admin

- **CRUD Warta** - Kelola berita dan renungan
- **CRUD Pengumuman** - Kelola pengumuman
- **CRUD Keuangan** - Kelola laporan keuangan
- **CRUD Jadwal** - Kelola jadwal ibadah
- **Dark Theme** - Tampilan admin dengan tema biru gelap

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router + Turbopack)
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Firebase Auth
- **Storage:** Cloudflare R2 (optional)
- **Email:** Resend (optional)
- **Deploy:** Vercel

## 📁 Struktur Folder

```
src/
├── app/
│   ├── (public)/      # Halaman publik (Home, Warta, Jadwal, dll)
│   ├── admin/         # Dashboard admin (protected)
│   │   ├── warta/     # CRUD warta
│   │   ├── pengumuman/# CRUD pengumuman
│   │   ├── keuangan/  # CRUD keuangan
│   │   └── jadwal/    # CRUD jadwal
│   ├── api/           # API routes
│   ├── login/         # Halaman login
│   ├── globals.css    # Global styles
│   └── layout.tsx     # Root layout
├── components/        # React components
│   ├── layout/        # Layout components (Header, Footer, Navigation)
│   ├── ui/            # UI components
│   ├── Providers.tsx  # Context providers wrapper
│   └── index.ts       # Component exports
├── context/           # Context providers (AuthContext)
├── hooks/             # Custom React hooks (useAuth)
├── lib/               # Client libraries
│   ├── supabase.ts    # Supabase client
│   ├── firebase.ts    # Firebase client
│   ├── firebase-admin.ts # Firebase Admin SDK
│   ├── r2.ts          # Cloudflare R2 client
│   └── resend.ts      # Resend email client
└── types/             # TypeScript type definitions
```

## 🔧 Environment Variables

Copy `.env.example` ke `.env.local` dan isi:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=project-id
NEXT_PUBLIC_FIREBASE_APP_ID=1:xxx:web:xxx

# Cloudflare R2 (Optional)
R2_ENDPOINT=https://xxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=gkpi-files

# Resend (Optional)
RESEND_API_KEY=re_xxx
```

## 🗄️ Setup Database (Supabase)

1. Buka [Supabase Dashboard](https://supabase.com/dashboard)
2. Pilih project → SQL Editor
3. Copy isi file `supabase-schema.sql` dan jalankan

### Tabel Database:

- `warta` - Berita dan renungan
- `pengumuman` - Pengumuman gereja
- `keuangan` - Laporan keuangan
- `jadwal` - Jadwal ibadah

## 🔐 Setup Firebase Auth

1. Buka [Firebase Console](https://console.firebase.google.com)
2. Project Settings → Web app → Copy config ke `.env.local`
3. Authentication → Sign-in method → Enable Email/Password
4. Authentication → Users → Add user (email admin)

### Aktifkan Firebase Auth:

1. Rename `src/context/AuthContext.tsx` → `AuthContext.mock.tsx`
2. Rename `src/context/AuthContext.firebase.tsx` → `AuthContext.tsx`
3. Restart dev server

## 📦 Deploy ke Vercel

```bash
npm install -g vercel
vercel login
vercel
```

Atau push ke GitHub dan connect di [vercel.com](https://vercel.com)

## 📝 API Endpoints

| Endpoint               | Methods          | Description        |
| ---------------------- | ---------------- | ------------------ |
| `/api/warta`           | GET, POST        | Warta jemaat       |
| `/api/warta/[id]`      | GET, PUT, DELETE | Single warta       |
| `/api/pengumuman`      | GET, POST        | Pengumuman         |
| `/api/pengumuman/[id]` | GET, PUT, DELETE | Single pengumuman  |
| `/api/keuangan`        | GET, POST        | Laporan keuangan   |
| `/api/keuangan/[id]`   | GET, PUT, DELETE | Single keuangan    |
| `/api/jadwal`          | GET, POST        | Jadwal ibadah      |
| `/api/jadwal/[id]`     | GET, PUT, DELETE | Single jadwal      |
| `/api/upload`          | POST             | Upload file ke R2  |
| `/api/contact`         | POST             | Kirim email kontak |

## 🎨 Pages

### Public

- `/` - Home
- `/warta` - Daftar warta
- `/warta/[id]` - Detail warta
- `/jadwal` - Jadwal ibadah
- `/pengumuman` - Pengumuman
- `/keuangan` - Laporan keuangan
- `/kontak` - Form kontak

### Admin (Protected)

- `/login` - Login admin
- `/admin` - Dashboard
- `/admin/warta` - Kelola warta
- `/admin/warta/new` - Tambah warta
- `/admin/warta/[id]/edit` - Edit warta
- `/admin/pengumuman` - Kelola pengumuman
- `/admin/pengumuman/new` - Tambah pengumuman
- `/admin/pengumuman/[id]/edit` - Edit pengumuman
- `/admin/keuangan` - Kelola keuangan
- `/admin/keuangan/new` - Tambah laporan
- `/admin/keuangan/[id]/edit` - Edit laporan
- `/admin/jadwal` - Kelola jadwal
- `/admin/jadwal/new` - Tambah jadwal
- `/admin/jadwal/[id]/edit` - Edit jadwal

## 🎨 Theme Admin

Dashboard admin menggunakan tema dark blue:

- Background: `#1e3a5f`
- Border: `#2d4a6f`
- Text: `text-white` / `text-gray-300`

---

© 2026 GKPI Bandar Lampung
