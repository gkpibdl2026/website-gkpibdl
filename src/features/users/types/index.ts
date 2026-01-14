// User feature types

export type UserRole = 'admin' | 'editor' | 'jemaat'

export interface User {
  id: string
  firebase_uid: string
  email: string
  name?: string
  google_name?: string
  first_name?: string
  last_name?: string
  avatar_url?: string
  role: UserRole
  approved: boolean
  whatsapp?: string
  lingkungan?: number
  alamat?: string
  has_password?: boolean
  created_at: string
  updated_at: string
}

export interface UpdateUserPayload {
  role?: UserRole
  approved?: boolean
  first_name?: string
  last_name?: string
  whatsapp?: string
  lingkungan?: number
  alamat?: string
  password?: string // For setting new password
}

export interface CreateUserPayload {
  email: string
  password?: string
  first_name?: string
  last_name?: string
  whatsapp?: string
  lingkungan?: number
  alamat?: string
  role?: UserRole
  approved?: boolean
}
