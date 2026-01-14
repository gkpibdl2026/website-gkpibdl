'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth'

interface Warta {
  id: string
  title: string
  created_at: string
  published: boolean
}

interface Stats {
  totalWarta: number
  totalPengumuman: number
  totalJadwal: number
  totalKeuangan: number
}

// Function to extract name from email and capitalize each word
const getNameFromEmail = (email: string | null | undefined): string => {
  if (!email) return 'Admin'
  
  // Get part before @
  const namePart = email.split('@')[0]
  
  // Replace dots, underscores, numbers with spaces
  const cleaned = namePart.replace(/[._0-9]/g, ' ').trim()
  
  // Capitalize first letter of each word
  const capitalized = cleaned
    .split(' ')
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
  
  return capitalized || 'Admin'
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats>({
    totalWarta: 0,
    totalPengumuman: 0,
    totalJadwal: 0,
    totalKeuangan: 0,
  })
  const [recentWarta, setRecentWarta] = useState<Warta[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const userName = getNameFromEmail(user?.email)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [wartaRes, pengumumanRes, jadwalRes, keuanganRes] = await Promise.all([
        fetch('/api/warta'),
        fetch('/api/pengumuman'),
        fetch('/api/jadwal'),
        fetch('/api/keuangan'),
      ])

      if (wartaRes.ok) {
        const { data } = await wartaRes.json()
        setStats(prev => ({ ...prev, totalWarta: data?.length || 0 }))
        setRecentWarta((data || []).slice(0, 3))
      }
      if (pengumumanRes.ok) {
        const { data } = await pengumumanRes.json()
        setStats(prev => ({ ...prev, totalPengumuman: data?.length || 0 }))
      }
      if (jadwalRes.ok) {
        const { data } = await jadwalRes.json()
        setStats(prev => ({ ...prev, totalJadwal: data?.length || 0 }))
      }
      if (keuanganRes.ok) {
        const { data } = await keuanganRes.json()
        setStats(prev => ({ ...prev, totalKeuangan: data?.length || 0 }))
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const statCards = [
    { label: 'Total Warta', value: stats.totalWarta, icon: 'newspaper', color: 'blue' },
    { label: 'Pengumuman Aktif', value: stats.totalPengumuman, icon: 'megaphone', color: 'purple' },
    { label: 'Jadwal Ibadah', value: stats.totalJadwal, icon: 'calendar', color: 'green' },
    { label: 'Laporan Keuangan', value: stats.totalKeuangan, icon: 'currency', color: 'amber' },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Selamat Datang, {userName}!</h2>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola konten website GKPI Bandar Lampung dari sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
              stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' :
              stat.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400' :
              stat.color === 'green' ? 'bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400' :
              'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
            }`}>
              {stat.icon === 'newspaper' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              )}
              {stat.icon === 'megaphone' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )}
              {stat.icon === 'calendar' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {stat.icon === 'currency' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-2"></div>
                <div className="h-4 bg-gray-100 dark:bg-gray-600 rounded w-24"></div>
              </div>
            ) : (
              <>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-gray-700 dark:text-white text-sm mt-1">{stat.label}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Warta */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Warta Terbaru</h3>
            <Link href="/admin/warta" className="text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="animate-pulse flex items-center justify-between">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-100 dark:bg-gray-600 rounded w-1/4"></div>
                    </div>
                    <div className="h-6 bg-gray-100 dark:bg-gray-600 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : recentWarta.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                Belum ada warta
              </div>
            ) : (
              recentWarta.map((warta) => (
                <Link 
                  key={warta.id} 
                  href={`/admin/warta/${warta.id}/edit`}
                  className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{warta.title}</p>
                    <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{formatDate(warta.created_at)}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    warta.published 
                      ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}>
                    {warta.published ? 'Published' : 'Draft'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Aksi Cepat</h3>
          <div className="grid gap-3">
            <Link 
              href="/admin/warta/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-blue-200 dark:hover:border-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Tambah Warta Baru</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Buat berita atau renungan baru</p>
              </div>
            </Link>
            <Link 
              href="/admin/pengumuman/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-purple-200 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Tambah Pengumuman</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Buat pengumuman untuk jemaat</p>
              </div>
            </Link>
            <Link 
              href="/admin/keuangan/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-600 hover:border-amber-200 dark:hover:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white text-sm">Tambah Laporan Keuangan</p>
                <p className="text-gray-500 dark:text-gray-400 text-xs">Upload laporan keuangan bulanan</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
