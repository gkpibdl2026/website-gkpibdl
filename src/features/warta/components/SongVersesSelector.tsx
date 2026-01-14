import { useState, useEffect } from 'react'
import { supabaseAdmin, type Song } from '@/lib/supabase'

interface Props {
  songId: string
  selectedVerses: number[]
  onChange: (verses: number[]) => void
}

export default function SongVersesSelector({ songId, selectedVerses, onChange }: Props) {
  const [song, setSong] = useState<Song | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSong = async () => {
      setIsLoading(true)
      try {
        // In client component we should use the API we created typically, 
        // passing through existing API or creating a specific one.
        // We already have GET /api/songs?query=... but need by ID.
        // Since we didn't explicitly make a 'GET /api/songs/[id]' for public/client fetching 
        // (we made PUT/DELETE), let's double check if we can reuse or need to add.
        // Actually PUT /api/songs/[id] exists. We can add GET there or use query param on list.
        // For simplicity/speed, let's just use the query API or add GET to the [id] route.
        // The [id] route currently only has PUT/DELETE. Let's add GET there quickly.
        
        const res = await fetch(`/api/songs/${songId}`)
        if (res.ok) {
          const { data } = await res.json()
          setSong(data)
        }
      } catch (error) {
        console.error('Error fetching song details:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (songId) {
      fetchSong()
    }
  }, [songId])

  const toggleVerse = (verseNumber: number) => {
    if (selectedVerses.includes(verseNumber)) {
      onChange(selectedVerses.filter(v => v !== verseNumber).sort((a, b) => a - b))
    } else {
      onChange([...selectedVerses, verseNumber].sort((a, b) => a - b))
    }
  }

  if (isLoading) return <div className="text-sm text-gray-500">Memuat lirik...</div>
  if (!song) return <div className="text-sm text-red-500">Lagu tidak ditemukan</div>

  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pilih Ayat/Bait:
        </label>
        <div className="flex gap-2">
           <button 
             type="button"
             onClick={() => onChange(song.lyrics.map(l => l.verse))}
             className="text-xs text-blue-600 hover:text-blue-700"
           >
             Pilih Semua
           </button>
           <button 
             type="button"
             onClick={() => onChange([])}
             className="text-xs text-gray-500 hover:text-gray-600"
           >
             Reset
           </button>
        </div>
      </div>
      
      {song.lyrics && song.lyrics.length > 0 ? (
        <div className="grid gap-2">
          {song.lyrics.map((verse) => (
            <label 
              key={verse.verse} 
              className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedVerses.includes(verse.verse)
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedVerses.includes(verse.verse)}
                onChange={() => toggleVerse(verse.verse)}
                className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <div className="flex-1">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                  Bait {verse.verse}
                </span>
                <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                  {verse.content}
                </p>
              </div>
            </label>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Tidak ada lirik tersedia.</p>
      )}
    </div>
  )
}
