'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function NewPengumuman() {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    visible: true,
    expires_at: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/pengumuman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        alert('Pengumuman berhasil disimpan!')
        window.location.href = '/admin/pengumuman'
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      alert('Gagal menyimpan pengumuman')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/pengumuman" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h2 className="text-2xl font-bold text-white">Tambah Pengumuman</h2>
        <p className="text-gray-300 mt-1">Buat pengumuman baru untuk jemaat</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Judul Pengumuman <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100"
              placeholder="Masukkan judul pengumuman"
              required
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Isi Pengumuman <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 resize-none"
              placeholder="Tulis isi pengumuman..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Prioritas</label>
            <div className="flex gap-4">
              {[
                { value: 'normal', label: 'Info', color: 'gray' },
                { value: 'important', label: 'Penting', color: 'amber' },
                { value: 'urgent', label: 'Mendesak', color: 'red' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="priority"
                    value={opt.value}
                    checked={formData.priority === opt.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-4 h-4"
                  />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${opt.color}-100 text-${opt.color}-700`}>
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="expires" className="block text-sm font-medium text-gray-700 mb-2">
              Tanggal Kadaluarsa (Opsional)
            </label>
            <input
              type="date"
              id="expires"
              value={formData.expires_at}
              onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
            />
            <p className="text-gray-500 text-sm mt-1">Pengumuman akan otomatis disembunyikan setelah tanggal ini</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="visible" className="text-gray-700">Tampilkan langsung di website</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/pengumuman" className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Pengumuman'}
          </button>
        </div>
      </form>
    </div>
  )
}
