import { useState } from 'react'
import { ModuleType, WartaModule } from '@/lib/supabase'
import ModuleRenderer from './ModuleRenderer'
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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

// Helper function to generate preview text for collapsed modules
function getModulePreview(module: WartaModule): string {
  switch (module.type) {
    case 'LAGU': {
      const songData = module.data as {
        songTitle?: string
        songNumber?: string
        category?: string
      }
      if (songData.songTitle && songData.songNumber && songData.category) {
        return `${songData.category} ${songData.songNumber} - ${songData.songTitle}`
      }
      return 'Belum dipilih'
    }
    case 'AYAT': {
      const ayatData = module.data as {
        bookName?: string
        chapter?: number
        verseStart?: number
        verseEnd?: number
      }
      if (ayatData.bookName && ayatData.chapter && ayatData.verseStart && ayatData.verseEnd) {
        return `${ayatData.bookName} ${ayatData.chapter}:${ayatData.verseStart}-${ayatData.verseEnd}`
      }
      return 'Belum dipilih'
    }
    case 'TATA_IBADAH': {
      const tataIbadahData = module.data as { items?: unknown[] }
      const itemCount = tataIbadahData.items?.length || 0
      return `${itemCount} item`
    }
    case 'PELAYAN_IBADAH': {
      const pelayanData = module.data as { pelayan?: unknown[] }
      const itemCount = pelayanData.pelayan?.length || 0
      return `${itemCount} role pelayan`
    }
    case 'PENGUMUMAN': {
      const pengumumanData = module.data as { items?: unknown[] }
      const itemCount = pengumumanData.items?.length || 0
      return `${itemCount} pengumuman`
    }
    case 'STATISTIK': {
      const statistikData = module.data as { rows?: unknown[] }
      const rowCount = statistikData.rows?.length || 0
      return rowCount > 0 ? `${rowCount} baris data` : 'Belum diisi'
    }
    case 'KEUANGAN': {
      const keuanganData = module.data as { period?: string }
      if (keuanganData.period) {
        return `Periode: ${keuanganData.period}`
      }
      return 'Belum diisi'
    }
    case 'ULANG_TAHUN': {
      const ulangTahunData = module.data as { items?: unknown[] }
      const itemCount = ulangTahunData.items?.length || 0
      return `${itemCount} jemaat`
    }
    case 'JEMAAT_SAKIT': {
      const jemaatSakitData = module.data as { items?: unknown[] }
      const itemCount = jemaatSakitData.items?.length || 0
      return `${itemCount} jemaat`
    }
    default:
      return ''
  }
}

// Component for sortable item
interface SortableModuleItemProps {
  module: WartaModule
  index: number
  isCollapsed: boolean
  toggleModuleCollapse: (id: string) => void
  onRemove: (id: string) => void
  onUpdate: (id: string, data: Record<string, unknown>) => void
  MODULE_OPTIONS: { type: ModuleType; label: string }[]
  getModulePreview: (module: WartaModule) => string
}

