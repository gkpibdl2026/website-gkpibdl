'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

export default function EditWarta() {
  const params = useParams()
  const id = params.id as string
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    published: false,
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
            content: data.content || '',
            excerpt: data.excerpt || '',
            published: data.published || false,
          })
        }
      } catch (error) {
        console.error('Error fetching warta:', error)
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
      const res = await fetch(`/api/warta/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        alert('Warta berhasil diupdate!')
        window.location.href = '/admin/warta'
      } else {
        throw new Error('Failed to update')
      }
    } catch {
      alert('Gagal mengupdate warta')
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
        <p className="text-gray-300 mt-1">Perbarui berita atau renungan</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Judul Warta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
              Ringkasan
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              rows={2}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
              Konten <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={12}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
              required
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
              <span className="text-gray-700">Draft</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                checked={formData.published}
                onChange={() => setFormData({ ...formData, published: true })}
                className="w-4 h-4"
              />
              <span className="text-gray-700">Published</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <Link href="/admin/warta" className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors">
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
