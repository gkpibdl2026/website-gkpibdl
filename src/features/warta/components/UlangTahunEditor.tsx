'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Cake } from 'lucide-react'
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

interface UlangTahunItem {
  id: string
  name: string
  birthDate: string // Format: DD/MM/YYYY
}

interface UlangTahunData {
  dateRangeStart?: string
  dateRangeEnd?: string
  members: UlangTahunItem[]
}

interface Props {
  data: UlangTahunData
  onUpdate: (data: UlangTahunData) => void
}

// Sortable Item Component
interface SortableItemProps {
  item: UlangTahunItem
  onUpdate: (id: string, field: keyof UlangTahunItem, value: string) => void
  onRemove: (id: string) => void
}

function SortableItem({ item, onUpdate, onRemove }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : 1,
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

      {/* Name */}
      <input
        type="text"
        value={item.name}
        onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
        className="flex-1 min-w-0 px-2 py-1 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
        placeholder="Nama jemaat"
      />

      {/* Birth Date */}
      <input
        type="text"
        value={item.birthDate}
        onChange={(e) => onUpdate(item.id, 'birthDate', e.target.value)}
        className="w-28 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
        placeholder="DD/MM/YYYY"
        title="Tanggal Lahir (DD/MM/YYYY)"
      />

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function UlangTahunEditor({ data, onUpdate }: Props) {
  const [dateRangeStart, setDateRangeStart] = useState(data?.dateRangeStart || '')
  const [dateRangeEnd, setDateRangeEnd] = useState(data?.dateRangeEnd || '')
  
  const members = data?.members || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = members.findIndex((m) => m.id === active.id)
      const newIndex = members.findIndex((m) => m.id === over.id)
      
      onUpdate({ 
        dateRangeStart, 
        dateRangeEnd, 
        members: arrayMove(members, oldIndex, newIndex) 
      })
    }
  }

  const addMember = () => {
    const newMember: UlangTahunItem = {
      id: `ultah-${Date.now()}`,
      name: '',
      birthDate: ''
    }
    onUpdate({ dateRangeStart, dateRangeEnd, members: [...members, newMember] })
  }

  const removeMember = (id: string) => {
    onUpdate({ dateRangeStart, dateRangeEnd, members: members.filter(m => m.id !== id) })
  }

  const updateMember = (id: string, field: keyof UlangTahunItem, value: string) => {
    onUpdate({
      dateRangeStart,
      dateRangeEnd,
      members: members.map(m => 
        m.id === id ? { ...m, [field]: value } : m
      )
    })
  }

  const updateDateRange = (start: string, end: string) => {
    setDateRangeStart(start)
    setDateRangeEnd(end)
    onUpdate({ dateRangeStart: start, dateRangeEnd: end, members })
  }

  return (
    <div className="space-y-4">
      {/* Date Range */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-pink-700 dark:text-pink-300">Periode:</label>
        <input
          type="text"
          value={dateRangeStart}
          onChange={(e) => updateDateRange(e.target.value, dateRangeEnd)}
          className="w-28 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="DD/MM/YYYY"
        />
        <span className="text-gray-500">s/d</span>
        <input
          type="text"
          value={dateRangeEnd}
          onChange={(e) => updateDateRange(dateRangeStart, e.target.value)}
          className="w-28 px-2 py-1 text-sm text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-pink-500"
          placeholder="DD/MM/YYYY"
        />
      </div>

      {/* Column Headers */}
      <div className="flex items-center gap-2 px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
        <div className="w-6"></div>
        <div className="flex-1">Nama</div>
        <div className="w-28 text-center">Tanggal Lahir</div>
        <div className="w-8"></div>
      </div>

      {/* Members List */}
      {members.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          🎂 Belum ada data ulang tahun. Klik tombol di bawah untuk menambah.
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={members.map(m => m.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {members.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onUpdate={updateMember}
                  onRemove={removeMember}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={addMember}
        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-pink-500 hover:text-pink-600 transition-colors flex items-center justify-center gap-2"
      >
        <Cake className="w-4 h-4" />
        Tambah Jemaat
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: Format tanggal: DD/MM/YYYY (contoh: 21/01/2000)
      </p>
    </div>
  )
}
