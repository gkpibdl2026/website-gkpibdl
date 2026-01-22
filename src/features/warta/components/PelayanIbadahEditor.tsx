'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, UserPlus } from 'lucide-react'
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

interface PelayanItem {
  id: string
  role: string
  names: string[]
}

interface PelayanIbadahData {
  pelayan: PelayanItem[]
}

interface Props {
  data: PelayanIbadahData
  onUpdate: (data: PelayanIbadahData) => void
}

const DEFAULT_ROLES = [
  'Pengkhotbah',
  'Liturgos',
  'Doa Syafaat',
  'Warta Jemaat',
  'Kolektan',
  'Piket Ibadah',
  'Pemusik',
  'Song Leader',
  'Multimedia'
]

// Sortable Item Component
interface SortablePelayanItemProps {
  item: PelayanItem
  onUpdateRole: (id: string, role: string) => void
  onUpdateNames: (id: string, namesString: string) => void
  onRemove: (id: string) => void
}

function SortablePelayanItem({ item, onUpdateRole, onUpdateNames, onRemove }: SortablePelayanItemProps) {
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

      {/* Role name (editable) */}
      <div className="flex-1 space-y-2">
        <input
          type="text"
          value={item.role}
          onChange={(e) => onUpdateRole(item.id, e.target.value)}
          className="w-full px-2 py-1 text-sm font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Nama Role"
        />
        <input
          type="text"
          value={item.names.join(', ')}
          onChange={(e) => onUpdateNames(item.id, e.target.value)}
          className="w-full px-2 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Nama pelayan (pisahkan dengan koma jika lebih dari satu)"
        />
      </div>

      {/* Delete button */}
      <button
        type="button"
        onClick={() => onRemove(item.id)}
        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors mt-1"
        title="Hapus role"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function PelayanIbadahEditor({ data, onUpdate }: Props) {
  const [newRole, setNewRole] = useState('')
  const [showAddRole, setShowAddRole] = useState(false)

  const pelayan = data?.pelayan || []

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      const oldIndex = pelayan.findIndex((p) => p.id === active.id)
      const newIndex = pelayan.findIndex((p) => p.id === over.id)
      
      onUpdate({ pelayan: arrayMove(pelayan, oldIndex, newIndex) })
    }
  }

  // Initialize with default roles if empty
  const initializeDefaults = () => {
    const defaultPelayan: PelayanItem[] = DEFAULT_ROLES.map((role, index) => ({
      id: `pelayan-${Date.now()}-${index}`,
      role,
      names: []
    }))
    onUpdate({ pelayan: defaultPelayan })
  }

  const addRole = () => {
    if (!newRole.trim()) return
    
    const newItem: PelayanItem = {
      id: `pelayan-${Date.now()}`,
      role: newRole.trim(),
      names: []
    }
    
    onUpdate({ pelayan: [...pelayan, newItem] })
    setNewRole('')
    setShowAddRole(false)
  }

  const removeRole = (id: string) => {
    onUpdate({ pelayan: pelayan.filter(p => p.id !== id) })
  }

  const updateNames = (id: string, namesString: string) => {
    // Split by comma and trim each name
    const names = namesString.split(',').map(n => n.trim()).filter(n => n)
    
    onUpdate({
      pelayan: pelayan.map(p => 
        p.id === id ? { ...p, names } : p
      )
    })
  }

  const updateRole = (id: string, role: string) => {
    onUpdate({
      pelayan: pelayan.map(p => 
        p.id === id ? { ...p, role } : p
      )
    })
  }

  if (pelayan.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Belum ada data pelayan ibadah
        </p>
        <button
          type="button"
          onClick={initializeDefaults}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          <Plus className="w-4 h-4 inline mr-2" />
          Gunakan Template Default
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* List of roles with drag-and-drop */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={pelayan.map(p => p.id)} 
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {pelayan.map((item) => (
              <SortablePelayanItem
                key={item.id}
                item={item}
                onUpdateRole={updateRole}
                onUpdateNames={updateNames}
                onRemove={removeRole}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Add new role */}
      {showAddRole ? (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-700">
          <input
            type="text"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addRole()}
            className="flex-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Nama role baru..."
            autoFocus
          />
          <button
            type="button"
            onClick={addRole}
            className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition-colors"
          >
            Tambah
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAddRole(false)
              setNewRole('')
            }}
            className="px-3 py-1.5 text-gray-600 dark:text-gray-400 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            Batal
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAddRole(true)}
          className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-amber-500 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          Tambah Role Baru
        </button>
      )}

      {/* Info */}
      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
        💡 Tip: Tarik icon ≡ untuk mengatur urutan. Pisahkan nama dengan koma jika lebih dari satu.
      </p>
    </div>
  )
}
