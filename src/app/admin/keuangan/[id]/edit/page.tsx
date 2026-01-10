'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useNotification } from '@/context/NotificationContext'

export default function EditKeuangan() {
  const params = useParams()
  const id = params.id as string
  const router = useRouter()
  const { showToast } = useNotification()
  
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    description: '',
    pemasukan: '',
    pengeluaran: '',
    saldo: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/keuangan/${id}`)
        if (res.ok) {
          const { data } = await res.json()
          setFormData({
            title: data.title || '',
            period: data.period || '',
            description: data.description || '',
            pemasukan: data.pemasukan?.toString() || '',
            pengeluaran: data.pengeluaran?.toString() || '',
            saldo: data.saldo?.toString() || '',
          })
        }
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`/api/keuangan/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pemasukan: parseInt(formData.pemasukan) || 0,
          pengeluaran: parseInt(formData.pengeluaran) || 0,
          saldo: parseInt(formData.saldo) || 0,
        }),
      })
      
      if (res.ok) {
        showToast('Laporan berhasil diupdate!', 'success')
        router.push('/admin/keuangan')
      } else {
        throw new Error('Failed')
      }
    } catch {
      showToast('Gagal mengupdate laporan', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/keuangan" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h2 className="text-2xl font-bold text-white">Edit Laporan Keuangan</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Judul</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Periode</label>
              <input
                type="text"
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Keterangan</label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="pemasukan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pemasukan (Rp)</label>
              <input
                type="number"
                id="pemasukan"
                value={formData.pemasukan}
                onChange={(e) => setFormData({ ...formData, pemasukan: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="pengeluaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pengeluaran (Rp)</label>
              <input
                type="number"
                id="pengeluaran"
                value={formData.pengeluaran}
                onChange={(e) => setFormData({ ...formData, pengeluaran: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
            <div>
              <label htmlFor="saldo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Saldo (Rp)</label>
              <input
                type="number"
                id="saldo"
                value={formData.saldo}
                onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/keuangan" className="px-6 py-3 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Batal</Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </div>
  )
}
