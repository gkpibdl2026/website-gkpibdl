import { ModuleType, WartaModule } from '@/lib/supabase'
import SongSelector from './SongSelector'
import SongVersesSelector from './SongVersesSelector'

interface Props {
  module: WartaModule
  onUpdate: (data: any) => void
}

export default function ModuleRenderer({ module, onUpdate }: Props) {
  switch (module.type) {
    case 'LAGU':
      const songData = module.data as { songId?: string; songTitle?: string; songNumber?: string; category?: string; selectedVerses?: number[] }
      
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
                selectedVerses: [] 
              })} 
            />
          ) : (
            <div className="space-y-4">
               <SongVersesSelector 
                 songId={songData.songId} 
                 selectedVerses={songData.selectedVerses || []}
                 onChange={(verses) => onUpdate({ ...songData, selectedVerses: verses })}
               />
            </div>
          )}
        </div>
      )
    case 'AYAT':
      return (
        <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-100 dark:border-emerald-800">
          <h4 className="font-medium text-emerald-900 dark:text-emerald-100 mb-2">Modul Ayat</h4>
          <p className="text-sm text-emerald-700 dark:text-emerald-300">Konfigurasi ayat akan muncul di sini nanti.</p>
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
