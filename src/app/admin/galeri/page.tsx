'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface GaleriItem {
  id: string
  title: string
  image_url: string
  category: string
  description: string | null
  event_date: string | null
  active: boolean
}

const categories = [
  { value: 'umum', label: 'Umum' },
  { value: 'ibadah', label: 'Ibadah' },
  { value: 'persekutuan', label: 'Persekutuan' },
  { value: 'pelayanan', label: 'Pelayanan' },
  { value: 'sosial', label: 'Kegiatan Sosial' },
]

// Helper function to ensure image URL is valid
const getImageUrl = (url: string | null): string => {
  if (!url) return ''
  
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url
  }
  
  if (url.startsWith('/api/images/')) {
    return url
  }
  
  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  return `/api/images/${cleanPath}`
}

export default function GaleriAdminPage() {
  const [data, setData] = useState<GaleriItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    category: 'umum',
    description: '',
    event_date: ''
  })

  const fetchData = async () => {
    try {
      const res = await fetch('/api/galeri')
      const json = await res.json()
      if (Array.isArray(json)) setData(json)
    } catch (error) {
      console.error('Error fetching:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran file maksimal 5MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setUploadingImage(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'galeri')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload
      })

      if (!res.ok) {
        throw new Error('Upload failed')
      }

      const data = await res.json()
      setFormData(prev => ({ ...prev, image_url: data.url }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Gagal mengupload gambar. Silakan coba lagi.')
      setImagePreview(null)
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.image_url) {
      alert('Silakan upload gambar atau masukkan URL gambar')
      return
    }
    
    try {
      const payload = {
        ...formData,
        event_date: formData.event_date || null
      }
      
      if (editingId) {
        await fetch(`/api/galeri/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch('/api/galeri', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }
      
      setShowForm(false)
      setEditingId(null)
      setImagePreview(null)
      setFormData({ title: '', image_url: '', category: 'umum', description: '', event_date: '' })
      fetchData()
    } catch (error) {
      console.error('Error saving:', error)
    }
  }

  const handleEdit = (item: GaleriItem) => {
    setFormData({
      title: item.title,
      image_url: item.image_url,
      category: item.category,
      description: item.description || '',
      event_date: item.event_date || ''
    })
    setImagePreview(item.image_url ? getImageUrl(item.image_url) : null)
    setEditingId(item.id)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto ini?')) return
    
    try {
      await fetch(`/api/galeri/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Galeri Dokumentasi</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola foto kegiatan gereja</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingId(null)
            setImagePreview(null)
            setFormData({ title: '', image_url: '', category: 'umum', description: '', event_date: '' })
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white! font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Foto
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? 'Edit Foto' : 'Tambah Foto Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Judul foto/kegiatan"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Gambar</label>
                <div className="flex items-start gap-2">
                  {/* Preview */}
                  <div className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                    {imagePreview || formData.image_url ? (
                      <Image
                        src={getImageUrl(imagePreview || formData.image_url)}
                        alt="Preview"
                        width={56}
                        height={56}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  
                  {/* Upload Button */}
                  <div className="flex-1">
                    <label className={`relative flex flex-col items-center justify-center w-full h-14 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadingImage ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                          <span className="text-xs text-blue-600 dark:text-blue-400">Mengupload...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <span className="text-xs text-gray-500 dark:text-gray-400">Upload</span>
                        </>
                      )}
                    </label>
                  </div>
                </div>
                
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-400 shrink-0">atau URL:</span>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => {
                      setFormData({ ...formData, image_url: e.target.value })
                      setImagePreview(null)
                    }}
                    className="flex-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-xs"
                    placeholder="https://..."
                  />
                  {formData.image_url && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, image_url: '' })
                        setImagePreview(null)
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>{cat.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tanggal</label>
                  <input
                    type="date"
                    value={formData.event_date}
                    onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deskripsi</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Opsional"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white! font-medium rounded-lg text-sm"
                >
                  {editingId ? 'Simpan' : 'Tambah'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : data.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {data.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden group">
              <div className="aspect-square relative">
                <Image src={getImageUrl(item.image_url)} alt={item.title} fill className="object-cover" />
                <div className="absolute top-2 left-2">
                  <span className="px-2 py-1 text-xs font-medium bg-black/50 text-white rounded-lg">
                    {categories.find(c => c.value === item.category)?.label || item.category}
                  </span>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-900 dark:text-white text-sm line-clamp-1">{item.title}</h3>
                {item.event_date && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                    {new Date(item.event_date).toLocaleDateString('id-ID')}
                  </p>
                )}
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="flex-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 px-2 py-1 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-500 dark:text-gray-400">Belum ada foto di galeri</p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white! font-medium rounded-xl"
          >
            Tambah Foto Pertama
          </button>
        </div>
      )}

      <div className="mt-6">
        <Link href="/tentang" className="text-blue-600 hover:underline text-sm">
          ← Lihat halaman Tentang Kami
        </Link>
      </div>
    </div>
  )
}
