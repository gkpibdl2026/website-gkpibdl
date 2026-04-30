'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'

interface PengumumanImageUploadProps {
  initialUrls?: string[]
  onUploadComplete: (urls: string[]) => void
}

const MAX_SIZE_MB = 5
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function PengumumanImageUpload({
  initialUrls = [],
  onUploadComplete,
}: PengumumanImageUploadProps) {
  const [urls, setUrls] = useState<string[]>(initialUrls)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadingCount, setUploadingCount] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null)
      const validFiles: File[] = []

      // Validasi file
      for (const file of Array.from(files)) {
        if (!ACCEPTED_TYPES.includes(file.type)) {
          setError(`Format ${file.name} tidak didukung.`)
          continue
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          setError(`${file.name} melebihi batas ukuran 5MB.`)
          continue
        }
        validFiles.push(file)
      }

      if (validFiles.length === 0) return

      setUploadingCount(validFiles.length)

      try {
        const uploadPromises = validFiles.map(async (file) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', 'pengumuman')

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          if (!res.ok) throw new Error('Upload gagal')
          const { url } = await res.json()
          return url as string
        })

        const newUrls = await Promise.all(uploadPromises)
        const updatedUrls = [...urls, ...newUrls]
        
        setUrls(updatedUrls)
        onUploadComplete(updatedUrls)
      } catch {
        setError('Gagal mengupload beberapa gambar.')
      } finally {
        setUploadingCount(0)
      }
    },
    [urls, onUploadComplete]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setIsDragging(false)
      if (e.dataTransfer.files?.length > 0) {
        handleFiles(e.dataTransfer.files)
      }
    },
    [handleFiles]
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      handleFiles(e.target.files)
    }
    e.target.value = ''
  }

  const handleRemove = (indexToRemove: number) => {
    const updatedUrls = urls.filter((_, idx) => idx !== indexToRemove)
    setUrls(updatedUrls)
    onUploadComplete(updatedUrls)
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        Galeri Pengumuman{' '}
        <span className="text-gray-400 font-normal">(Opsional - Bisa pilih banyak gambar)</span>
      </label>

      {/* Grid Galeri */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {urls.map((url, idx) => (
            <div key={idx} className="relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 group" style={{ aspectRatio: '1/1' }}>
              <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" unoptimized />
              
              {/* Overlay Hapus */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  className="px-3 py-1.5 bg-red-500/90 text-white text-xs font-medium rounded-lg hover:bg-red-600 transition-colors shadow-sm flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  Hapus
                </button>
              </div>
            </div>
          ))}

          {/* Slot Loading */}
          {uploadingCount > 0 && Array.from({ length: uploadingCount }).map((_, idx) => (
            <div key={`loading-${idx}`} className="relative rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center gap-2" style={{ aspectRatio: '1/1' }}>
               <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
               <span className="text-xs text-gray-500 font-medium">Upload...</span>
            </div>
          ))}
        </div>
      )}

      {/* Upload Drop Zone */}
      <div
        onClick={() => uploadingCount === 0 && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center gap-3 w-full py-8
          border-2 border-dashed rounded-xl cursor-pointer transition-all
          ${isDragging
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 bg-transparent'
          }
        `}
      >
        <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Tambah Gambar
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Bisa pilih lebih dari satu
          </p>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <p className="flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </p>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload gambar pengumuman"
      />
    </div>
  )
}
