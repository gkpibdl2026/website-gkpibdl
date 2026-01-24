'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, HeartPulse } from 'lucide-react'
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

interface JemaatSakitItem {
  id: string
  name: string
  location: string // Dirawat di / Rumah / RS...
  keterangan?: string // Opsional: Sakit apa / Pendoa
}

interface JemaatSakitData {
  items: JemaatSakitItem[]
}

interface Props {
  data: JemaatSakitData
  onUpdate: (data: JemaatSakitData) => void
}

// Sortable Item Component
interface SortableItemProps {
  item: JemaatSakitItem
  onUpdate: (id: string, field: keyof JemaatSakitItem, value: string) => void
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
      className="flex items-start gap-2 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="p-1 touch-none cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 mt-1"
        {...attributes}
        {...listeners}
        title="Tarik untuk memindahkan"
      >
        <GripVertical className="w-5 h-5" />
      </button>

      <div className="flex-1 space-y-2">
        {/* Name */}
        <input
          type="text"
          value={item.name}
          onChange={(e) => onUpdate(item.id, 'name', e.target.value)}
          className="w-full px-2 py-1 text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          placeholder="Nama Jemaat"
        />
        
        <div className="flex gap-2">
          {/* Location */}
          <input
            type="text"
            value={item.location}
            onChange={(e) => onUpdate(item.id, 'location', e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Lokasi (mis: RS. Advent / Rumah)"
          />
          
          {/* Keterangan */}
          <input
            type="text"
            value={item.keterangan || ''}
            onChange={(e) => onUpdate(item.id, 'keterangan', e.target.value)}
            className="flex-1 px-2 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            placeholder="Keterangan (opsional)"
          />
        </div>
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors mt-1"
        title="Hapus"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function JemaatSakitEditor({ data, onUpdate }: Props) {
  const items = data?.items || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      
      onUpdate({ 
        items: arrayMove(items, oldIndex, newIndex) 
      })
    }
  }

  const addItem = () => {
    const newItem: JemaatSakitItem = {
      id: `sakit-${Date.now()}`,
      name: '',
      location: ''
    }
    onUpdate({ items: [...items, newItem] })
  }

  const removeItem = (id: string) => {
    onUpdate({ items: items.filter(i => i.id !== id) })
  }

  const updateItem = (id: string, field: keyof JemaatSakitItem, value: string) => {
    onUpdate({
      items: items.map(i => 
        i.id === id ? { ...i, [field]: value } : i
      )
    })
  }

  return (
    <div className="space-y-4">
      {/* Items List */}
      {items.length === 0 ? (
        <div className="text-center py-6 text-gray-500 dark:text-gray-400">
          🏥 Belum ada data jemaat sakit. Klik tombol di bawah untuk menambah.
        </div>
      ) : (
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={items.map(i => i.id)} 
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onUpdate={updateItem}
                  onRemove={removeItem}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Add Button */}
      <button
        type="button"
        onClick={addItem}
        className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-red-500 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
      >
        <HeartPulse className="w-4 h-4" />
        Tambah Data
      </button>

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: Masukkan nama, lokasi perawatan, dan keterangan tambahan jika perlu.
      </p>
    </div>
  )
}
