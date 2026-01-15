import { WartaModule } from '@/lib/supabase'
import SongSelector from './SongSelector'
import SongVersesSelector from './SongVersesSelector'
import VerseSelector from './VerseSelector'
import TataIbadahEditor from './TataIbadahEditor'
import { TataIbadahItem } from '@/lib/supabase'

interface Props {
  module: WartaModule
  onUpdate: (data: Record<string, unknown>) => void
}

export default function ModuleRenderer({ module, onUpdate }: Props) {
  switch (module.type) {
    case 'LAGU':
      const songData = module.data as { 
        songId?: string; 
        songTitle?: string; 
        songNumber?: string; 
        category?: string; 
        selectedVerses?: number[];
        selectedSections?: string[];
      }

      // Backward compatibility: map old verse numbers to new "bait-N" format if selectedSections is missing
      const effectiveSelectedSections = songData.selectedSections || 
        (songData.selectedVerses?.map(v => `bait-${v}`) || [])
      
      return (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
           <div className="flex items-center justify-between mb-4">
             <h4 className="font-medium text-blue-900 dark:text-blue-100 flex items-center gap-2">
               <span className="p-1 bg-blue-200 dark:bg-blue-800 rounded text-blue-800 dark:text-blue-100 text-xs font-bold">LAGU</span>
               {songData.songTitle ? `${songData.category} ${songData.songNumber} - ${songData.songTitle}` : 'Pilih Lagu'}
             </h4>
             {songData.songId && (
               <button 
                 type="button"
                 onClick={() => onUpdate({})}
                 className="text-xs text-blue-600 hover:text-blue-800 underline"
               >
                 Ganti Lagu
               </button>
             )}
          </div>
          
          {!songData.songId ? (
            <SongSelector 
              onSelect={(song) => onUpdate({
                songId: song.id,
                songTitle: song.title,
                songNumber: song.song_number,
                category: song.category,
                selectedSections: [] 
              })} 
            />
          ) : (
            <div className="space-y-4">
               <SongVersesSelector 
                 songId={songData.songId} 
                 selectedSections={effectiveSelectedSections}
                 onChange={(sections) => {
                   // When updating, we can clear the old selectedVerses to avoid confusion, 
                   // or keep them synced. For now, we move forward with selectedSections.
                   onUpdate({ ...songData, selectedSections: sections })
                 }}
               />
            </div>
          )}
        </div>
      )
    case 'AYAT':
      const ayatData = module.data as { 
        bookId?: number
        bookName?: string
        bookAbbr?: string
        chapter?: number
        verseStart?: number
        verseEnd?: number
        translation?: string
        content?: string
        category?: string
      }

      return (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-emerald-900 dark:text-emerald-100 flex items-center gap-2">
              <span className="p-1 bg-emerald-200 dark:bg-emerald-800 rounded text-emerald-800 dark:text-emerald-100 text-xs font-bold">AYAT</span>
              {ayatData.bookName 
                ? `${ayatData.bookName} ${ayatData.chapter}:${ayatData.verseStart}-${ayatData.verseEnd} (${ayatData.translation})` 
                : 'Pilih Ayat'}
            </h4>
            {ayatData.bookId && (
              <button 
                type="button"
                onClick={() => onUpdate({})}
                className="text-xs text-emerald-600 hover:text-emerald-800 underline"
              >
                Ganti Ayat
              </button>
            )}
          </div>

          {/* Category Selector */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-emerald-700 dark:text-emerald-300 mb-2">
              Kategori Bacaan:
            </label>
            <div className="flex flex-wrap gap-2">
              {['KHOTBAH', 'EPISTEL', 'INJIL', 'MAZMUR', 'TAURAT', 'LAINNYA'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onUpdate({ ...ayatData, category: cat })}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-full transition-all border-2 ${
                    ayatData.category === cat
                      ? 'bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-400 ring-offset-1 ring-offset-emerald-50 dark:ring-offset-gray-800'
                      : 'bg-transparent border-emerald-300 dark:border-emerald-600 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {!ayatData.bookId ? (
            <VerseSelector 
              onSelect={(selection) => onUpdate({
                ...ayatData,
                bookId: selection.bookId,
                bookName: selection.bookName,
                bookAbbr: selection.bookAbbr,
                chapter: selection.chapter,
                verseStart: selection.verseStart,
                verseEnd: selection.verseEnd,
                translation: selection.translation,
                content: selection.content
              })}
            />
          ) : (
            <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-emerald-200 dark:border-emerald-700">
              <p className="text-sm text-gray-700 dark:text-gray-300 italic">
                &ldquo;{ayatData.content}&rdquo;
              </p>
            </div>
          )}
        </div>
      )
    case 'TATA_IBADAH':
      const tataIbadahData = module.data as { items: TataIbadahItem[] }
      return (
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
           <div className="flex items-center justify-between mb-4">
             <h4 className="font-medium text-purple-900 dark:text-purple-100 flex items-center gap-2">
               <span className="p-1 bg-purple-200 dark:bg-purple-800 rounded text-purple-800 dark:text-purple-100 text-xs font-bold">TATA IBADAH</span>
               {tataIbadahData.items?.length || 0} Item
             </h4>
           </div>
           
           <TataIbadahEditor 
             data={tataIbadahData}
             onUpdate={(newData) => onUpdate({ ...tataIbadahData, ...newData })}
           />
        </div>
      )
    default:
      return (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Modul {module.type}</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400">Konfigurasi untuk modul ini belum tersedia.</p>
        </div>
      )
  }
}
