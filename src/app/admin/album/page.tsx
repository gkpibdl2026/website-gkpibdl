'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

interface Album {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  category: string
  event_date: string | null
  photo_count: number
  active: boolean
}

interface AlbumPhoto {
  id: string
  album_id: string
  image_url: string
  caption: string | null
  sort_order: number
}

const categories = [
  { value: 'umum', label: 'Umum' },
  { value: 'ibadah', label: 'Ibadah' },
  { value: 'persekutuan', label: 'Persekutuan' },
  { value: 'pelayanan', label: 'Pelayanan' },
  { value: 'sosial', label: 'Kegiatan Sosial' },
]

const getImageUrl = (url: string | null): string => {
  if (!url) return ''
  if (url.startsWith('data:') || url.startsWith('http')) return url
  if (url.startsWith('/api/images/')) return url
  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  return `/api/images/${cleanPath}`
}

export default function AlbumAdminPage() {
  const { showToast } = useToast()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState<Album | null>(null)
  const [showPhotoManager, setShowPhotoManager] = useState<string | null>(null)
  const [photos, setPhotos] = useState<AlbumPhoto[]>([])
  const [uploadingCover, setUploadingCover] = useState(false)
  const [uploadingPhotos, setUploadingPhotos] = useState(false)
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([])
  const [pendingPreviews, setPendingPreviews] = useState<string[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cover_image: '',
    category: 'umum',
    event_date: ''
  })

  const fetchAlbums = async () => {
    try {
      const res = await fetch('/api/album')
      const data = await res.json()
      if (Array.isArray(data)) setAlbums(data)
    } catch (error) {
      console.error('Error fetching albums:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPhotos = async (albumId: string) => {
    try {
      const res = await fetch(`/api/album/${albumId}/photos`)
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to fetch photos')
      }
      const data = await res.json()
      if (Array.isArray(data)) setPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
      setPhotos([])
      showToast('error', 'Gagal memuat foto. Pastikan tabel album_photos sudah dibuat di Supabase.')
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran file maksimal 5MB')
      return
    }

    setUploadingCover(true)
    try {
      const formDataUpload = new FormData()
      formDataUpload.append('file', file)
      formDataUpload.append('folder', 'album')

      const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Upload failed')
      }
      const data = await res.json()
      setFormData(prev => ({ ...prev, cover_image: data.url }))
      showToast('success', 'Cover berhasil diupload')
    } catch (error) {
      console.error('Error uploading:', error)
      showToast('error', error instanceof Error ? error.message : 'Gagal mengupload gambar')
    } finally {
      setUploadingCover(false)
    }
  }

  const handlePendingPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const validFiles = Array.from(files).filter(f => f.size <= 5 * 1024 * 1024)
    setPendingPhotos(prev => [...prev, ...validFiles])
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPendingPreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePendingPhoto = (index: number) => {
    setPendingPhotos(prev => prev.filter((_, i) => i !== index))
    setPendingPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, albumId: string) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingPhotos(true)
    try {
      const uploadedPhotos = []
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) continue
        
        const formDataUpload = new FormData()
        formDataUpload.append('file', file)
        formDataUpload.append('folder', 'album')

        const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
        if (res.ok) {
          const data = await res.json()
          uploadedPhotos.push({ image_url: data.url })
        }
      }

      if (uploadedPhotos.length > 0) {
        await fetch(`/api/album/${albumId}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(uploadedPhotos)
        })
        fetchPhotos(albumId)
        fetchAlbums()
      }
    } catch (error) {
      console.error('Error uploading photos:', error)
    } finally {
      setUploadingPhotos(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      let albumId = editingAlbum?.id
      
      if (editingAlbum) {
        await fetch(`/api/album/${editingAlbum.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
      } else {
        const res = await fetch('/api/album', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        })
        const data = await res.json()
        albumId = data.id
      }

      // Upload pending photos if any
      if (albumId && pendingPhotos.length > 0) {
        setUploadingPhotos(true)
        const uploadedPhotos = []
        
        for (const file of pendingPhotos) {
          const formDataUpload = new FormData()
          formDataUpload.append('file', file)
          formDataUpload.append('folder', 'album')

          const res = await fetch('/api/upload', { method: 'POST', body: formDataUpload })
          if (res.ok) {
            const data = await res.json()
            uploadedPhotos.push({ image_url: data.url })
          }
        }

        if (uploadedPhotos.length > 0) {
          await fetch(`/api/album/${albumId}/photos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(uploadedPhotos)
          })
        }
        setUploadingPhotos(false)
      }
      
      setShowForm(false)
      setEditingAlbum(null)
      setFormData({ title: '', description: '', cover_image: '', category: 'umum', event_date: '' })
      setPendingPhotos([])
      setPendingPreviews([])
      fetchAlbums()
    } catch (error) {
      console.error('Error saving album:', error)
      setUploadingPhotos(false)
    }
  }

  const handleEdit = (album: Album) => {
    setFormData({
      title: album.title,
      description: album.description || '',
      cover_image: album.cover_image || '',
      category: album.category,
      event_date: album.event_date || ''
    })
    setEditingAlbum(album)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus album beserta semua fotonya?')) return
    try {
      await fetch(`/api/album/${id}`, { method: 'DELETE' })
      fetchAlbums()
    } catch (error) {
      console.error('Error deleting album:', error)
    }
  }

  const handleDeletePhoto = async (photoId: string, albumId: string) => {
    if (!confirm('Hapus foto ini?')) return
    try {
      await fetch(`/api/album/${albumId}/photos?photoId=${photoId}`, { method: 'DELETE' })
      fetchPhotos(albumId)
      fetchAlbums()
    } catch (error) {
      console.error('Error deleting photo:', error)
    }
  }

  const openPhotoManager = (albumId: string) => {
    setShowPhotoManager(albumId)
    fetchPhotos(albumId)
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Album Galeri</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Kelola album foto kegiatan</p>
        </div>
        <button
          onClick={() => {
            setShowForm(true)
            setEditingAlbum(null)
            setFormData({ title: '', description: '', cover_image: '', category: 'umum', event_date: '' })
            setPendingPhotos([])
            setPendingPreviews([])
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white! font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Album
        </button>
      </div>

      {/* Album Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto p-5">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              {editingAlbum ? 'Edit Album' : 'Buat Album Baru'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Judul Album</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  placeholder="Contoh: Natal 2025"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover</label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 overflow-hidden flex items-center justify-center bg-gray-50 dark:bg-gray-700 shrink-0">
                    {formData.cover_image ? (
                      <Image src={getImageUrl(formData.cover_image)} alt="Cover" width={64} height={64} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                  </div>
                  <label className={`flex-1 flex flex-col items-center justify-center h-16 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${uploadingCover ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                    <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" disabled={uploadingCover} />
                    {uploadingCover ? (
                      <span className="text-xs text-blue-600">Mengupload...</span>
                    ) : (
                      <span className="text-xs text-gray-500 dark:text-gray-400">Upload cover</span>
                    )}
                  </label>
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


              {/* Inline Photo Upload - only for new albums */}
              {!editingAlbum && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Album</label>
                  <label className={`flex flex-col items-center justify-center w-full h-20 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${pendingPhotos.length > 0 ? 'border-green-400 bg-green-50 dark:bg-green-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
                    <input type="file" accept="image/*" multiple onChange={handlePendingPhotos} className="hidden" />
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {pendingPhotos.length > 0 ? `${pendingPhotos.length} foto dipilih` : 'Klik untuk pilih foto (bisa banyak)'}
                    </span>
                  </label>
                  
                  {/* Pending photos preview */}
                  {pendingPreviews.length > 0 && (
                    <div className="grid grid-cols-4 gap-1 mt-2">
                      {pendingPreviews.map((preview, index) => (
                        <div key={index} className="relative aspect-square rounded overflow-hidden group">
                          <Image src={preview} alt="" fill className="object-cover" />
                          <button
                            type="button"
                            onClick={() => removePendingPhoto(index)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 bg-red-500 text-white rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Photo Manager Button - for editing existing albums */}
              {editingAlbum && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto Album ({editingAlbum.photo_count} foto)</label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false)
                      openPhotoManager(editingAlbum.id)
                    }}
                    className="w-full px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Kelola Foto Album
                  </button>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-medium rounded-lg text-sm hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors" disabled={uploadingPhotos}>
                  Batal
                </button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white! font-medium rounded-lg text-sm flex items-center justify-center gap-2" disabled={uploadingPhotos}>
                  {uploadingPhotos ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                      Mengupload...
                    </>
                  ) : (
                    editingAlbum ? 'Simpan' : `Buat Album${pendingPhotos.length > 0 ? ` (${pendingPhotos.length} foto)` : ''}`
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Manager Modal */}
      {showPhotoManager && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Kelola Foto</h2>
              <button onClick={() => setShowPhotoManager(null)} className="text-gray-500 hover:text-gray-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Upload Photos */}
            <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-xl cursor-pointer transition-colors mb-4 ${uploadingPhotos ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'}`}>
              <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, showPhotoManager)} className="hidden" disabled={uploadingPhotos} />
              {uploadingPhotos ? (
                <>
                  <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  <span className="text-sm text-blue-600 mt-2">Mengupload foto...</span>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="text-sm text-gray-500 dark:text-gray-400 mt-1">Klik untuk upload foto (bisa pilih banyak)</span>
                </>
              )}
            </label>

            {/* Photo Grid */}
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo) => (
                <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
                  <Image src={getImageUrl(photo.image_url)} alt="" fill className="object-cover" />
                  <button
                    onClick={() => handleDeletePhoto(photo.id, showPhotoManager)}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {photos.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">Belum ada foto dalam album ini</p>
            )}
          </div>
        </div>
      )}

      {/* Album Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      ) : albums.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {albums.map((album) => (
            <div key={album.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="aspect-video relative bg-gray-100 dark:bg-gray-700 cursor-pointer" onClick={() => openPhotoManager(album.id)}>
                {album.cover_image ? (
                  <Image src={getImageUrl(album.cover_image)} alt={album.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-white text-xs">
                  {album.photo_count} foto
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-gray-900 dark:text-white line-clamp-1">{album.title}</h3>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    {album.event_date ? new Date(album.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full capitalize">
                    {categories.find(c => c.value === album.category)?.label || album.category}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => openPhotoManager(album.id)} className="flex-1 px-2 py-1.5 text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                    Kelola Foto
                  </button>
                  <button onClick={() => handleEdit(album)} className="px-2 py-1.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(album.id)} className="px-2 py-1.5 text-xs bg-red-50 dark:bg-red-900/20 text-red-600 rounded-lg">
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
          <p className="text-gray-500 dark:text-gray-400">Belum ada album</p>
          <button onClick={() => setShowForm(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white! font-medium rounded-xl">
            Buat Album Pertama
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
