'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

// Mock user type (tanpa Firebase)
interface MockUser {
  email: string
  uid: string
}

interface AuthContextType {
  user: MockUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const AUTH_STORAGE_KEY = 'gkpi_admin_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(AUTH_STORAGE_KEY)
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
    } catch (error) {
      console.error('Error loading auth state:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    // Mock login - terima semua email/password untuk development
    // TODO: Ganti dengan Firebase auth setelah config benar
    if (email && password) {
      const mockUser = { email, uid: 'mock-uid-123' }
      setUser(mockUser)
      // Persist to localStorage
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(mockUser))
    } else {
      throw new Error('Email dan password harus diisi')
    }
  }

  const signOut = async () => {
    setUser(null)
    localStorage.removeItem(AUTH_STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
