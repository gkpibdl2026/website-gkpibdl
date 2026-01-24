import { WartaModule } from '@/lib/supabase'
import SongSelector from './SongSelector'
import SongVersesSelector from './SongVersesSelector'
import VerseSelector from './VerseSelector'
import TataIbadahEditor from './TataIbadahEditor'
import PelayanIbadahEditor from './PelayanIbadahEditor'
import StatistikEditor from './StatistikEditor'
import UlangTahunEditor from './UlangTahunEditor'
import JemaatSakitEditor from './JemaatSakitEditor'
import { TataIbadahItem } from '@/lib/supabase'

// Type for Pelayan Ibadah
interface PelayanItem {
  id: string
  role: string
  names: string[]
}

interface PelayanIbadahData {
  pelayan: PelayanItem[]
}

// Type for Statistik
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

// Type for Ulang Tahun
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

// Type for Jemaat Sakit
interface JemaatSakitItem {
  id: string
  name: string
  location: string
  keterangan?: string
}

interface JemaatSakitData {
  items: JemaatSakitItem[]
}

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
    case 'PELAYAN_IBADAH':
      const pelayanData = module.data as PelayanIbadahData
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-amber-900 dark:text-amber-100 flex items-center gap-2">
              <span className="p-1 bg-amber-200 dark:bg-amber-800 rounded text-amber-800 dark:text-amber-100 text-xs font-bold">PELAYAN</span>
              Pelayan Kebaktian Minggu
            </h4>
          </div>
          
          <PelayanIbadahEditor 
            data={pelayanData}
            onUpdate={(newData) => onUpdate({ ...pelayanData, ...newData })}
          />
        </div>
      )
    case 'STATISTIK':
      const statistikData = module.data as StatistikData
      return (
        <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg border border-cyan-100 dark:border-cyan-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-cyan-900 dark:text-cyan-100 flex items-center gap-2">
              <span className="p-1 bg-cyan-200 dark:bg-cyan-800 rounded text-cyan-800 dark:text-cyan-100 text-xs font-bold">STATISTIK</span>
              Statistik Kehadiran
            </h4>
          </div>
          
          <StatistikEditor 
            data={statistikData}
            onUpdate={(newData) => onUpdate({ ...statistikData, ...newData })}
          />
        </div>
      )
    case 'ULANG_TAHUN':
      const ulangTahunData = module.data as UlangTahunData
      return (
        <div className="p-4 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-100 dark:border-pink-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-pink-900 dark:text-pink-100 flex items-center gap-2">
              <span className="p-1 bg-pink-200 dark:bg-pink-800 rounded text-pink-800 dark:text-pink-100 text-xs font-bold">ULTAH</span>
              Ulang Tahun Jemaat
            </h4>
          </div>
          
          <UlangTahunEditor 
            data={ulangTahunData}
            onUpdate={(newData) => onUpdate({ ...ulangTahunData, ...newData })}
          />
        </div>
      )
    case 'JEMAAT_SAKIT':
      const jemaatSakitData = module.data as JemaatSakitData
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-red-900 dark:text-red-100 flex items-center gap-2">
              <span className="p-1 bg-red-200 dark:bg-red-800 rounded text-red-800 dark:text-red-100 text-xs font-bold">SAKIT</span>
              Pokok Doa Jemaat Sakit
            </h4>
          </div>
          
          <JemaatSakitEditor 
            data={jemaatSakitData}
            onUpdate={(newData) => onUpdate({ ...jemaatSakitData, ...newData })}
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
