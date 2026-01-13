import { useState } from 'react'

interface Verse {
  verse: number
  content: string
}

interface Props {
  verses: Verse[]
  onChange: (verses: Verse[]) => void
}

export default function SongVerseBuilder({ verses, onChange }: Props) {
  const handleAddVerse = () => {
    onChange([...verses, { verse: verses.length + 1, content: '' }])
  }

  const handleUpdateVerse = (index: number, content: string) => {
    const newVerses = [...verses]
    newVerses[index] = { ...newVerses[index], content }
    onChange(newVerses)
  }

  const handleRemoveVerse = (index: number) => {
    const newVerses = verses.filter((_, i) => i !== index)
    // Re-number verses
    const renumbered = newVerses.map((v, i) => ({ ...v, verse: i + 1 }))
    onChange(renumbered)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Lirik Lagu
        </label>
        <button
          type="button"
          onClick={handleAddVerse}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + Tambah Bait
        </button>
      </div>

      <div className="space-y-4">
        {verses.map((verse, index) => (
          <div key={index} className="flex gap-4 items-start">
            <span className="pt-3 text-sm font-medium text-gray-500 w-8 text-center bg-gray-50 dark:bg-gray-800 rounded-lg self-stretch flex items-center justify-center">
              {verse.verse}
            </span>
            <div className="flex-1">
              <textarea
                value={verse.content}
                onChange={(e) => handleUpdateVerse(index, e.target.value)}
                placeholder={`Isi bait ke-${verse.verse}...`}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none"
              />
            </div>
            <button
              type="button"
              onClick={() => handleRemoveVerse(index)}
              className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Hapus bait"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {verses.length === 0 && (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-sm">Belum ada lirik. Klik "+ Tambah Bait" untuk mulai.</p>
          </div>
        )}
      </div>
    </div>
  )
}
