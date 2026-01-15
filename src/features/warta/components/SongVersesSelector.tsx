import { useState, useEffect } from 'react'
import { type Song, type SongSection, type SongSectionType } from '@/lib/supabase'

interface Props {
  songId: string
  selectedSections: string[] // Format: "section-number" e.g. "reff-1", "bait-2"
  onChange: (sections: string[]) => void
}

const SECTION_LABELS: Record<SongSectionType, string> = {
  reff: 'Reff',
  bait: 'Bait',
  interlude: 'Interlude',
  bridge: 'Bridge'
}

const SECTION_COLORS: Record<SongSectionType, string> = {
  reff: 'bg-purple-50 border-purple-200 dark:bg-purple-900/20 dark:border-purple-800',
  bait: 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
  interlude: 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
  bridge: 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
}

const SECTION_LABEL_COLORS: Record<SongSectionType, string> = {
  reff: 'text-purple-700 dark:text-purple-300',
  bait: 'text-blue-700 dark:text-blue-300',
  interlude: 'text-amber-700 dark:text-amber-300',
  bridge: 'text-green-700 dark:text-green-300'
}

// Helper to convert section to key
function getSectionKey(section: SongSection): string {
  return `${section.section}-${section.number}`
}

// Helper to parse old verse format to new section format
function normalizeLyrics(lyrics: unknown[]): SongSection[] {
  if (!lyrics || lyrics.length === 0) return []
  
  // Check if old format (has 'verse' property)
  const firstItem = lyrics[0] as Record<string, unknown>
  if ('verse' in firstItem) {
    return lyrics.map((v) => {
      const verse = v as { verse: number; content: string }
      return {
        section: 'bait' as SongSectionType,
        number: verse.verse,
        content: verse.content
      }
    })
  }
  
  return lyrics as SongSection[]
}

export default function SongVersesSelector({ songId, selectedSections, onChange }: Props) {
  const [song, setSong] = useState<Song | null>(null)
  const [sections, setSections] = useState<SongSection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchSong = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/songs/${songId}`)
        if (res.ok) {
          const { data } = await res.json()
          setSong(data)
          setSections(normalizeLyrics(data.lyrics || []))
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

  const toggleSection = (sectionKey: string) => {
    if (selectedSections.includes(sectionKey)) {
      onChange(selectedSections.filter(s => s !== sectionKey))
    } else {
      onChange([...selectedSections, sectionKey])
    }
  }

  const selectAll = () => {
    onChange(sections.map(getSectionKey))
  }

  const clearAll = () => {
    onChange([])
  }

  if (isLoading) return <div className="text-sm text-gray-500">Memuat lirik...</div>
  if (!song) return <div className="text-sm text-red-500">Lagu tidak ditemukan</div>

  return (
    <div className="space-y-3 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Pilih Section:
        </label>
        <div className="flex gap-2">
           <button 
             type="button"
             onClick={selectAll}
             className="text-xs text-blue-600 hover:text-blue-700"
           >
             Pilih Semua
           </button>
           <button 
             type="button"
             onClick={clearAll}
             className="text-xs text-gray-500 hover:text-gray-600"
           >
             Reset
           </button>
        </div>
      </div>
      
      {sections && sections.length > 0 ? (
        <div className="grid gap-2">
          {sections.map((section) => {
            const sectionKey = getSectionKey(section)
            const isSelected = selectedSections.includes(sectionKey)
            const sectionType = section.section as SongSectionType
            
            return (
              <label 
                key={sectionKey} 
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  isSelected
                    ? SECTION_COLORS[sectionType]
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 border-gray-200 dark:border-gray-700'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSection(sectionKey)}
                  className="mt-1 w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <span className={`text-xs font-bold uppercase tracking-wider mb-1 block ${SECTION_LABEL_COLORS[sectionType]}`}>
                    {SECTION_LABELS[sectionType]} {section.number}
                  </span>
                  <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-2">
                    {section.content}
                  </p>
                </div>
              </label>
            )
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Tidak ada lirik tersedia.</p>
      )}
    </div>
  )
}
