'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { WartaModule, SongVerse, TataIbadahItem } from '@/lib/supabase'

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

export default function PrintWarta() {
  const params = useParams()
  const id = params.id as string
  const [warta, setWarta] = useState<{
    title: string
    date: string
    minggu_name: string
    modules: WartaModule[]
  } | null>(null)
  
  const [songLyrics, setSongLyrics] = useState<Record<string, SongVerse[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/warta/${id}`)
        if (res.ok) {
          const { data } = await res.json()
          setWarta(data)
          
          // Fetch lyrics
          const songModules = data.modules.filter((m: WartaModule) => m.type === 'LAGU')
          const tataIbadahModules = data.modules.filter((m: WartaModule) => m.type === 'TATA_IBADAH')
          
          const songsToFetch = new Set<string>()
          
          // Collect songs from LAGU modules
          songModules.forEach((m: WartaModule) => {
            const d = m.data as SongData
            if (d.songId) songsToFetch.add(d.songId)
          })

          // Collect songs from TATA_IBADAH modules
          tataIbadahModules.forEach((m: WartaModule) => {
             const items = (m.data as { items: TataIbadahItem[] }).items || []
             items.forEach(item => {
               if (item.songId) songsToFetch.add(item.songId)
             })
          })

          for (const songId of Array.from(songsToFetch)) {
            try {
              const songRes = await fetch(`/api/songs/${songId}`)
              const { data: song } = await songRes.json()
              if (song?.lyrics) {
                setSongLyrics(prev => ({ ...prev, [songId]: song.lyrics }))
              }
            } catch (e) {
              console.error('Error fetching lyrics for song', songId, e)
            }
          }
        }
      } catch (error) {
        console.error('Error fetching warta for print:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (isLoading) return <div className="text-center py-20">Loading...</div>
  if (!warta) return <div className="text-center py-20 text-red-500">Data tidak ditemukan</div>

  const formatDate = (dateStr: string) => {
     return new Date(dateStr).toLocaleDateString('id-ID', {
       weekday: 'long', 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric'
     })
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
      <div className="bg-white min-h-screen text-black font-serif print:p-8 p-8 max-w-[210mm] mx-auto print:max-w-none w-full">
      {/* Print Controls */}
      <div className="print:hidden mb-8 flex items-center justify-between bg-gray-100 p-4 rounded-lg">
        <div>
          <h1 className="font-bold text-lg text-gray-800">Mode Cetak / Export PDF</h1>
          <p className="text-sm text-gray-600">Tekan Ctrl+P atau tombol di kanan untuk menyimpan sebagai PDF</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Page Container with Border */}
      <div className="border border-black p-8 min-h-[297mm] mx-auto bg-white print:border-0 print:p-0">
        
        {/* Header Section - Spans all columns */}
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8 gap-6">
           {/* Logo */}
           <div className="w-24 h-24 shrink-0 flex items-center justify-center">
             {/* eslint-disable-next-line @next/next/no-img-element */}
             <img 
               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuFEWaYkeWEHQWvnpP9dqaCtdKEZOFnBmtLg&s" 
               alt="Logo GKPI" 
               className="w-full h-full object-contain"
             />
           </div>

           {/* Header Text */}
           <div className="flex-1 text-center">
             <h1 className="text-xl font-bold uppercase tracking-wide mb-1 opacity-90">GEREJA KRISTEN PROTESTAN INDONESIA (GKPI)</h1>
             <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">TATA IBADAH KEBAKTIAN MINGGU</h2>
             <div className="text-lg font-semibold border-t border-black pt-2 inline-block px-12 mt-1">
               {warta.minggu_name}
             </div>
             <p className="text-md mt-2 italic font-medium">{formatDate(warta.date)}</p>
           </div>
           
           {/* Invisible balancer */}
           <div className="w-24 shrink-0"></div>
        </div>

        {/* Content Body - Multi-column Layout */}
        <div className="space-y-6 md:columns-2 gap-8 [column-fill:auto]">
        {warta.modules.map((module) => {
          if (module.type === 'LAGU') {
             const data = module.data as SongData
             const lyrics = (data.songId ? songLyrics[data.songId] : []) || []
             const verses = data.selectedVerses || []
             return (
               <div key={module.id} className="mb-4">
                 <h3 className="font-bold text-lg mb-1">{data.category} {data.songNumber} - {data.songTitle}</h3>
                 <div className="pl-4 space-y-2">
                   {lyrics.filter(l => verses.includes(l.verse)).map(l => (
                     <div key={l.verse} className="flex gap-2">
                       <span className="font-bold w-4">{l.verse}.</span>
                       <p className="whitespace-pre-line leading-relaxed">{l.content}</p>
                     </div>
                   ))}
                 </div>
               </div>
             )
          }

          if (module.type === 'AYAT') {
            const data = module.data as AyatData
            return (
              <div key={module.id} className="mb-4">
                <h3 className="font-bold text-lg mb-1">
                  {data.category ? `${data.category}: ` : ''} 
                  {data.bookName} {data.chapter}:{data.verseStart}-{data.verseEnd}
                </h3>
                <div className="pl-4 italic text-gray-800">
                  &ldquo;{data.content}&rdquo;
                </div>
              </div>
            )
          }

          if (module.type === 'TATA_IBADAH') {
            const items = (module.data as { items: TataIbadahItem[] }).items || []
            return (
              <div key={module.id} className="mb-4">
                <ol className="list-decimal list-outside pl-5 space-y-4">
                  {items.map(item => {
                    // Check if this item has a linked song
                    const linkedLyrics = item.songId ? (songLyrics[item.songId] || []) : null
                    
                    return (
                      <li key={item.id} className="pl-2">
                        <div className="font-bold text-lg">{item.title}</div>
                        {item.description && <div className="text-sm text-gray-600 italic mb-1">{item.description}</div>}
                        
                        {/* If manually typed content exists */}
                        {item.content && !item.songId && (
                           <div className="whitespace-pre-line mt-1">{item.content}</div>
                        )}

                        {/* If linked song exists */}
                        {linkedLyrics && (
                          <div className="mt-2 pl-0 space-y-2">
                             {linkedLyrics
                               .filter(l => !item.songVerses || item.songVerses.length === 0 || item.songVerses.includes(l.verse))
                               .map(l => (
                               <div key={l.verse} className="flex gap-2 text-sm">
                                 <span className="font-bold w-4">{l.verse}.</span>
                                 <p className="whitespace-pre-line leading-relaxed">{l.content}</p>
                               </div>
                             ))}
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ol>
              </div>
            )
          }

          return null
        })}
        </div>
      </div>
      
      {/* Footer / Copyright or Branding */}
      <div className="mt-12 pt-4 border-t border-gray-300 text-center text-xs text-gray-500 print:hidden">
        Dicetak dari Sistem Informasi Warta GKPI Bandar Lampung
      </div>
    </div>
    </>
  )
}
