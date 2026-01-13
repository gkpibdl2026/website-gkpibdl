import { useState } from 'react'
import { TataIbadahItem } from '@/lib/supabase'
import SongSelector from './SongSelector'
import SongVersesSelector from './SongVersesSelector'

interface Props {
  data: { items: TataIbadahItem[] }
  onUpdate: (data: { items: TataIbadahItem[] }) => void
}

const ITEM_TYPES: { value: TataIbadahItem['type']; label: string; color: string }[] = [
  { value: 'RITUAL', label: 'Ritual', color: 'bg-gray-100 text-gray-700' },
  { value: 'NYANYIAN', label: 'Nyanyian', color: 'bg-blue-100 text-blue-700' },
  { value: 'DOA', label: 'Doa', color: 'bg-purple-100 text-purple-700' },
  { value: 'FIRMAN', label: 'Firman', color: 'bg-emerald-100 text-emerald-700' },
  { value: 'PERSEMBAHAN', label: 'Persembahan', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'WARTA', label: 'Warta', color: 'bg-orange-100 text-orange-700' },
  { value: 'LAINNYA', label: 'Lainnya', color: 'bg-gray-100 text-gray-700' },
]

const GKPI_TEMPLATE: Partial<TataIbadahItem>[] = [
  { title: 'Saat Teduh', type: 'RITUAL', description: 'Persiapan batin menghadap Tuhan' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Nyanyian Pembuka' },
  { title: 'Votum - Introitus - Doa', type: 'DOA', description: 'Pembukaan Ibadah' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Respon atas Votum' },
  { title: 'Hukum Taurat', type: 'RITUAL', description: 'Pembacaan Hukum Taurat' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Pengakuan Dosa' },
  { title: 'Pengakuan Dosa & Janji Anugerah', type: 'RITUAL', description: 'Berdasarkan 1 Yohanes 1:9' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Kemuliaan bagi Allah' },
  { title: 'Epistel', type: 'FIRMAN', description: 'Pembacaan Surat Rasuli' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Respon atas Firman' },
  { title: 'Pengakuan Iman Rasuli', type: 'RITUAL', description: 'Bersama jemaat berdiri' },
  { title: 'Warta Jemaat', type: 'WARTA', description: 'Info pelayanan & kegiatan' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Persembahan I' },
  { title: 'Khotbah', type: 'FIRMAN', description: 'Pemberitaan Firman Tuhan' },
  { title: 'Bernyanyi', type: 'NYANYIAN', description: 'Persembahan II (Respon Firman)' },
  { title: 'Doa Penutup & Berkat', type: 'DOA', description: 'Doa Bapa Kami & Berkat' },
]

export default function TataIbadahEditor({ data, onUpdate }: Props) {
  const items = data.items || []
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState<Partial<TataIbadahItem>>({
    title: '',
    type: 'RITUAL',
    description: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleLoadTemplate = () => {
    if (items.length > 0) {
      if (!confirm('Daftar liturgi tidak kosong. Tambahkan template di bawahnya?')) return
    }

    const newItems = GKPI_TEMPLATE.map((t, idx) => ({
      id: crypto.randomUUID(),
      order: items.length + idx + 1,
      title: t.title!,
      type: t.type!,
      description: t.description
    }))

    onUpdate({ items: [...items, ...newItems] })
  }

  const handleAddItem = () => {
    if (!newItem.title) return

    const item: TataIbadahItem = {
      id: crypto.randomUUID(),
      order: items.length + 1,
      title: newItem.title,
      type: newItem.type as TataIbadahItem['type'],
      description: newItem.description
    }

    const updatedItems = [...items, item]
    onUpdate({ items: updatedItems })
    
    // Reset form
    setNewItem({
      title: '',
      type: 'RITUAL',
      description: ''
    })
    setShowAddForm(false)
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter(i => i.id !== id)
    onUpdate({ items: updatedItems })
  }

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === items.length - 1) return

    const newItems = [...items]
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap
    const temp = newItems[index]
    newItems[index] = newItems[targetIndex]
    newItems[targetIndex] = temp

    // Update orders
    newItems.forEach((item, idx) => { item.order = idx + 1 })

    onUpdate({ items: newItems })
  }

  const handleUpdateItem = (id: string, updates: Partial<TataIbadahItem>) => {
    const updatedItems = items.map(item => 
      item.id === id ? { ...item, ...updates } : item
    )
    onUpdate({ items: updatedItems })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900 dark:text-gray-100">Daftar Liturgi</h4>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleLoadTemplate}
            className="px-3 py-1.5 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors flex items-center gap-1 border border-purple-200 dark:border-purple-800"
          >
           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
           </svg>
            Isi Template GKPI
          </button>
          <button
            type="button"
            onClick={() => setShowAddForm(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Item
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Judul Item</label>
            <input
              type="text"
              value={newItem.title}
              onChange={e => setNewItem({ ...newItem, title: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              placeholder="Contoh: Votum, Nyanyian Pembuka..."
              autoFocus
            />
          </div>
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Tipe</label>
              <select
                value={newItem.type}
                onChange={e => setNewItem({ ...newItem, type: e.target.value as TataIbadahItem['type'] })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                {ITEM_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="basis-2/3 flex-auto">
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Keterangan (Opsional)</label>
              <input
                type="text"
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                placeholder="Keterangan tambahan..."
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 rounded-lg"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleAddItem}
              disabled={!newItem.title}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Simpan
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4 italic bg-gray-50 rounded-lg border border-dashed border-gray-300">
            Belum ada item liturgi
          </p>
        ) : (
          items.map((item, index) => {
            const typeConfig = ITEM_TYPES.find(t => t.value === item.type) || ITEM_TYPES[0]
            
            return (
              <div
                key={item.id}
                className={`p-3 bg-white dark:bg-gray-800 border rounded-lg transition-all ${
                  editingId === item.id 
                    ? 'border-blue-500 ring-1 ring-blue-500 shadow-lg' 
                    : 'border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5 text-gray-400">
                    <button onClick={() => handleMoveItem(index, 'up')} disabled={index === 0} className="hover:text-blue-600 disabled:opacity-30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => handleMoveItem(index, 'down')} disabled={index === items.length - 1} className="hover:text-blue-600 disabled:opacity-30">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>

                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => setEditingId(editingId === item.id ? null : item.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                      <span className="font-medium text-sm text-gray-900 dark:text-gray-100">{item.title}</span>
                      {item.songId && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded border border-blue-100">
                          {item.content || 'Lagu Terpilih'}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500">{item.description}</p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Edit Form - Show when expanded */}
                {editingId === item.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-4 animate-fadeIn">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Judul Item</label>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Tipe</label>
                        <select
                          value={item.type}
                          onChange={(e) => handleUpdateItem(item.id, { type: e.target.value as TataIbadahItem['type'] })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                        >
                          {ITEM_TYPES.map(t => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Keterangan</label>
                      <input
                        type="text"
                        value={item.description || ''}
                        onChange={(e) => handleUpdateItem(item.id, { description: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900"
                        placeholder="Tambahkan keterangan..."
                      />
                    </div>

                    {/* Dynamic Content Editor based on Type */}
                    {item.type === 'NYANYIAN' ? (
                       <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
                         <label className="block text-xs font-bold text-blue-700 dark:text-blue-300 mb-2">Pilih Lagu</label>
                         {!item.songId ? (
                           <SongSelector
                             onSelect={(song) => handleUpdateItem(item.id, {
                               songId: song.id,
                               content: `${song.category} ${song.song_number} - ${song.title}`
                             })}
                           />
                         ) : (
                           <div className="space-y-4">
                             <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                               <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                                 {item.content || 'Lagu Terpilih'}
                               </span>
                               <button
                                 onClick={() => handleUpdateItem(item.id, { songId: undefined, content: undefined, songVerses: [] })}
                                 className="text-xs text-red-500 hover:text-red-700 underline"
                               >
                                 Ganti Lagu
                               </button>
                             </div>
                             
                             {/* Verse Selector */}
                             {item.songId && (
                               <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-blue-200 dark:border-blue-700">
                                 <label className="block text-xs font-medium text-gray-500 mb-2">Pilih Ayat (Opsional)</label>
                                 <SongVersesSelector 
                                   songId={item.songId}
                                   selectedVerses={item.songVerses || []}
                                   onChange={(verses) => handleUpdateItem(item.id, { songVerses: verses })}
                                 />
                               </div>
                             )}
                           </div>
                         )}
                       </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Isi / Konten (Opsional)</label>
                        <textarea
                          rows={3}
                          value={item.content || ''}
                          onChange={(e) => handleUpdateItem(item.id, { content: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500"
                          placeholder="Tulis isi liturgi di sini..."
                        />
                      </div>
                    )}
                    
                    <div className="flex justify-end">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 text-xs bg-gray-800 text-white rounded-lg hover:bg-gray-900"
                      >
                        Selesai Edit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
