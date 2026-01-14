'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useNotification } from '@/features/common'
import { useRouter } from 'next/navigation'

export default function NewKeuangan() {
  const [formData, setFormData] = useState({
    title: '',
    period: '',
    description: '',
    pemasukan: '',
    pengeluaran: '',
    saldo: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { showToast } = useNotification()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/keuangan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          pemasukan: parseInt(formData.pemasukan) || 0,
          pengeluaran: parseInt(formData.pengeluaran) || 0,
          saldo: parseInt(formData.saldo) || 0,
        }),
      })
      
      if (res.ok) {
        showToast('Laporan keuangan berhasil disimpan!', 'success')
        router.push('/admin/keuangan')
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      showToast('Gagal menyimpan laporan', 'error')
    } finally {
      setIsSubmitting(false)
    }
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
        <h2 className="text-2xl font-bold text-white">Tambah Laporan Keuangan</h2>
        <p className="text-white/80 mt-1">Input laporan keuangan bulanan gereja</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Contoh: Laporan Bulanan"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Periode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Contoh: Januari 2026"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keterangan
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="pemasukan" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pemasukan (Rp)
              </label>
              <input
                type="number"
                id="pemasukan"
                value={formData.pemasukan}
                onChange={(e) => setFormData({ ...formData, pemasukan: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-green-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="pengeluaran" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pengeluaran (Rp)
              </label>
              <input
                type="number"
                id="pengeluaran"
                value={formData.pengeluaran}
                onChange={(e) => setFormData({ ...formData, pengeluaran: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-red-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="saldo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Saldo Akhir (Rp)
              </label>
              <input
                type="number"
                id="saldo"
                value={formData.saldo}
                onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Upload Dokumen PDF
            </label>
            <div className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-xl p-6 text-center hover:border-amber-300 dark:hover:border-amber-500 transition-colors cursor-pointer bg-white dark:bg-gray-700/50">
              <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 dark:text-gray-400 text-sm">Klik untuk upload PDF laporan</p>
              <p className="text-gray-400 text-xs mt-1">PDF hingga 10MB</p>
              <input type="file" className="hidden" accept=".pdf" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/keuangan" className="px-6 py-3 text-red-500 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </div>
      </form>
    </div>
  )
}
