'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth'
import Link from 'next/link'

export default function LoginNotAllowedPage() {
  const router = useRouter()
  const { signOut, appUser } = useAuth()

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Akses Ditolak
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          Akun <span className="font-medium text-gray-900 dark:text-white">{appUser?.email || 'Anda'}</span> tidak memiliki akses ke Admin Panel.
        </p>
        
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
          Jika Anda merasa ini adalah kesalahan, silakan hubungi administrator untuk mendapatkan akses.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors font-medium"
          >
            Kembali ke Website
          </Link>
          
          <button
            onClick={handleLogout}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout & Ganti Akun
          </button>
        </div>
      </div>
    </div>
  )
}
