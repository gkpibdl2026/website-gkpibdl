'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/context/NotificationContext'
import WartaModuleBuilder from '@/components/admin/warta/WartaModuleBuilder'
import { WartaModule } from '@/lib/supabase'

export default function EditWarta() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { showToast } = useNotification()
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    minggu_name: '',
    published: false,
    modules: [] as WartaModule[],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    // Fetch existing data
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/warta/${id}`)
        if (res.ok) {
          const { data } = await res.json()
          setFormData({
            title: data.title || '',
            date: data.date || '',
            minggu_name: data.minggu_name || '',
            published: data.published || false,
            modules: data.modules || [],
          })
        }
      } catch (error) {
        console.error('Error fetching warta:', error)
        showToast('Gagal memuat data warta', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, showToast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`/api/warta/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        showToast('Warta berhasil diupdate!', 'success')
        router.push('/admin/warta')
      } else {
        throw new Error('Failed to update')
      }
    } catch {
      showToast('Gagal mengupdate warta', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/warta" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h2 className="text-2xl font-bold text-white">Edit Warta</h2>
        <p className="text-white/80 mt-1">Perbarui berita atau renungan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Judul Warta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>

            <div>
              <label htmlFor="minggu_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Minggu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="minggu_name"
                value={formData.minggu_name}
                onChange={(e) => setFormData({ ...formData, minggu_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <WartaModuleBuilder 
              modules={formData.modules}
              onChange={(modules) => setFormData({ ...formData, modules })}
            />
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={!formData.published}
                onChange={() => setFormData({ ...formData, published: false })}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300">Draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={formData.published}
                onChange={() => setFormData({ ...formData, published: true })}
                className="w-4 h-4"
              />
              <span className="text-gray-700 dark:text-gray-300">Published</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/warta" className="px-6 py-3 text-red-500 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
