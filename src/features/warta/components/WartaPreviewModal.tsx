'use client'

import { WartaModule, TataIbadahItem } from '@/lib/supabase'
import { useState, useEffect } from 'react'

interface Props {
  isOpen: boolean
  onClose: () => void
  title: string
  date: string
  mingguName: string
  modules: WartaModule[]
}

interface SongData {
  songId?: string
  songTitle?: string
  songNumber?: string
  category?: string
  selectedVerses?: number[]
}

interface AyatData {
  bookName?: string
  chapter?: number
  verseStart?: number
  verseEnd?: number
  translation?: string
  content?: string
  category?: string
}

interface SongVerse {
  verse: number
  content: string
}

export default function WartaPreviewModal({ isOpen, onClose, title, date, mingguName, modules }: Props) {
  const [songLyrics, setSongLyrics] = useState<Record<string, SongVerse[]>>({})

  // Fetch lyrics for songs when modal opens
  useEffect(() => {
    if (!isOpen) return

    const fetchLyrics = async () => {
      const songModules = modules.filter(m => m.type === 'LAGU')
      for (const mod of songModules) {
        const data = mod.data as SongData
        if (data.songId && !songLyrics[data.songId]) {
          try {
            const res = await fetch(`/api/songs/${data.songId}`)
            const { data: song } = await res.json()
            if (song?.lyrics) {
              setSongLyrics(prev => ({ ...prev, [data.songId!]: song.lyrics }))
            }
          } catch (err) {
            console.error('Error fetching lyrics:', err)
          }
        }
      }
    }

    fetchLyrics()
  }, [isOpen, modules, songLyrics])

  if (!isOpen) return null

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-blue-600 to-purple-600">
          <div>
            <h2 className="text-xl font-bold text-white">Preview Warta</h2>
            <p className="text-sm text-white/80">Tampilan sebelum dipublikasikan</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Title Section */}
          <div className="text-center mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {title || 'Judul Warta'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">{mingguName}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{formatDate(date)}</p>
          </div>

          {/* Modules */}
          <div className="space-y-6">
            {modules.length === 0 && (
              <p className="text-center text-gray-500 py-8">Belum ada modul yang ditambahkan</p>
            )}

            {modules.map((module) => {
              switch (module.type) {
                case 'LAGU':
                  const songData = module.data as SongData
                  const lyrics = (songData.songId ? songLyrics[songData.songId] : []) || []
                  const selectedVerses = songData.selectedVerses || []

                  return (
                    <div key={module.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-blue-600 dark:text-blue-400 text-xl">🎵</span>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100">
                          {songData.category} {songData.songNumber} - {songData.songTitle}
                        </h3>
                      </div>
                      {selectedVerses.length > 0 && lyrics.length > 0 && (
                        <div className="space-y-3 text-gray-700 dark:text-gray-300">
                          {lyrics
                            .filter(v => selectedVerses.includes(v.verse))
                            .map(verse => (
                              <div key={verse.verse}>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 mr-2">
                                  Bait {verse.verse}
                                </span>
                                <p className="whitespace-pre-line">{verse.content}</p>
                              </div>
                            ))}
                        </div>
                      )}
                      {selectedVerses.length === 0 && (
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          Bait: Belum dipilih
                        </p>
                      )}
                    </div>
                  )

                case 'AYAT':
                  const ayatData = module.data as AyatData

                  return (
                    <div key={module.id} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-5 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-emerald-600 dark:text-emerald-400 text-xl">📖</span>
                        {ayatData.category && (
                          <span className="px-2 py-0.5 bg-emerald-200 dark:bg-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-semibold rounded-full">
                            {ayatData.category}
                          </span>
                        )}
                      </div>
                      {ayatData.bookName ? (
                        <>
                          <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-2">
                            {ayatData.bookName} {ayatData.chapter}:{ayatData.verseStart}-{ayatData.verseEnd} ({ayatData.translation})
                          </h3>
                          <p className="text-gray-700 dark:text-gray-300 italic leading-relaxed">
                            &ldquo;{ayatData.content}&rdquo;
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-emerald-600 dark:text-emerald-400">Ayat belum dipilih</p>
                      )}
                    </div>
                  )

                case 'TATA_IBADAH':
                  const tataIbadahData = module.data as { items: TataIbadahItem[] }
                  
                  return (
                    <div key={module.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <div className="bg-purple-100 dark:bg-purple-900/40 px-5 py-3 border-b border-purple-200 dark:border-purple-800 flex items-center gap-2">
                        <span className="text-purple-600 dark:text-purple-400 text-xl">📋</span>
                        <h3 className="font-bold text-purple-900 dark:text-purple-100">Tata Ibadah</h3>
                      </div>
                      
                      <div className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tataIbadahData.items?.map((item) => (
                          <div key={item.id} className="p-4 flex gap-4 hover:bg-gray-50 dark:hover:bg-gray-750">
                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-400 shrink-0">
                              {item.order}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-gray-100">{item.title}</h4>
                                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                                  {item.type}
                                </span>
                              </div>
                              {item.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {(!tataIbadahData.items || tataIbadahData.items.length === 0) && (
                          <p className="p-4 text-center text-gray-500 italic">Belum ada item liturgi</p>
                        )}
                      </div>
                    </div>
                  )

                default:
                  return (
                    <div key={module.id} className="bg-gray-100 dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
                      <p className="text-gray-500">Modul {module.type}</p>
                    </div>
                  )
              }
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            Tutup Preview
          </button>
        </div>
      </div>
    </div>
  )
}
