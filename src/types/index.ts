// Export semua types dari sini
// Contoh:
// export type { User } from './user'
// export type { Post } from './post'

export interface User {
  id: string
  firebase_uid: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}