function SortableModuleItem({
  module,
  index,
  isCollapsed,
  toggleModuleCollapse,
  onRemove,
  onUpdate,
  MODULE_OPTIONS,
  getModulePreview
}: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1, // Elevate dragged item
    position: 'relative' as const,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xs mb-4"
    >
      {/* Module Header - Always visible */}
      <div 
        className={`flex items-center justify-between transition-all duration-200 ${isCollapsed ? 'py-2 px-4' : 'p-4 border-b border-gray-100 dark:border-gray-700'}`}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle */}
          <button
            type="button"
            className="p-1 touch-none cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            {...attributes}
            {...listeners}
            title="Tarik untuk memindahkan"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </button>

          {/* Collapse Trigger (Entire header area except drag handle and actions) */}
          <div 
            className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
            onClick={() => toggleModuleCollapse(module.id)}
          >
            {/* Collapse/Expand indicator */}
            <div className="text-gray-400 hover:text-blue-600 transition-colors">
              <svg 
                className={`transform transition-all duration-200 ${isCollapsed ? 'w-4 h-4 -rotate-90' : 'w-5 h-5 rotate-0'}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            <div className={`rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold transition-all duration-200 ${isCollapsed ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-sm'}`}>
              {index + 1}
            </div>
            
            <div className={`min-w-0 ${isCollapsed ? 'grid grid-cols-[220px_1fr] gap-1 items-center' : 'flex items-center gap-2'}`}>
              {(() => {
                const moduleLabel = MODULE_OPTIONS.find(o => o.type === module.type)?.label || module.type
                // Three-tier font sizing to prevent wrapping:
                // - Short labels (≤8 chars): 14px (text-sm equivalent)
                // - Medium labels (9-15 chars): 12px (text-xs equivalent)
                // - Long labels (>15 chars): 10px (smaller than text-xs)
                let fontSize = '14px'
                if (moduleLabel.length > 15) {
                  fontSize = '10px'
                } else if (moduleLabel.length > 8) {
                  fontSize = '12px'
                }
                
                return (
                  <h3 
                    className={`font-medium text-gray-900 dark:text-white transition-all duration-200 shrink-0`}
                    style={{ fontSize: isCollapsed ? fontSize : '16px' }}
                  >
                    {moduleLabel}:
                  </h3>
                )
              })()}
              {isCollapsed && (
                <span className={`text-gray-600 dark:text-gray-400 transition-all duration-200 ${isCollapsed ? 'text-sm' : 'text-base'} truncate`}>
                  {getModulePreview(module)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-4">
          <button
            type="button"
            onClick={() => onRemove(module.id)}
            className="p-1 text-red-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
            title="Hapus modul"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Module Content - Collapsible */}
      <div 
        className={`transition-all duration-200 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0 overflow-hidden' : 'max-h-none opacity-100'}`}
      >
        <div className="p-4 pl-16">
          <ModuleRenderer 
            module={module} 
            onUpdate={(data) => onUpdate(module.id, data)}
          />
        </div>
      </div>
    </div>
  )
}

export default function WartaModuleBuilder({ modules, onChange }: Props) {
  const [isAdding, setIsAdding] = useState(false)
  // Track which modules are collapsed (by module id)
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set())

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex((m) => m.id === active.id)
      const newIndex = modules.findIndex((m) => m.id === over.id)
      
      onChange(arrayMove(modules, oldIndex, newIndex))
    }
  }

  const toggleModuleCollapse = (id: string) => {
    setCollapsedModules(prev => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  const collapseAll = () => {
    setCollapsedModules(new Set(modules.map(m => m.id)))
  }

  const expandAll = () => {
    setCollapsedModules(new Set())
  }

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
    // Also remove from collapsed set
    setCollapsedModules(prev => {
      const newSet = new Set(prev)
      newSet.delete(id)
      return newSet
    })
  }



  const handleUpdateModuleData = (id: string, data: Record<string, unknown>) => {
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
        <div className="flex items-center gap-2">
          {/* Collapse/Expand All buttons - only show if there are modules */}
          {modules.length > 0 && (
            <div className="flex items-center gap-1 mr-2">
              <button
                type="button"
                onClick={collapseAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Sembunyikan semua"
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                Sembunyikan Semua
              </button>
              <button
                type="button"
                onClick={expandAll}
                className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                title="Tampilkan semua"
              >
                <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
                Tampilkan Semua
              </button>
            </div>
          )}
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
      </div>

      <div className="space-y-4">
        {modules.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400">
              Belum ada modul yang ditambahkan.
              <br />
              Klik tombol &quot;Tambah Modul&quot; untuk mulai.
            </p>
          </div>
        ) : (
          <DndContext 
            sensors={sensors} 
            collisionDetection={closestCenter} 
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={modules.map(m => m.id)} 
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {modules.map((module, index) => (
                  <SortableModuleItem
                    key={module.id}
                    module={module}
                    index={index}
                    isCollapsed={collapsedModules.has(module.id)}
                    toggleModuleCollapse={toggleModuleCollapse}
                    onRemove={handleRemoveModule}
                    onUpdate={handleUpdateModuleData}
                    MODULE_OPTIONS={MODULE_OPTIONS}
                    getModulePreview={getModulePreview}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
    </div>
  )
}
