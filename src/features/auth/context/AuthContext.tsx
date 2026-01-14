'use client'

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  AuthError
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '@/lib/firebase'
import { User, UserRole } from '../types'

interface SignInResult {
  success: boolean
  error?: string
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null
  appUser: User | null
  loading: boolean
  isConfigured: boolean
  userRole: UserRole | null
  isApproved: boolean
  signIn: (email: string, password: string) => Promise<SignInResult>
  signInWithGoogle: () => Promise<SignInResult>
  signOut: () => Promise<void>
  getToken: () => Promise<string | null>
  refreshUser: () => Promise<void>
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
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [appUser, setAppUser] = useState<User | null>(null)
  // Initialize loading as false if Firebase is not configured
  const [loading, setLoading] = useState(isFirebaseConfigured)

  // Get Firebase ID token
  const getToken = useCallback(async (): Promise<string | null> => {
    if (!firebaseUser) return null
    try {
      return await firebaseUser.getIdToken()
    } catch {
      return null
    }
  }, [firebaseUser])

  // Sync user to database and fetch role
  const syncUser = useCallback(async (fbUser: FirebaseUser) => {
    try {
      const token = await fbUser.getIdToken()
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAppUser(data.user)
      }
    } catch (error) {
      console.error('Error syncing user:', error)
    }
  }, [])

  // Refresh user data from database
  const refreshUser = useCallback(async () => {
    if (firebaseUser) {
      await syncUser(firebaseUser)
    }
  }, [firebaseUser, syncUser])

  useEffect(() => {
    // If Firebase is not configured, don't try to listen for auth state
    if (!isFirebaseConfigured) {
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      
      if (user) {
        await syncUser(user)
      } else {
        setAppUser(null)
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [syncUser])

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    if (!isFirebaseConfigured) {
      return { success: false, error: 'Firebase belum dikonfigurasi. Hubungi administrator.' }
    }
    
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)
      await syncUser(result.user)
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
      const result = await signInWithPopup(auth, googleProvider)
      await syncUser(result.user)
      return { success: true }
    } catch (error) {
      const authError = error as AuthError
      return { success: false, error: getAuthErrorMessage(authError) }
    }
  }

  const signOut = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth)
      setAppUser(null)
    }
  }

  // Derived values for convenience
  const userRole = appUser?.role || null
  const isApproved = appUser?.approved || false

  return (
    <AuthContext.Provider value={{ 
      firebaseUser,
      appUser,
      loading, 
      isConfigured: isFirebaseConfigured,
      userRole,
      isApproved,
      signIn, 
      signInWithGoogle, 
      signOut,
      getToken,
      refreshUser
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
  
  // Backward compatibility: expose 'user' as alias for 'firebaseUser'
  return {
    ...context,
    user: context.firebaseUser
  }
}
