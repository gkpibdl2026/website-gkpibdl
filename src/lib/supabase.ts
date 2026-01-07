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
  content: string
  excerpt?: string
  image_url?: string
  author_id?: string
  published: boolean
  created_at: string
  updated_at: string
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