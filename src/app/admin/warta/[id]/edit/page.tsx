'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useNotification } from '@/features/common'
import { WartaModuleBuilder } from '@/features/warta'
import { WartaModule } from '@/lib/supabase'

export default function EditWarta() {
  const params = useParams()
  const id = params.id as string
  /* router removed */
  const { showToast } = useNotification()
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    minggu_name: '',
    published: false,
    modules: [] as WartaModule[],
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
            date: data.date || '',
            minggu_name: data.minggu_name || '',
            published: data.published || false,
            modules: data.modules || [],
          })
        }
      } catch (error) {
        console.error('Error fetching warta:', error)
        showToast('Gagal memuat data warta', 'error')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id, showToast])

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setIsSubmitting(true)
    
    try {
      const res = await fetch(`/api/warta/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        showToast('Warta berhasil diupdate!', 'success')
        // Don't redirect immediately to allow continued editing
      } else {
        throw new Error('Failed to update')
      }
    } catch {
      showToast('Gagal mengupdate warta', 'error')
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
    <div className="max-w-5xl mx-auto py-6">
      {/* Top Bar - Header & Actions */}
      <div className="flex items-center justify-between mb-8">
        <div>
           <Link href="/admin/warta" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm mb-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Daftar
          </Link>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            Editor Warta
            {formData.published ? (
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full border border-green-200">Published</span>
            ) : (
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full border border-gray-200">Draft</span>
            )}
          </h2>
        </div>
        
        <div className="flex items-center gap-3">
           <a 
            href={`/admin/warta/${id}/print`} 
            target="_blank"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Review PDF
          </a>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, published: !formData.published })}
            className={`flex items-center gap-2 px-4 py-2 font-medium rounded-lg transition-colors text-sm shadow-sm ${
              formData.published 
                ? 'bg-red-600 text-white hover:bg-red-700' 
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {formData.published ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Batalkan Publish
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Publikasikan
              </>
            )}
          </button>

           <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm shadow-sm"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Metadata Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-5">
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Judul Warta</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="md:col-span-4">
               <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Nama Minggu</label>
               <input
                type="text"
                value={formData.minggu_name}
                onChange={(e) => setFormData({ ...formData, minggu_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                placeholder="Contoh: Minggu II Setelah Epifania"
              />
            </div>
            <div className="md:col-span-3">
               <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Tanggal</label>
               <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900"
              />
            </div>
          </div>
        </div>

        {/* Modules Editor */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm min-h-125">
           <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">
             Isi Warta (Modul)
           </h3>
           <WartaModuleBuilder 
              modules={formData.modules}
              onChange={(modules) => setFormData({ ...formData, modules })}
            />
        </div>
      </div>
    </div>
  )
}
