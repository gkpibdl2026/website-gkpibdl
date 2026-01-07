'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

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

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock: langsung set user sebagai admin untuk development
  const [user, setUser] = useState<MockUser | null>(null)
  const [loading] = useState(false)

  const signIn = async (email: string, password: string) => {
    // Mock login - terima semua email/password untuk development
    // TODO: Ganti dengan Firebase auth setelah config benar
    if (email && password) {
      setUser({ email, uid: 'mock-uid-123' })
    } else {
      throw new Error('Email dan password harus diisi')
    }
  }

  const signOut = async () => {
    setUser(null)
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
