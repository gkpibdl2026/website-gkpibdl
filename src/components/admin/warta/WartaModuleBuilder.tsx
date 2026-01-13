import { useState } from 'react'
import { ModuleType, WartaModule } from '@/lib/supabase'
import ModuleRenderer from './ModuleRenderer'

interface Props {
  modules: WartaModule[]
  onChange: (modules: WartaModule[]) => void
}

const MODULE_OPTIONS: { type: ModuleType; label: string }[] = [
  { type: 'LAGU', label: 'Lagu' },
  { type: 'AYAT', label: 'Ayat' },
  { type: 'TATA_IBADAH', label: 'Tata Ibadah' },
  { type: 'PELAYAN_IBADAH', label: 'Pelayan Ibadah' },
  { type: 'PENGUMUMAN', label: 'Pengumuman' },
  { type: 'STATISTIK', label: 'Statistik Kehadiran' },
  { type: 'KEUANGAN', label: 'Laporan Keuangan' },
  { type: 'ULANG_TAHUN', label: 'Ulang Tahun' },
  { type: 'JEMAAT_SAKIT', label: 'Jemaat Sakit' },
]

export default function WartaModuleBuilder({ modules, onChange }: Props) {
  const [isAdding, setIsAdding] = useState(false)

  const handleAddModule = (type: ModuleType) => {
    const newModule: WartaModule = {
      id: crypto.randomUUID(),
      type,
      order: modules.length,
      data: {},
    }
    onChange([...modules, newModule])
    setIsAdding(false)
  }

  const handleRemoveModule = (id: string) => {
    onChange(modules.filter((m) => m.id !== id))
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newModules = [...modules]
    const temp = newModules[index]
    newModules[index] = newModules[index - 1]
    newModules[index - 1] = temp
    onChange(newModules)
  }

  const handleMoveDown = (index: number) => {
    if (index === modules.length - 1) return
    const newModules = [...modules]
    const temp = newModules[index]
    newModules[index] = newModules[index + 1]
    newModules[index + 1] = temp
    onChange(newModules)
  }

  const handleUpdateModuleData = (id: string, data: any) => {
    const newModules = modules.map((m) =>
      m.id === id ? { ...m, data } : m
    )
    onChange(newModules)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          Modul Warta
        </h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsAdding(!isAdding)}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Modul
          </button>
          
          {isAdding && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setIsAdding(false)}
              ></div>
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-20 py-2 max-h-80 overflow-y-auto">
                {MODULE_OPTIONS.map((option) => (
                  <button
                    key={option.type}
                    type="button"
                    onClick={() => handleAddModule(option.type)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada modul yang ditambahkan.
              <br />
              Klik tombol "Tambah Modul" untuk mulai.
            </p>
          </div>
        ) : (
          modules.map((module, index) => (
            <div
              key={module.id}
              className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs"
            >
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  title="Geser ke atas"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === modules.length - 1}
                  className="p-1 text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:hover:text-gray-400"
                  title="Geser ke bawah"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1"></div>
                <button
                  type="button"
                  onClick={() => handleRemoveModule(module.id)}
                  className="p-1 text-red-400 hover:text-red-500"
                  title="Hapus modul"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {MODULE_OPTIONS.find(o => o.type === module.type)?.label || module.type}
                  </h3>
                </div>
                
                <div className="pl-11">
                  <ModuleRenderer 
                    module={module} 
                    onUpdate={(data) => handleUpdateModuleData(module.id, data)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
