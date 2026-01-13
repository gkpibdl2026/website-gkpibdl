'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { 
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'

interface SignInResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signInWithGoogle: () => Promise<SignInResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Google Auth Provider
const googleProvider = new GoogleAuthProvider()

// Helper function to get user-friendly error messages
function getAuthErrorMessage(error: AuthError): string {
  switch (error.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email atau password salah'
    case 'auth/too-many-requests':
      return 'Terlalu banyak percobaan. Coba lagi nanti'
    case 'auth/network-request-failed':
      return 'Koneksi internet bermasalah'
    case 'auth/invalid-email':
      return 'Format email tidak valid'
    case 'auth/user-disabled':
      return 'Akun ini telah dinonaktifkan'
    case 'auth/popup-closed-by-user':
      return 'Login dibatalkan'
    case 'auth/popup-blocked':
      return 'Popup diblokir oleh browser. Izinkan popup untuk melanjutkan'
    case 'auth/cancelled-popup-request':
      return 'Proses login dibatalkan'
    default:
      return 'Terjadi kesalahan. Silakan coba lagi'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Initialize loading as false if Firebase is not configured
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    // If Firebase is not configured, don't try to listen for auth state
    if (!isFirebaseConfigured) {
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase belum dikonfigurasi. Hubungi administrator.' }
    }
    
    try {
      await signInWithEmailAndPassword(auth, email, password)
      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      return { success: false, error: getAuthErrorMessage(authError) }
    }
  }

  const signInWithGoogle = async (): Promise<SignInResult> => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase belum dikonfigurasi. Hubungi administrator.' }
    }
    
    try {
      await signInWithPopup(auth, googleProvider)
      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      return { success: false, error: getAuthErrorMessage(authError) }
    }
  }

  const signOut = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth)
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      isConfigured: isFirebaseConfigured,
      signIn, 
      signInWithGoogle, 
      signOut 
    }}>
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
