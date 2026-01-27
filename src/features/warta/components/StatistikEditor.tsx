'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical } from 'lucide-react'
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

interface Props {
  data: StatistikData
  onUpdate: (data: StatistikData) => void
}

// Sortable Row Component
interface SortableRowProps {
  row: StatistikRow
  onUpdate: (id: string, field: keyof StatistikRow, value: string | number | null) => void
  onRemove: (id: string) => void
}

function SortableRow({ row, onUpdate, onRemove }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: row.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
  }

  const handleNumberChange = (field: 'bapak' | 'ibu' | 'ppRemaja' | 'jumlah', value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10)
    onUpdate(row.id, field, isNaN(numValue as number) ? null : numValue)
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="p-1 touch-none cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        {...attributes}
        {...listeners}
        title="Tarik untuk memindahkan"
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {/* Keterangan */}
      <input
        type="text"
        value={row.keterangan}
        onChange={(e) => onUpdate(row.id, 'keterangan', e.target.value)}
        className="flex-1 min-w-0 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Keterangan"
      />

      {/* Number inputs */}
      <input
        type="number"
        value={row.bapak ?? ''}
        onChange={(e) => handleNumberChange('bapak', e.target.value)}
        className="w-16 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Bp"
        title="Bapak"
      />
      <input
        type="number"
        value={row.ibu ?? ''}
        onChange={(e) => handleNumberChange('ibu', e.target.value)}
        className="w-16 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Ibu"
        title="Ibu"
      />
      <input
        type="number"
        value={row.ppRemaja ?? ''}
        onChange={(e) => handleNumberChange('ppRemaja', e.target.value)}
        className="w-16 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="PP"
        title="PP-Remaja"
      />
      <input
        type="number"
        value={row.jumlah ?? ''}
        onChange={(e) => handleNumberChange('jumlah', e.target.value)}
        className="w-20 px-2 py-1 text-sm text-center font-semibold bg-cyan-50 dark:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-700 rounded focus:outline-none focus:ring-2 focus:ring-cyan-500"
        placeholder="Total"
        title="Jumlah"
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(row.id)}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="Hapus baris"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function StatistikEditor({ data, onUpdate }: Props) {
  const [title, setTitle] = useState(data?.title || 'KEHADIRAN IBADAH MINGGU & SERMONT PHJ/PNT/CLN PNT')
  
  const rows = data?.rows || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = rows.findIndex((r) => r.id === active.id)
      const newIndex = rows.findIndex((r) => r.id === over.id)
      
      onUpdate({ title, rows: arrayMove(rows, oldIndex, newIndex) })
    }
  }

  const addRow = () => {
    const newRow: StatistikRow = {
      id: `stat-${crypto.randomUUID()}`,
      keterangan: '',
      bapak: null,
      ibu: null,
      ppRemaja: null,
      jumlah: null
    }
    onUpdate({ title, rows: [...rows, newRow] })
  }

  const removeRow = (id: string) => {
    onUpdate({ title, rows: rows.filter(r => r.id !== id) })
  }

  const updateRow = (id: string, field: keyof StatistikRow, value: string | number | null) => {
    onUpdate({
      title,
      rows: rows.map(r => 
        r.id === id ? { ...r, [field]: value } : r
      )
    })
  }

  const updateTitle = (newTitle: string) => {
    setTitle(newTitle)
    onUpdate({ title: newTitle, rows })
  }

  // Calculate totals
  const totals = rows.reduce((acc, row) => ({
    bapak: acc.bapak + (row.bapak || 0),
    ibu: acc.ibu + (row.ibu || 0),
    ppRemaja: acc.ppRemaja + (row.ppRemaja || 0),
    jumlah: acc.jumlah + (row.jumlah || 0)
  }), { bapak: 0, ibu: 0, ppRemaja: 0, jumlah: 0 })

  return (
    <div className="space-y-4">
      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-cyan-700 dark:text-cyan-300 mb-1">
          Judul Statistik:
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
          placeholder="Judul statistik..."
        />
      </div>

      {/* Column Headers */}
      <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        <div className="w-6"></div> {/* Drag handle space */}
        <div className="flex-1">Keterangan</div>
        <div className="w-16 text-center">Bapak</div>
        <div className="w-16 text-center">Ibu</div>
        <div className="w-16 text-center">PP/Rmj</div>
        <div className="w-20 text-center">Jumlah</div>
        <div className="w-8"></div> {/* Delete button space */}
      </div>

      {/* Rows */}
      {rows.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          Belum ada data. Klik tombol di bawah untuk menambah baris.
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={rows.map(r => r.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {rows.map((row) => (
                <SortableRow
                  key={row.id}
                  row={row}
                  onUpdate={updateRow}
                  onRemove={removeRow}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Totals Row */}
      {rows.length > 0 && (
        <div className="flex items-center gap-2 p-2 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg border border-cyan-200 dark:border-cyan-700 font-semibold">
          <div className="w-6"></div>
          <div className="flex-1 text-cyan-800 dark:text-cyan-200">TOTAL</div>
          <div className="w-16 text-center text-cyan-700 dark:text-cyan-300">{totals.bapak || '-'}</div>
          <div className="w-16 text-center text-cyan-700 dark:text-cyan-300">{totals.ibu || '-'}</div>
          <div className="w-16 text-center text-cyan-700 dark:text-cyan-300">{totals.ppRemaja || '-'}</div>
          <div className="w-20 text-center text-cyan-900 dark:text-cyan-100 text-lg">{totals.jumlah || '-'}</div>
          <div className="w-8"></div>
        </div>
      )}

      {/* Add Row Button */}
      <button
        type="button"
        onClick={addRow}
        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-cyan-500 hover:text-cyan-600 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Tambah Baris
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: Kolom &quot;Jumlah&quot; bisa diisi manual atau dihitung otomatis dari Bapak + Ibu + PP-Remaja
      </p>
    </div>
  )
}
