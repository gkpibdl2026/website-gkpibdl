'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
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

interface Props {
  data: {
    title: string
    date: string
    minggu_name: string
    modules: WartaModule[]
  }
}

export default function WartaLivePreview({ data }: Props) {
  const [songLyrics, setSongLyrics] = useState<Record<string, SongVerse[]>>({})
  
  // Fetch lyrics whenever modules change
  useEffect(() => {
    const fetchLyrics = async () => {
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

       // Only fetch what isn't already cached
       const newSongs = Array.from(songsToFetch).filter(id => !songLyrics[id])
       
       if (newSongs.length > 0) {
         for (const songId of newSongs) {
           try {
             // We can use the public API we made
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
    }
    fetchLyrics()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.modules]) 
  // Dependency specifically on modules to re-check songs. 
  // Note: Deep comparison might be better but for now module reference change is enough if parent handles it.

  const formatDate = (dateStr: string) => {
     if (!dateStr) return '-'
     return new Date(dateStr).toLocaleDateString('id-ID', {
       weekday: 'long', 
       day: 'numeric', 
       month: 'long', 
       year: 'numeric'
     })
  }

  // Zoom State
  const [scale, setScale] = useState(0.8)

  return (
    <div className="relative">
      {/* Zoom Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-white/90 shadow-sm border border-gray-200 p-1.5 rounded-lg backdrop-blur-sm">
        <button 
          onClick={() => setScale(s => Math.min(s + 0.1, 1.5))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
          title="Zoom In"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        </button>
        <span className="text-[10px] text-center font-medium text-gray-500">{Math.round(scale * 100)}%</span>
        <button 
          onClick={() => setScale(s => Math.max(s - 0.1, 0.4))}
          className="p-1.5 hover:bg-gray-100 rounded text-gray-600 hover:text-blue-600 transition-colors"
          title="Zoom Out"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
        </button>
      </div>

      <div 
        className="bg-white text-black font-serif p-8 shadow-xl min-h-250 origin-top-left transition-transform duration-200 ease-out"
        style={{ transform: `scale(${scale})` }}
      >
      
      {/* Page Container with Border */}
      <div className="border border-black p-8 min-h-[297mm] w-[210mm] bg-white relative mx-auto">
        <div className="absolute top-2 right-2 text-[10px] text-gray-400 font-sans border border-gray-200 px-2 py-1 rounded">
          Live Preview A4
        </div>

        {/* Header Section */}
        <div className="flex items-center justify-between border-b-2 border-black pb-6 mb-8 gap-6">
           {/* Logo */}
           <div className="w-24 h-24 shrink-0 flex items-center justify-center relative">
             <Image 
               src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRuFEWaYkeWEHQWvnpP9dqaCtdKEZOFnBmtLg&s" 
               alt="Logo GKPI" 
               fill
               className="object-contain"
               unoptimized
             />
           </div>

           {/* Header Text */}
           <div className="flex-1 text-center">
             <h1 className="text-xl font-bold uppercase tracking-wide mb-1 opacity-90">GEREJA KRISTEN PROTESTAN INDONESIA (GKPI)</h1>
             <h2 className="text-2xl font-bold uppercase tracking-wider mb-2">TATA IBADAH KEBAKTIAN MINGGU</h2>
             <div className="text-lg font-semibold border-t border-black pt-2 inline-block px-12 mt-1">
               {data.minggu_name || 'Nama Minggu'}
             </div>
             <p className="text-md mt-2 italic font-medium">{formatDate(data.date)}</p>
           </div>
           
           {/* Invisible balancer */}
           <div className="w-24 shrink-0"></div>
        </div>

        {/* Content Body - Multi-column Layout */}
        <div className="space-y-6 md:columns-2 gap-8 [column-fill:auto]">
        {data.modules.length === 0 && (
          <div className="text-center text-gray-400 py-20 italic">
            Belum ada item warta. Tambahkan modul di panel kiri.
          </div>
        )}

        {data.modules.map((module) => {
          if (module.type === 'LAGU') {
             const d = module.data as SongData
             const lyrics = (d.songId ? songLyrics[d.songId] : []) || []
             const verses = d.selectedVerses || []
             return (
               <div key={module.id} className="mb-4 break-inside-avoid">
                 <h3 className="font-bold text-lg mb-1">{d.category} {d.songNumber} - {d.songTitle}</h3>
                 <div className="pl-4 space-y-2">
                   {lyrics.length === 0 ? (
                     <p className="text-gray-400 italic text-sm">Memuat lirik...</p>
                   ) : (
                     lyrics.filter(l => verses.includes(l.verse)).map(l => (
                       <div key={l.verse} className="flex gap-2 text-sm">
                         <span className="font-bold w-4">{l.verse}.</span>
                         <p className="whitespace-pre-line leading-relaxed">{l.content}</p>
                       </div>
                     ))
                   )}
                 </div>
               </div>
             )
          }

          if (module.type === 'AYAT') {
            const d = module.data as AyatData
            return (
              <div key={module.id} className="mb-4 break-inside-avoid">
                <h3 className="font-bold text-lg mb-1">
                  {d.category ? `${d.category}: ` : ''} 
                  {d.bookName} {d.chapter}:{d.verseStart}-{d.verseEnd}
                </h3>
                <div className="pl-4 italic text-gray-800 text-sm">
                  &ldquo;{d.content}&rdquo;
                </div>
              </div>
            )
          }

          if (module.type === 'TATA_IBADAH') {
            const items = (module.data as { items: TataIbadahItem[] }).items || []
            return (
              <div key={module.id} className="mb-4 break-inside-avoid">
                <ol className="list-decimal list-outside pl-5 space-y-4">
                  {items.map(item => {
                    // Check if this item has a linked song
                    const linkedLyrics = item.songId ? (songLyrics[item.songId] || []) : null
                    
                    return (
                      <li key={item.id} className="pl-2">
                        <div className="font-bold text-lg leading-tight">{item.title}</div>
                        {item.description && <div className="text-sm text-gray-600 italic mb-1">{item.description}</div>}
                        
                        {/* If manually typed content exists */}
                        {item.content && !item.songId && (
                           <div className="whitespace-pre-line mt-1 text-sm">{item.content}</div>
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
      </div>
    </div>
  )
}
