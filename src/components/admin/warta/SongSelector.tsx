import { useState, useEffect } from 'react'
import { Song } from '@/lib/supabase'

interface Props {
  onSelect: (song: Song) => void
}

export default function SongSelector({ onSelect }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [songs, setSongs] = useState<Song[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const searchSongs = async () => {
      if (!searchTerm) {
        setSongs([])
        return
      }
      
      setIsLoading(true)
      try {
        const res = await fetch(`/api/songs?query=${encodeURIComponent(searchTerm)}`)
        const { data } = await res.json()
        setSongs(data || [])
      } catch (error) {
        console.error('Error searching songs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(searchSongs, 500)
    return () => clearTimeout(timer)
  }, [searchTerm])

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsSearching(true)
          }}
          placeholder="Cari lagu (contoh: KJ 120, Malam Kudus)..."
          className="w-full px-4 py-2 border border-blue-200 dark:border-blue-700 rounded-lg focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-blue-300"
        />
        {isLoading && <div className="animate-spin w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>}
      </div>

      {isSearching && songs.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 max-h-60 overflow-y-auto">
          {songs.map((song) => (
            <button
              key={song.id}
              onClick={() => {
                onSelect(song)
                setSearchTerm('')
                setIsSearching(false)
                setSongs([])
              }}
              className="w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
            >
              <div className="font-medium text-gray-900 dark:text-white">
                {song.category} {song.song_number} - {song.title}
              </div>
            </button>
          ))}
        </div>
      )}
      
      {isSearching && searchTerm && !isLoading && songs.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 p-4 text-center text-gray-500 dark:text-gray-400">
          Lagu tidak ditemukan
        </div>
      )}
    </div>
  )
}
