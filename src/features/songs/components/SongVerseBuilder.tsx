import { useState } from 'react'
import { SongSectionType } from '@/lib/supabase'

interface SongSection {
  section: SongSectionType
  number: number
  content: string
}

interface Props {
  sections: SongSection[]
  onChange: (sections: SongSection[]) => void
}

const SECTION_LABELS: Record<SongSectionType, string> = {
  reff: 'Reff',
  bait: 'Bait',
  interlude: 'Interlude',
  bridge: 'Bridge'
}

const SECTION_COLORS: Record<SongSectionType, string> = {
  reff: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  bait: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  interlude: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  bridge: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
}

export default function SongVerseBuilder({ sections, onChange }: Props) {
  const [newSectionType, setNewSectionType] = useState<SongSectionType>('bait')

  const getNextNumber = (type: SongSectionType): number => {
    const existingOfType = sections.filter(s => s.section === type)
    return existingOfType.length + 1
  }

  const handleAddSection = (type: SongSectionType) => {
    onChange([...sections, { 
      section: type, 
      number: getNextNumber(type), 
      content: '' 
    }])
  }

  const handleUpdateContent = (index: number, content: string) => {
    const newSections = [...sections]
    newSections[index] = { ...newSections[index], content }
    onChange(newSections)
  }

  const handleRemoveSection = (index: number) => {
    const removedSection = sections[index]
    const newSections = sections.filter((_, i) => i !== index)
    
    // Re-number sections of the same type
    let counter = 0
    const renumbered = newSections.map(s => {
      if (s.section === removedSection.section) {
        counter++
        return { ...s, number: counter }
      }
      return s
    })
    onChange(renumbered)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newSections = [...sections]
    ;[newSections[index - 1], newSections[index]] = [newSections[index], newSections[index - 1]]
    onChange(newSections)
  }

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return
    const newSections = [...sections]
    ;[newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]]
    onChange(newSections)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Lirik Lagu
        </label>
        <div className="flex items-center gap-2">
          <select
            value={newSectionType}
            onChange={(e) => setNewSectionType(e.target.value as SongSectionType)}
            className="text-sm border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="bait">Bait</option>
            <option value="reff">Reff</option>
            <option value="interlude">Interlude</option>
            <option value="bridge">Bridge</option>
          </select>
          <button
            type="button"
            onClick={() => handleAddSection(newSectionType)}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium px-3 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg"
          >
            + Tambah
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {sections.map((section, index) => (
          <div key={index} className="flex gap-3 items-start">
            {/* Section Label */}
            <div className="flex flex-col gap-1 items-center pt-1">
              <span className={`px-2 py-1 text-xs font-bold rounded-lg whitespace-nowrap ${SECTION_COLORS[section.section]}`}>
                {SECTION_LABELS[section.section]} {section.number}
              </span>
              {/* Move buttons */}
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Pindah ke atas"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === sections.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  title="Pindah ke bawah"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content textarea */}
            <div className="flex-1">
              <textarea
                value={section.content}
                onChange={(e) => handleUpdateContent(index, e.target.value)}
                placeholder={`Isi ${SECTION_LABELS[section.section]} ${section.number}...`}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              />
            </div>
            
            {/* Delete button */}
            <button
              type="button"
              onClick={() => handleRemoveSection(index)}
              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Hapus section"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Belum ada lirik. Pilih tipe section dan klik &ldquo;+ Tambah&rdquo; untuk mulai.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
