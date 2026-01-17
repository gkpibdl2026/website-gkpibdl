'use client'

import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react'
import { useNotification } from '@/features/common'
import { useRouter } from 'next/navigation'
import { useAutoSave, useUnsavedChanges } from '@/features/common'
import { CharacterCounter } from '@/components/ui/CharacterCounter'
import { WartaModuleBuilder, WartaPreviewModal } from '@/features/warta'
import { WartaModule } from '@/lib/supabase'

const DRAFT_KEY = 'warta_new'

// Helper function to get the next Sunday from today
function getNextSunday(): Date {
  const today = new Date()
  const currentDay = today.getDay() // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilSunday = currentDay === 0 ? 7 : 7 - currentDay // If today is Sunday, get next Sunday
  
  const nextSunday = new Date(today)
  nextSunday.setDate(today.getDate() + daysUntilSunday)
  
  return nextSunday
}

// Helper function to generate default warta title
function generateDefaultWartaTitle(date: Date): string {
  const day = date.getDate()
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ]
  const month = monthNames[date.getMonth()]
  const year = date.getFullYear()
  
  return `Warta Jemaat - Minggu ${day} ${month} ${year}`
}

// Helper function to format date as YYYY-MM-DD for input value
function formatDateForInput(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export default function NewWarta() {
  const nextSunday = getNextSunday()
  const defaultTitle = generateDefaultWartaTitle(nextSunday)
  const defaultDate = formatDateForInput(nextSunday)
  
  const [formData, setFormData] = useState({
    title: defaultTitle,
    date: defaultDate,
    minggu_name: '',
    status: 'draft',
    modules: [] as WartaModule[],
  })
  const [initialData, setInitialData] = useState({
    title: defaultTitle,
    date: defaultDate,
    minggu_name: '',
    status: 'draft',
    modules: [] as WartaModule[],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDraftBanner, setShowDraftBanner] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const { showToast, showConfirm } = useNotification()
  const router = useRouter()

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialData)
  }, [formData, initialData])

  // Auto-save hook
  const { loadDraft, clearDraft, getDraftTimestamp, hasDraft } = useAutoSave({
    key: DRAFT_KEY,
    data: formData,
    delay: 1500,
    enabled: hasChanges,
  })

  // Unsaved changes warning
  useUnsavedChanges({
    hasChanges,
    message: 'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?',
  })

  // Load draft on mount
  useEffect(() => {
    if (hasDraft()) {
      setShowDraftBanner(true)
    }
  }, [hasDraft])

  // Restore draft
  const handleRestoreDraft = () => {
    const draft = loadDraft()
    if (draft) {
      setFormData(draft)
      setInitialData(draft)
      setShowDraftBanner(false)
      showToast('Draft berhasil dimuat', 'success')
    }
  }

  // Dismiss draft
  const handleDismissDraft = () => {
    clearDraft()
    setShowDraftBanner(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch('/api/warta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          date: formData.date,
          minggu_name: formData.minggu_name,
          published: formData.status === 'published',
          modules: formData.modules,
        }),
      })
      
      if (res.ok) {
        clearDraft() // Clear draft after successful save
        showToast('Warta berhasil disimpan!', 'success')
        router.push('/admin/warta')
      } else {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving warta:', error)
      showToast('Gagal menyimpan warta. Silakan coba lagi.', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle cancel with unsaved changes
  const handleCancel = () => {
    if (hasChanges) {
      showConfirm(
        'Perubahan Belum Disimpan',
        'Ada perubahan yang belum disimpan. Yakin ingin meninggalkan halaman?',
        () => {
          router.push('/admin/warta')
        }
      )
    } else {
      router.push('/admin/warta')
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Draft Banner */}
      {showDraftBanner && (
        <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Draft tersedia</p>
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Terakhir disimpan: {getDraftTimestamp()?.toLocaleString('id-ID') || 'Tidak diketahui'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDismissDraft}
              className="px-3 py-1.5 text-sm text-amber-600 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
            >
              Abaikan
            </button>
            <button
              type="button"
              onClick={handleRestoreDraft}
              className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Pulihkan
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/admin/warta" 
          className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-4"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Kembali
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Tambah Warta Baru</h2>
            <p className="text-gray-300 mt-1">Buat berita atau renungan baru untuk jemaat</p>
          </div>
          {hasChanges && (
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></span>
              Draft otomatis tersimpan
            </span>
          )}
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Judul Warta <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
              placeholder="Masukkan judul warta"
              required
            />
            <CharacterCounter value={formData.title} maxLength={200} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                required
              />
              {formData.date && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Format: {new Date(formData.date + 'T00:00:00').toLocaleDateString('id-ID', { 
                    day: '2-digit', 
                    month: '2-digit', 
                    year: 'numeric' 
                  })}
                </p>
              )}
            </div>

            {/* Minggu Name */}
            <div>
              <label htmlFor="minggu_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nama Minggu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="minggu_name"
                value={formData.minggu_name}
                onChange={(e) => setFormData({ ...formData, minggu_name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400"
                placeholder="Contoh: Advent I, Epifania, dll"
                required
              />
            </div>
          </div>

          {/* Modules */}
          <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
            <WartaModuleBuilder 
              modules={formData.modules}
              onChange={(modules) => setFormData({ ...formData, modules })}
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="draft"
                  checked={formData.status === 'draft'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Draft</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="published"
                  checked={formData.status === 'published'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-gray-700 dark:text-gray-300">Publish Langsung</span>
              </label>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 text-red-500 dark:text-red-400 font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => setShowPreview(true)}
            className="px-6 py-3 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Warta'}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      <WartaPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title={formData.title}
        date={formData.date}
        mingguName={formData.minggu_name}
        modules={formData.modules}
      />
    </div>
  )
}
