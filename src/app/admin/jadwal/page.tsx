'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useNotification } from '@/features/common'
import { CardsGridSkeleton } from '@/components/ui/Skeleton'

interface Jadwal {
  id: string
  name: string
  day: string
  time: string
  location: string
  active: boolean
}

export default function AdminJadwal() {
  const [jadwalData, setJadwalData] = useState<Jadwal[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const { showConfirm, showToast } = useNotification()

  const filteredData = jadwalData.filter(j => 
    j.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.day.toLowerCase().includes(searchTerm.toLowerCase())
  )

  useEffect(() => {
    fetchJadwal()
  }, [])

  const fetchJadwal = async () => {
    try {
      const res = await fetch('/api/jadwal')
      if (res.ok) {
        const { data } = await res.json()
        setJadwalData(data || [])
      }
    } catch (error) {
      console.error('Error fetching jadwal:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    showConfirm('Hapus Jadwal', 'Apakah Anda yakin ingin menghapus jadwal ini?', async () => {
      try {
        const res = await fetch(`/api/jadwal/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setJadwalData(jadwalData.filter(j => j.id !== id))
          showToast('Jadwal berhasil dihapus', 'success')
        } else {
          throw new Error('Failed to delete')
        }
      } catch {
        showToast('Gagal menghapus jadwal', 'error')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Jadwal Ibadah</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola jadwal ibadah gereja</p>
        </div>
        <Link 
          href="/admin/jadwal/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white! font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jadwal
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari jadwal berdasarkan nama atau hari..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
          />
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <CardsGridSkeleton count={6} />
      ) : filteredData.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {searchTerm ? 'Tidak ada jadwal yang cocok dengan pencarian' : 'Tidak ada jadwal ibadah ditemukan'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredData.map((jadwal) => (
            <div key={jadwal.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  jadwal.active ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                }`}>
                  {jadwal.active ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
              
              <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">{jadwal.name}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-medium mb-1">{jadwal.day}, {jadwal.time}</p>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{jadwal.location || 'Lokasi belum ditentukan'}</p>
              
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Link
                  href={`/admin/jadwal/${jadwal.id}/edit`}
                  className="flex-1 py-2 text-blue-600 dark:text-blue-400 font-medium hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors text-sm text-center"
                >
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(jadwal.id)}
                  className="flex-1 py-2 text-red-600 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors text-sm"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
