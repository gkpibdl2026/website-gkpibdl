'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { JSX, useEffect, useState, useRef } from 'react'
import { useAuth } from '@/features/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { ToastProvider } from '@/components/ui/Toast'
import { Breadcrumb } from '@/components/ui/Breadcrumb'

// Helper function to check if current path matches or is a child of sidebar item
const isActiveRoute = (pathname: string, itemHref: string): boolean => {
  if (itemHref === '/admin') {
    return pathname === '/admin'
  }
  return pathname === itemHref || pathname.startsWith(itemHref + '/')
}

const sidebarItems = [
  { href: '/admin', label: 'Dashboard', icon: 'home' },
  { href: '/admin/warta', label: 'Warta', icon: 'newspaper' },
  { href: '/admin/pengumuman', label: 'Pengumuman', icon: 'megaphone' },
  { href: '/admin/renungan', label: 'Renungan Harian', icon: 'book' },
  { href: '/admin/keuangan', label: 'Keuangan', icon: 'currency' },
  { href: '/admin/pembayaran', label: 'Pembayaran', icon: 'qris' },
  { href: '/admin/jadwal', label: 'Jadwal Ibadah', icon: 'calendar' },
  { href: '/admin/struktur', label: 'Struktur Organisasi', icon: 'users' },
  { href: '/admin/album', label: 'Album Galeri', icon: 'image' },
  { href: '/admin/manage-user', label: 'User Management', icon: 'shield', adminOnly: true },
]

const icons: Record<string, JSX.Element> = {
  home: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  newspaper: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
    </svg>
  ),
  megaphone: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  currency: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  calendar: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  image: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  shield: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  book: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  qris: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  ),
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, signOut, userRole, isApproved, appUser } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (hasRedirected.current) return
    
    // Only redirect if not authenticated
    if (!loading && !user) {
      hasRedirected.current = true
      router.replace('/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Show access denied for jemaat users (inline, no redirect)
  if (userRole === 'jemaat') {
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
              onClick={async () => {
                await signOut()
                router.push('/login')
              }}
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

  // Show pending approval message for non-approved users
  if (appUser && !isApproved && userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Menunggu Persetujuan Admin</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Akun Anda sedang menunggu persetujuan dari administrator. Silakan hubungi admin untuk mengaktifkan akses Anda.</p>
          <button
            onClick={async () => {
              await signOut()
              router.push('/login')
            }}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  // Show editor restriction message
  if (userRole === 'editor') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Akses Editor</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Saat ini role Editor belum memiliki akses ke menu admin. Fitur ini akan segera tersedia.</p>
          <button
            onClick={async () => {
              await signOut()
              router.push('/login')
            }}
            className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Mobile Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-64 bg-[#1e3a5f] dark:bg-gray-800 border-r border-[#2d4a6f] dark:border-gray-700 z-50 transform transition-transform duration-300 ease-in-out print:hidden overflow-y-auto admin-scrollbar ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#2d4a6f] dark:border-gray-700">
          <Link href="/admin" className="flex items-center gap-3">
            <Image 
              src="/logo-gkpi.png" 
              alt="Logo GKPI"
              width={32}
              height={32}
              className="w-8 h-8 rounded-lg object-contain bg-white/10 p-0.5"
            />
            <div>
              <p className="font-bold text-white! text-sm leading-tight">GKPI Admin</p>
              <p className="text-xs text-white!">Dashboard</p>
            </div>
          </Link>
          {/* Close button for mobile */}
          <button 
            className="lg:hidden p-2 rounded-lg hover:bg-[#2d4a6f] dark:hover:bg-gray-700 text-white!"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Nav Items */}
        <nav className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-200px)] pb-4 admin-scrollbar">
          {sidebarItems
            .filter(item => !('adminOnly' in item) || (item.adminOnly && userRole === 'admin'))
            .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                isActiveRoute(pathname, item.href)
                  ? 'bg-blue-600/20 text-white! border-l-4 border-blue-400'
                  : 'text-white! hover:bg-[#2d4a6f] dark:hover:bg-gray-700 hover:text-white!'
              }`}
            >
              {icons[item.icon]}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Logout & Back */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#2d4a6f] dark:border-gray-700 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white! hover:bg-[#2d4a6f] dark:hover:bg-gray-700 hover:text-white! transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Kembali ke Website
          </Link>
          <button
            onClick={async () => {
              await signOut()
              router.push('/login')
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-300 hover:bg-red-500/20 hover:text-red-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:pl-64 print:pl-0 print:w-full">
        {/* Top Bar */}
        <header className="h-14 md:h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-2 md:px-6 sticky top-0 z-10 print:hidden">
          <div className="flex items-center gap-1 md:gap-4 min-w-0 flex-1">
            {/* Mobile menu button */}
            <button 
              className="lg:hidden p-1.5 md:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-200 shrink-0"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-semibold text-gray-900 dark:text-white truncate" style={{ fontSize: 'clamp(18px, 3vw, 24px)' }}>Dashboard Admin</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-3 shrink-0">
            {/* Theme Toggle */}
            <ThemeToggle />
            {/* User Avatar */}
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
              <span className="text-[10px] md:text-sm font-medium text-white">A</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-6 pb-20 lg:pb-6 bg-gray-50 dark:bg-gray-900 min-h-[calc(100vh-56px)] md:min-h-[calc(100vh-64px)] print:p-0 print:bg-white">
          <div className="print:hidden">
            <Breadcrumb />
          </div>
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-[#1e3a5f] dark:bg-gray-800 border-t border-[#2d4a6f] dark:border-gray-700 flex justify-around items-center h-14 lg:hidden z-30 px-1 print:hidden">
        {sidebarItems.slice(0, 5).map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center py-1.5 px-1 min-w-0 flex-1 rounded-lg transition-colors ${
              isActiveRoute(pathname, item.href)
                ? 'text-blue-400 bg-blue-600/20'
                : 'text-white! hover:text-white!'
            }`}
          >
            {icons[item.icon]}
            <span className="text-[9px] mt-0.5 truncate w-full text-center">{item.label.split(' ')[0]}</span>
          </Link>
        ))}
      </nav>
    </div>
    </ToastProvider>
  )
}
