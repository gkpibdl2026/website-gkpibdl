'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { WartaModule, TataIbadahItem, SongSection, SongVerse } from '@/lib/supabase'

// Type definitions for module data
interface SongData {
  songId?: string
  songTitle?: string
  songNumber?: string
  category?: string
  selectedVerses?: number[]
  selectedSections?: string[]
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

interface PelayanItem {
  id: string
  role: string
  names: string[]
}

interface PelayanIbadahData {
  pelayan: PelayanItem[]
}

interface StatistikRow {
  id: string
  keterangan: string
  bapak: number | null
  ibu: number | null
  ppRemaja: number | null
  jumlah: number | null
}

interface StatistikData {
  title?: string
  rows: StatistikRow[]
}

interface KeuanganData {
  period?: string
  pemasukan?: number
  pengeluaran?: number
  saldo?: number
  items?: { label: string; amount: number }[]
}

interface UlangTahunItem {
  id: string
  name: string
  birthDate: string
}

interface UlangTahunData {
  dateRangeStart?: string
  dateRangeEnd?: string
  members: UlangTahunItem[]
}

interface JemaatSakitItem {
  id: string
  name: string
  location: string
  keterangan?: string
}

interface JemaatSakitData {
  items: JemaatSakitItem[]
}

interface PengumumanItem {
  id: string
  title: string
  content: string
  priority?: 'normal' | 'important' | 'urgent'
}

// Font size configuration
type FontSize = 'small' | 'medium' | 'large' | 'extra-large'

const fontSizeConfig: Record<FontSize, { base: string; heading: string; subheading: string }> = {
  small: { base: 'text-sm', heading: 'text-xl', subheading: 'text-base' },
  medium: { base: 'text-base', heading: 'text-2xl', subheading: 'text-lg' },
  large: { base: 'text-lg', heading: 'text-3xl', subheading: 'text-xl' },
  'extra-large': { base: 'text-xl', heading: 'text-4xl', subheading: 'text-2xl' }
}

interface Props {
  warta: {
    id: string
    title: string
    date: string
    minggu_name: string
    modules: WartaModule[]
  }
}

export default function WartaPublicViewer({ warta }: Props) {
  const [fontSize, setFontSize] = useState<FontSize>('medium')
  const [songLyrics, setSongLyrics] = useState<Record<string, (SongSection | SongVerse)[]>>({})
  const [isLoadingLyrics, setIsLoadingLyrics] = useState(false)

  const sizes = fontSizeConfig[fontSize]

  // Fetch lyrics for song modules
  useEffect(() => {
    const fetchLyrics = async () => {
      setIsLoadingLyrics(true)
      const songModules = warta.modules.filter((m) => m.type === 'LAGU')
      const tataIbadahModules = warta.modules.filter((m) => m.type === 'TATA_IBADAH')
      
      const songsToFetch = new Set<string>()
      
      // Collect songs from LAGU modules
      songModules.forEach((m) => {
        const d = m.data as SongData
        if (d.songId) songsToFetch.add(d.songId)
      })

      // Collect songs from TATA_IBADAH modules
      tataIbadahModules.forEach((m) => {
        const items = (m.data as { items: TataIbadahItem[] }).items || []
        items.forEach(item => {
          if (item.songId) songsToFetch.add(item.songId)
        })
      })

      // Fetch all songs
      for (const songId of songsToFetch) {
        if (!songLyrics[songId]) {
          try {
            const res = await fetch(`/api/songs/${songId}`)
            const { data: song } = await res.json()
            if (song?.lyrics) {
              setSongLyrics(prev => ({ ...prev, [songId]: song.lyrics }))
            }
          } catch (e) {
            console.error('Error fetching lyrics:', e)
          }
        }
      }
      setIsLoadingLyrics(false)
    }

    if (warta.modules.length > 0) {
      fetchLyrics()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [warta.modules])

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const increaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex < sizes.length - 1) {
      setFontSize(sizes[currentIndex + 1])
    }
  }

  const decreaseFontSize = () => {
    const sizes: FontSize[] = ['small', 'medium', 'large', 'extra-large']
    const currentIndex = sizes.indexOf(fontSize)
    if (currentIndex > 0) {
      setFontSize(sizes[currentIndex - 1])
    }
  }

  // Helper to render lyrics based on format (new SongSection or legacy SongVerse)
  const renderLyrics = (lyrics: (SongSection | SongVerse)[], selectedSections?: string[], selectedVerses?: number[]) => {
    if (!lyrics || lyrics.length === 0) {
      return <p className="text-gray-400 italic">Lirik tidak tersedia</p>
    }

    // Check format: new format has 'section' property, legacy has 'verse'
    const isNewFormat = 'section' in lyrics[0]

    if (isNewFormat) {
      const sections = lyrics as SongSection[]
      const filteredSections = selectedSections && selectedSections.length > 0
        ? sections.filter(s => selectedSections.includes(`${s.section}-${s.number}`))
        : sections

      return (
        <div className="space-y-3">
          {filteredSections.map((section, idx) => (
            <div key={idx}>
              <span className="font-semibold text-gray-500 text-sm uppercase">
                {section.section === 'reff' ? 'Reff' : `Bait ${section.number}`}
              </span>
              <p className={`whitespace-pre-line leading-relaxed mt-1 ${sizes.base}`}>
                {section.content}
              </p>
            </div>
          ))}
        </div>
      )
    } else {
      // Legacy format
      const verses = lyrics as SongVerse[]
      const filteredVerses = selectedVerses && selectedVerses.length > 0
        ? verses.filter(v => selectedVerses.includes(v.verse))
        : verses

      return (
        <div className="space-y-3">
          {filteredVerses.map((verse) => (
            <div key={verse.verse} className="flex gap-3">
              <span className="font-bold text-gray-500 w-6 shrink-0">{verse.verse}.</span>
              <p className={`whitespace-pre-line leading-relaxed ${sizes.base}`}>
                {verse.content}
              </p>
            </div>
          ))}
        </div>
      )
    }
  }

  // Module renderers
  const renderModule = (module: WartaModule, index: number) => {
    switch (module.type) {
      case 'LAGU': {
        const data = module.data as SongData
        const lyrics = data.songId ? songLyrics[data.songId] : null
        return (
          <div key={module.id} className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 md:p-6 border border-blue-100 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-blue-900 dark:text-blue-100 mb-3 flex-1 ${sizes.subheading}`}>
                🎵 {data.category} {data.songNumber} - {data.songTitle}
              </h3>
            </div>
            <div className="text-blue-900 dark:text-blue-100">
              {isLoadingLyrics ? (
                <p className="text-gray-400 italic">Memuat lirik...</p>
              ) : lyrics ? (
                renderLyrics(lyrics, data.selectedSections, data.selectedVerses)
              ) : (
                <p className="text-gray-400 italic">Lirik tidak tersedia</p>
              )}
            </div>
          </div>
        )
      }

      case 'AYAT': {
        const data = module.data as AyatData
        return (
          <div key={module.id} className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 md:p-6 border border-emerald-100 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-7 h-7 rounded-full bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-emerald-900 dark:text-emerald-100 mb-3 flex-1 ${sizes.subheading}`}>
                📖 {data.category && `${data.category}: `}{data.bookName} {data.chapter}:{data.verseStart}-{data.verseEnd}
              </h3>
            </div>
            <blockquote className={`italic text-emerald-800 dark:text-emerald-200 border-l-4 border-emerald-300 dark:border-emerald-600 pl-4 ${sizes.base}`}>
              &ldquo;{data.content}&rdquo;
            </blockquote>
            {data.translation && (
              <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
                — {data.translation}
              </p>
            )}
          </div>
        )
      }

      case 'TATA_IBADAH': {
        const data = module.data as { items: TataIbadahItem[] }
        const items = data.items || []
        return (
          <div key={module.id} className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 md:p-6 border border-purple-100 dark:border-purple-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-purple-600 dark:bg-purple-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-purple-900 dark:text-purple-100 flex-1 ${sizes.subheading}`}>
                📋 Tata Ibadah
              </h3>
            </div>
            <ol className="space-y-4">
              {items.map((item, idx) => {
                const linkedLyrics = item.songId ? songLyrics[item.songId] : null
                return (
                  <li key={item.id} className="flex gap-3">
                    <span className="font-bold text-purple-600 dark:text-purple-400 w-6 shrink-0">
                      {idx + 1}.
                    </span>
                    <div className="flex-1">
                      <div className={`font-semibold text-purple-900 dark:text-purple-100 ${sizes.base}`}>
                        {item.title}
                      </div>
                      {item.description && (
                        <p className="text-sm text-purple-600 dark:text-purple-300 italic">
                          {item.description}
                        </p>
                      )}
                      {item.content && !item.songId && (
                        <p className={`whitespace-pre-line mt-2 text-purple-800 dark:text-purple-200 ${sizes.base}`}>
                          {item.content}
                        </p>
                      )}
                      {linkedLyrics && (
                        <div className="mt-2 pl-4 border-l-2 border-purple-200 dark:border-purple-600">
                          {renderLyrics(linkedLyrics, item.songSections, item.songVerses)}
                        </div>
                      )}
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        )
      }

      case 'PELAYAN_IBADAH': {
        const data = module.data as PelayanIbadahData
        const pelayan = data.pelayan || []
        
        // Split into 2 columns
        const midpoint = Math.ceil(pelayan.length / 2)
        const leftColumn = pelayan.slice(0, midpoint)
        const rightColumn = pelayan.slice(midpoint)
        
        return (
          <div key={module.id} className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 md:p-6 border border-amber-100 dark:border-amber-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-amber-600 dark:bg-amber-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-amber-900 dark:text-amber-100 flex-1 ${sizes.subheading}`}>
                👥 Pelayan Kebaktian Minggu
              </h3>
            </div>
            <p className="text-center text-amber-700 dark:text-amber-300 text-sm mb-4 italic">
              Terima kasih atas Pelayanannya, Tuhan Yesus Memberkati.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                {leftColumn.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <span className={`text-amber-700 dark:text-amber-300 min-w-30 ${sizes.base}`}>{item.role}</span>
                    <span className="text-amber-900 dark:text-amber-100">:</span>
                    <span className={`font-medium text-amber-900 dark:text-amber-100 ${sizes.base}`}>
                      {item.names.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
              {/* Right Column */}
              <div className="space-y-2">
                {rightColumn.map((item) => (
                  <div key={item.id} className="flex gap-2">
                    <span className={`text-amber-700 dark:text-amber-300 min-w-30 ${sizes.base}`}>{item.role}</span>
                    <span className="text-amber-900 dark:text-amber-100">:</span>
                    <span className={`font-medium text-amber-900 dark:text-amber-100 ${sizes.base}`}>
                      {item.names.join(', ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      }

      case 'PENGUMUMAN': {
        const data = module.data as { items: PengumumanItem[] }
        const items = data.items || []
        return (
          <div key={module.id} className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 md:p-6 border border-yellow-100 dark:border-yellow-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-yellow-600 dark:bg-yellow-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-yellow-900 dark:text-yellow-100 flex-1 ${sizes.subheading}`}>
                📢 Pengumuman
              </h3>
            </div>
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className={`p-3 rounded-lg ${
                  item.priority === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' :
                  item.priority === 'important' ? 'bg-orange-100 dark:bg-orange-900/30' :
                  'bg-white dark:bg-gray-800'
                }`}>
                  <h4 className={`font-semibold text-yellow-900 dark:text-yellow-100 ${sizes.base}`}>
                    {item.title}
                  </h4>
                  <p className={`mt-1 text-yellow-800 dark:text-yellow-200 ${sizes.base}`}>
                    {item.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      }

      case 'STATISTIK': {
        const data = module.data as StatistikData
        const rows = data.rows || []
        const totals = rows.reduce((acc, row) => ({
          bapak: acc.bapak + (row.bapak || 0),
          ibu: acc.ibu + (row.ibu || 0),
          ppRemaja: acc.ppRemaja + (row.ppRemaja || 0),
          jumlah: acc.jumlah + (row.jumlah || 0)
        }), { bapak: 0, ibu: 0, ppRemaja: 0, jumlah: 0 })

        return (
          <div key={module.id} className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-4 md:p-6 border border-cyan-100 dark:border-cyan-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-cyan-600 dark:bg-cyan-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-cyan-900 dark:text-cyan-100 flex-1 ${sizes.subheading}`}>
                📊 {data.title || 'Statistik Kehadiran'}
              </h3>
            </div>
            
            {rows.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-cyan-200 dark:border-cyan-700">
                      <th className="text-left py-2 px-2 text-cyan-700 dark:text-cyan-300">NO</th>
                      <th className="text-left py-2 px-2 text-cyan-700 dark:text-cyan-300">Keterangan</th>
                      <th className="text-center py-2 px-2 text-cyan-700 dark:text-cyan-300">Bapak</th>
                      <th className="text-center py-2 px-2 text-cyan-700 dark:text-cyan-300">Ibu</th>
                      <th className="text-center py-2 px-2 text-cyan-700 dark:text-cyan-300">PP-Remaja</th>
                      <th className="text-center py-2 px-2 text-cyan-700 dark:text-cyan-300 font-bold">Jumlah</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.id} className="border-b border-cyan-100 dark:border-cyan-800">
                        <td className="py-2 px-2 text-cyan-800 dark:text-cyan-200">{idx + 1}</td>
                        <td className="py-2 px-2 text-cyan-900 dark:text-cyan-100">{row.keterangan}</td>
                        <td className="py-2 px-2 text-center text-cyan-700 dark:text-cyan-300">{row.bapak ?? '-'}</td>
                        <td className="py-2 px-2 text-center text-cyan-700 dark:text-cyan-300">{row.ibu ?? '-'}</td>
                        <td className="py-2 px-2 text-center text-cyan-700 dark:text-cyan-300">{row.ppRemaja ?? '-'}</td>
                        <td className="py-2 px-2 text-center font-bold text-cyan-900 dark:text-cyan-100">{row.jumlah ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-cyan-100 dark:bg-cyan-800/50 font-semibold">
                      <td className="py-2 px-2" colSpan={2}>TOTAL</td>
                      <td className="py-2 px-2 text-center">{totals.bapak || '-'}</td>
                      <td className="py-2 px-2 text-center">{totals.ibu || '-'}</td>
                      <td className="py-2 px-2 text-center">{totals.ppRemaja || '-'}</td>
                      <td className="py-2 px-2 text-center font-bold text-cyan-900 dark:text-cyan-100">{totals.jumlah || '-'}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <p className="text-cyan-600 dark:text-cyan-400 italic">Belum ada data statistik</p>
            )}
          </div>
        )
      }

      case 'KEUANGAN': {
        const data = module.data as KeuanganData
        return (
          <div key={module.id} className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 md:p-6 border border-green-100 dark:border-green-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-green-600 dark:bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-green-900 dark:text-green-100 flex-1 ${sizes.subheading}`}>
                💰 Laporan Keuangan
              </h3>
            </div>
            {data.period && (
              <p className="text-sm text-green-600 dark:text-green-400 mb-3">Periode: {data.period}</p>
            )}
            <div className="space-y-2">
              {data.pemasukan !== undefined && (
                <div className={`flex justify-between ${sizes.base}`}>
                  <span className="text-green-700 dark:text-green-300">Pemasukan</span>
                  <span className="font-medium text-green-900 dark:text-green-100">{formatCurrency(data.pemasukan)}</span>
                </div>
              )}
              {data.pengeluaran !== undefined && (
                <div className={`flex justify-between ${sizes.base}`}>
                  <span className="text-green-700 dark:text-green-300">Pengeluaran</span>
                  <span className="font-medium text-green-900 dark:text-green-100">{formatCurrency(data.pengeluaran)}</span>
                </div>
              )}
              {data.saldo !== undefined && (
                <div className={`flex justify-between pt-2 border-t border-green-200 dark:border-green-700 ${sizes.base}`}>
                  <span className="font-semibold text-green-800 dark:text-green-200">Saldo</span>
                  <span className="font-bold text-green-900 dark:text-green-100">{formatCurrency(data.saldo)}</span>
                </div>
              )}
            </div>
          </div>
        )
      }

      case 'ULANG_TAHUN': {
        const data = module.data as UlangTahunData
        const members = data.members || []
        return (
          <div key={module.id} className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-4 md:p-6 border border-pink-100 dark:border-pink-800">
            <div className="flex items-start gap-3 mb-2">
              <span className="shrink-0 w-7 h-7 rounded-full bg-pink-600 dark:bg-pink-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-pink-900 dark:text-pink-100 flex-1 ${sizes.subheading}`}>
                🎂 Selamat Ulang Tahun
              </h3>
            </div>
            {data.dateRangeStart && data.dateRangeEnd && (
              <p className="text-pink-700 dark:text-pink-300 text-sm mb-4 ml-10">
                Tanggal {data.dateRangeStart} s/d {data.dateRangeEnd}
              </p>
            )}
            {members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-pink-200 dark:border-pink-700">
                      <th className="text-left py-2 px-2 text-pink-700 dark:text-pink-300 w-10">No</th>
                      <th className="text-left py-2 px-2 text-pink-700 dark:text-pink-300">Nama</th>
                      <th className="text-center py-2 px-2 text-pink-700 dark:text-pink-300">Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((item, idx) => (
                      <tr key={item.id} className="border-b border-pink-100 dark:border-pink-800">
                        <td className="py-2 px-2 text-pink-800 dark:text-pink-200">{idx + 1}</td>
                        <td className="py-2 px-2 text-pink-900 dark:text-pink-100">{item.name}</td>
                        <td className="py-2 px-2 text-center text-pink-600 dark:text-pink-400">{item.birthDate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-pink-600 dark:text-pink-400 italic ml-10">Tidak ada data ulang tahun</p>
            )}
          </div>
        )
      }

      case 'JEMAAT_SAKIT': {
        const data = module.data as JemaatSakitData
        const items = data.items || []
        return (
          <div key={module.id} className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 md:p-6 border border-red-100 dark:border-red-800">
            <div className="flex items-start gap-3 mb-4">
              <span className="shrink-0 w-7 h-7 rounded-full bg-red-600 dark:bg-red-500 text-white flex items-center justify-center text-sm font-bold">
                {index + 1}
              </span>
              <h3 className={`font-bold text-red-900 dark:text-red-100 flex-1 ${sizes.subheading}`}>
                🙏 Pokok Doa (Jemaat Sakit)
              </h3>
            </div>
            
            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-red-200 dark:border-red-700">
                      <th className="text-left py-2 px-2 text-red-700 dark:text-red-300 w-10">No</th>
                      <th className="text-left py-2 px-2 text-red-700 dark:text-red-300">Nama</th>
                      <th className="text-left py-2 px-2 text-red-700 dark:text-red-300">Lokasi / Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item, idx) => (
                      <tr key={item.id} className="border-b border-red-100 dark:border-red-800">
                        <td className="py-2 px-2 text-red-800 dark:text-red-200 font-medium">{idx + 1}</td>
                        <td className="py-2 px-2 text-red-900 dark:text-red-100 font-medium">{item.name}</td>
                        <td className="py-2 px-2 text-red-700 dark:text-red-300">
                          {item.location}
                          {item.keterangan && <span className="text-red-500 dark:text-red-400 italic ml-1">({item.keterangan})</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-red-600 dark:text-red-400 italic ml-10">Tidak ada data jemaat sakit</p>
            )}
          </div>
        )
      }

      default:
        return (
          <div key={module.id} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500">Modul {module.type} belum tersedia</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-8 md:py-12">
        <div className="container max-w-3xl mx-auto px-4">
          <Link 
            href="/warta" 
            className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-4 transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Warta
          </Link>
          
          {/* Church Logo & Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 relative shrink-0">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuFEWaYkeWEHQWvnpP9dqaCtdKEZOFnBmtLg&s"
                alt="Logo GKPI"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div>
              <p className="text-blue-200 text-sm uppercase tracking-wide">GKPI Bandar Lampung</p>
              <h1 className={`font-bold leading-tight ${sizes.heading}`}>{warta.title}</h1>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 text-blue-100 text-sm">
            <span className="bg-blue-500/30 px-3 py-1 rounded-full">{warta.minggu_name}</span>
            <span>{formatDate(warta.date)}</span>
          </div>
        </div>
      </header>

      {/* Font Size Controls - Fixed at bottom right */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-1 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-full p-1">
        <button
          onClick={decreaseFontSize}
          disabled={fontSize === 'small'}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Perkecil font"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 min-w-8 text-center">
          {fontSize === 'small' ? 'S' : fontSize === 'medium' ? 'M' : fontSize === 'large' ? 'L' : 'XL'}
        </span>
        <button
          onClick={increaseFontSize}
          disabled={fontSize === 'extra-large'}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          title="Perbesar font"
        >
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <main className="container max-w-3xl mx-auto px-4 pt-12 pb-8 md:pt-16 md:pb-10">
        {warta.modules.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Warta ini belum memiliki konten.
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {warta.modules
              .sort((a, b) => a.order - b.order)
              .map((module, index) => renderModule(module, index))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6 mt-8">
        <div className="container max-w-3xl mx-auto px-4 text-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            GKPI Bandar Lampung &copy; {new Date().getFullYear()}
          </p>
          <Link 
            href="/warta" 
            className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mt-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Lihat Warta Lainnya
          </Link>
        </div>
      </footer>
    </div>
  )
}
