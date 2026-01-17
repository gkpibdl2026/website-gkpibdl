'use client'

import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { use } from 'react'
import WartaPublicViewer from '@/features/warta/components/WartaPublicViewer'
import { Warta } from '@/lib/supabase'

interface Props {
  params: Promise<{ id: string }>
}

export default function WartaDetailPage({ params }: Props) {
  const { id } = use(params)
  const [warta, setWarta] = useState<Warta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWarta = async () => {
      try {
        const res = await fetch(`/api/warta/${id}`)
        if (!res.ok) {
          if (res.status === 404) {
            setError('not_found')
          } else {
            setError('failed')
          }
          return
        }
        const { data } = await res.json()
        
        // Check if warta is published
        if (!data.published) {
          setError('not_found')
          return
        }
        
        setWarta(data)
      } catch (e) {
        console.error('Error fetching warta:', e)
        setError('failed')
      } finally {
        setIsLoading(false)
      }
    }

    fetchWarta()
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-gray-400">Memuat warta...</p>
        </div>
      </div>
    )
  }

  if (error === 'not_found' || !warta) {
    notFound()
  }

  if (error === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Gagal Memuat Warta</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-4">Terjadi kesalahan saat memuat warta. Silakan coba lagi nanti.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <WartaPublicViewer 
      warta={{
        id: warta.id,
        title: warta.title,
        date: warta.date,
        minggu_name: warta.minggu_name,
        modules: warta.modules || []
      }}
    />
  )
}
