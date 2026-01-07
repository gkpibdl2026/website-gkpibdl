'use client'

import Link from 'next/link'
import { useState } from 'react'

const daysOfWeek = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export default function NewJadwal() {
  const [formData, setFormData] = useState({
    name: '',
    day: 'Minggu',
    time: '',
    location: '',
    description: '',
    active: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/jadwal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        alert('Jadwal berhasil disimpan!')
        window.location.href = '/admin/jadwal'
      } else {
        throw new Error('Failed to save')
      }
    } catch {
      alert('Gagal menyimpan jadwal')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/admin/jadwal" className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <h2 className="text-2xl font-bold text-white">Tambah Jadwal Ibadah</h2>
        <p className="text-gray-300 mt-1">Buat jadwal ibadah baru</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nama Ibadah <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100"
              placeholder="Contoh: Ibadah Minggu Pagi"
              required
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-2">
                Hari <span className="text-red-500">*</span>
              </label>
              <select
                id="day"
                value={formData.day}
                onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 bg-white"
                required
              >
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700 mb-2">
                Waktu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
                placeholder="Contoh: 07:00 WIB"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Lokasi
            </label>
            <input
              type="text"
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500"
              placeholder="Contoh: Gedung Utama"
            />
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
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-green-500 resize-none"
              placeholder="Keterangan tambahan (opsional)"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={formData.active}
              onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-gray-700">Jadwal aktif (tampilkan di website)</label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/jadwal" className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
            Batal
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Jadwal'}
          </button>
        </div>
      </form>
    </div>
  )
}
