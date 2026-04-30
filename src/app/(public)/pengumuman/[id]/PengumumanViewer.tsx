'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'

interface Pengumuman {
  id: string
  title: string
  content: string
  priority: string
  image_urls?: string[]
  created_at: string
}

interface Props {
  pengumuman: Pengumuman
}

// Helper function to convert URLs in text to clickable links
// Hanya mendeteksi URL yang dimulai dengan http://, https://, atau www. untuk menghindari false positive pada gelar (seperti M.Eng, S.Si)
function linkifyContent(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match
  let keyIndex = 0

  while ((match = urlRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }

    const url = match[0]
    const href = url.startsWith('http') ? url : `https://${url}`

    parts.push(
      <a
        key={`link-${keyIndex++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded underline underline-offset-2 decoration-cyan-400/50 hover:decoration-cyan-300 inline-flex items-center gap-1 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
        <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    )

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return parts.length > 0 ? parts : [text]
}

export default function PengumumanViewer({ pengumuman }: Props) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  useEffect(() => {
    if (!pengumuman.image_urls || pengumuman.image_urls.length <= 1) return

    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => 
        prev === pengumuman.image_urls!.length - 1 ? 0 : prev + 1
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [pengumuman.image_urls])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: '🔴 Mendesak', className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' }
      case 'important':
        return { label: '🟡 Penting', className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' }
      default:
        return { label: 'ℹ️ Info', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' }
    }
  }

  const priorityInfo = getPriorityLabel(pengumuman.priority)

  return (
    <>
      {/* Header */}
      <section className={`py-16 md:py-24 ${
        pengumuman.priority === 'urgent'
          ? 'bg-linear-to-br from-red-600 to-red-800'
          : pengumuman.priority === 'important'
          ? 'bg-linear-to-br from-amber-500 to-orange-600'
          : 'bg-linear-to-br from-blue-600 to-purple-700'
      } text-white`}>
        <div className="container max-w-4xl">
          <Link href="/pengumuman" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Pengumuman
          </Link>

          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${priorityInfo.className}`}>
            {priorityInfo.label}
          </span>

          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{pengumuman.title}</h1>

          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(pengumuman.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Carousel Gambar (jika ada) */}
      {pengumuman.image_urls && pengumuman.image_urls.length > 0 && (
        <section className="bg-white dark:bg-gray-900 pt-10">
          <div className="container max-w-2xl">
            <div className="relative w-full rounded-2xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800 aspect-2/1">
              <Image
                src={pengumuman.image_urls[currentImageIndex]}
                alt={`Gambar Pengumuman ${currentImageIndex + 1}`}
                fill
                className="object-cover cursor-pointer transition-opacity duration-500"
                priority
                unoptimized
                onClick={() => window.open(pengumuman.image_urls![currentImageIndex], '_blank')}
              />
              
              {/* Navigation Arrows */}
              {pengumuman.image_urls.length > 1 && (
                <>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => prev === 0 ? pengumuman.image_urls!.length - 1 : prev - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </button>
                  <button 
                    onClick={() => setCurrentImageIndex((prev) => prev === pengumuman.image_urls!.length - 1 ? 0 : prev + 1)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>

                  {/* Navigation Dots */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                    {pengumuman.image_urls.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-colors shadow-sm ${
                          currentImageIndex === idx ? 'bg-white' : 'bg-white/50 hover:bg-white/80'
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Content */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="container max-w-3xl">
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed">
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed text-lg text-justify">
              {linkifyContent(pengumuman.content)}
            </div>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-3xl">
          <div className="flex justify-between items-center">
            <Link href="/pengumuman" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Pengumuman
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
