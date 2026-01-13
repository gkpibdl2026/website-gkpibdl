'use client'

import { useState, useEffect } from 'react'
import { useNotification } from '@/context/NotificationContext'
import { Song, SongCategory, SongVerse } from '@/lib/supabase'
import SongVerseBuilder from '@/components/admin/songs/SongVerseBuilder'
import Link from 'next/link'

const CATEGORY_OPTIONS: { value: SongCategory; label: string }[] = [
  { value: 'KJ', label: 'Kidung Jemaat (KJ)' },
  { value: 'PKJ', label: 'Pelengkap Kidung Jemaat (PKJ)' },
  { value: 'NKB', label: 'Nyanyian Kidung Baru (NKB)' },
  { value: 'BE', label: 'Buku Ende (BE)' },
  { value: 'KK', label: 'Kidung Keesaan (KK)' },
]

export default function SongsPage() {
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSong, setEditingSong] = useState<Song | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    song_number: '',
    category: 'KJ' as SongCategory,
    lyrics: [] as SongVerse[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { showToast } = useNotification()

  const fetchSongs = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (searchTerm) params.append('query', searchTerm)
      if (categoryFilter) params.append('category', categoryFilter)
      
      const res = await fetch(`/api/songs?${params.toString()}`)
      const { data } = await res.json()
      setSongs(data || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
      showToast('Gagal memuat lagu', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSongs()
  }, [searchTerm, categoryFilter])

  const handleOpenModal = (song?: Song) => {
    if (song) {
      setEditingSong(song)
      setFormData({
        title: song.title,
        song_number: song.song_number,
        category: song.category,
        lyrics: song.lyrics || []
      })
    } else {
      setEditingSong(null)
      setFormData({
        title: '',
        song_number: '',
        category: 'KJ',
        lyrics: []
      })
    }
    setIsModalOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const url = editingSong ? `/api/songs/${editingSong.id}` : '/api/songs'
      const method = editingSong ? 'PUT' : 'POST'
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        showToast(editingSong ? 'Lagu berhasil diupdate' : 'Lagu berhasil ditambahkan', 'success')
        setIsModalOpen(false)
        fetchSongs()
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      showToast('Gagal menyimpan lagu', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Database Lagu</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Kelola database lagu gereja</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Lagu
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Cari judul lagu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        >
          <option value="">Semua Kategori</option>
          {CATEGORY_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : songs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">Belum ada lagu. Tambahkan lagu baru.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {songs.map((song) => (
            <div 
              key={song.id} 
              className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-between hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded">
                    {song.category} {song.song_number}
                  </span>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{song.title}</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {song.lyrics?.length || 0} Bait
                </p>
              </div>
              <button
                onClick={() => handleOpenModal(song)}
                className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingSong ? 'Edit Lagu' : 'Tambah Lagu Baru'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <form id="songForm" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Kategori
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value as SongCategory })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      {CATEGORY_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nomor Lagu
                    </label>
                    <input
                      type="text"
                      value={formData.song_number}
                      onChange={(e) => setFormData({ ...formData, song_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="Contoh: 123"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Judul Lagu
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Masukkan judul lagu"
                    required
                  />
                </div>

                <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                  <SongVerseBuilder 
                    verses={formData.lyrics}
                    onChange={(lyrics) => setFormData({ ...formData, lyrics })}
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex items-center justify-end gap-4 bg-gray-50 dark:bg-gray-800/50">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                form="songForm"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Menyimpan...' : 'Simpan Lagu'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
