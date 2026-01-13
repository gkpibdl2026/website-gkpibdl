import { createClient } from '@supabase/supabase-js'

// Client for server-side operations (with service role key - full access)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Client for client-side operations (with anon key - RLS applied)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types for database tables
export interface Warta {
  id: string
  title: string
  slug: string
  date: string
  minggu_name: string
  image_url?: string
  author_id?: string
  published: boolean
  modules?: WartaModule[]
  created_at: string
  updated_at: string
}

export type SongCategory = 'KJ' | 'PKJ' | 'NKB' | 'BE' | 'KK'

export interface SongVerse {
  verse: number
  content: string
}

export interface Song {
  id: string
  title: string
  song_number: string
  category: SongCategory
  lyrics: SongVerse[]
  created_at: string
  updated_at: string

}

export type ModuleType = 
  | 'LAGU'
  | 'AYAT'
  | 'TATA_IBADAH'
  | 'PELAYAN_IBADAH'
  | 'PENGUMUMAN'
  | 'STATISTIK'
  | 'KEUANGAN'
  | 'ULANG_TAHUN'
  | 'JEMAAT_SAKIT'

export interface WartaModule {
  id: string
  type: ModuleType
  order: number
  data: unknown // Akan disesuaikan dengan tipe spesifik tiap modul nanti
}

export interface TataIbadahItem {
  id: string
  order: number
  title: string
  type: 'RITUAL' | 'NYANYIAN' | 'DOA' | 'FIRMAN' | 'PERSEMBAHAN' | 'WARTA' | 'LAINNYA'
  description?: string
  content?: string
  songId?: string
}

export interface Pengumuman {
  id: string
  title: string
  content: string
  priority: 'normal' | 'important' | 'urgent'
  visible: boolean
  expires_at?: string
  created_at: string
  updated_at: string
}

export interface Keuangan {
  id: string
  title: string
  period: string
  description?: string
  document_url?: string
  pemasukan: number
  pengeluaran: number
  saldo: number
  created_at: string
  updated_at: string
}

export interface JadwalIbadah {
  id: string
  name: string
  day: string
  time: string
  location?: string
  description?: string
  active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}