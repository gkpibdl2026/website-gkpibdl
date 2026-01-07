'use client'

import Link from 'next/link'
import { useState } from 'react'

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
        alert('Laporan keuangan berhasil disimpan!')
        window.location.href = '/admin/keuangan'
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      alert('Gagal menyimpan laporan')
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
        <p className="text-gray-300 mt-1">Input laporan keuangan bulanan gereja</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Judul Laporan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                placeholder="Contoh: Laporan Bulanan"
                required
              />
            </div>
            <div>
              <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-2">
                Periode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="period"
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500"
                placeholder="Contoh: Januari 2026"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Keterangan
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-amber-500 resize-none"
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <label htmlFor="pemasukan" className="block text-sm font-medium text-gray-700 mb-2">
                Pemasukan (Rp)
              </label>
              <input
                type="number"
                id="pemasukan"
                value={formData.pemasukan}
                onChange={(e) => setFormData({ ...formData, pemasukan: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="pengeluaran" className="block text-sm font-medium text-gray-700 mb-2">
                Pengeluaran (Rp)
              </label>
              <input
                type="number"
                id="pengeluaran"
                value={formData.pengeluaran}
                onChange={(e) => setFormData({ ...formData, pengeluaran: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-red-500"
                placeholder="0"
              />
            </div>
            <div>
              <label htmlFor="saldo" className="block text-sm font-medium text-gray-700 mb-2">
                Saldo Akhir (Rp)
              </label>
              <input
                type="number"
                id="saldo"
                value={formData.saldo}
                onChange={(e) => setFormData({ ...formData, saldo: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Dokumen PDF
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-300 transition-colors cursor-pointer">
              <svg className="w-10 h-10 mx-auto text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-gray-600 text-sm">Klik untuk upload PDF laporan</p>
              <p className="text-gray-400 text-xs mt-1">PDF hingga 10MB</p>
              <input type="file" className="hidden" accept=".pdf" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/keuangan" className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
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
