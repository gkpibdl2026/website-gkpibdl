import { useState, useEffect } from 'react'

interface BibleBook {
  id: number
  book_name: string
  book_abbr: string
  testament: string
  book_order: number
  total_chapters: number
}

interface BibleVerse {
  id: string
  book_id: number
  chapter: number
  verse: number
  translation: string
  content: string
}

interface VerseSelection {
  bookId: number
  bookName: string
  bookAbbr: string
  chapter: number
  verseStart: number
  verseEnd: number
  translation: string
  content: string
}

interface Props {
  onSelect: (selection: VerseSelection) => void
  initialSelection?: VerseSelection
}

export default function VerseSelector({ onSelect }: Props) {
  const [books, setBooks] = useState<BibleBook[]>([])
  const [selectedBook, setSelectedBook] = useState<BibleBook | null>(null)
  const [chapter, setChapter] = useState('')
  const [verseStart, setVerseStart] = useState('')
  const [verseEnd, setVerseEnd] = useState('')
  const [translation, setTranslation] = useState('TB')
  const [verses, setVerses] = useState<BibleVerse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch('/api/bible')
        const { data } = await res.json()
        setBooks(data || [])
      } catch (err) {
        console.error('Error fetching books:', err)
      }
    }
    fetchBooks()
  }, [])

  // Fetch verses when selection changes
  useEffect(() => {
    const fetchVerses = async () => {
      if (!selectedBook || !chapter) {
        setVerses([])
        return
      }

      setIsLoading(true)
      setError('')
      try {
        let url = `/api/bible?book_id=${selectedBook.id}&chapter=${chapter}&translation=${translation}`
        if (verseStart) url += `&verse_start=${verseStart}`
        if (verseEnd) url += `&verse_end=${verseEnd}`

        const res = await fetch(url)
        const { data } = await res.json()
        
        if (!data || data.length === 0) {
          setError('Ayat tidak ditemukan. Pastikan data sudah di-import.')
          setVerses([])
        } else {
          setVerses(data)
        }
      } catch (err) {
        console.error('Error fetching verses:', err)
        setError('Gagal memuat ayat')
      } finally {
        setIsLoading(false)
      }
    }

    const timer = setTimeout(fetchVerses, 300)
    return () => clearTimeout(timer)
  }, [selectedBook, chapter, verseStart, verseEnd, translation])

  const handleConfirm = () => {
    if (!selectedBook || !chapter || verses.length === 0) return

    const content = verses.map(v => `${v.verse}. ${v.content}`).join(' ')
    
    onSelect({
      bookId: selectedBook.id,
      bookName: selectedBook.book_name,
      bookAbbr: selectedBook.book_abbr,
      chapter: parseInt(chapter),
      verseStart: verseStart ? parseInt(verseStart) : verses[0]?.verse || 1,
      verseEnd: verseEnd ? parseInt(verseEnd) : verses[verses.length - 1]?.verse || 1,
      translation,
      content
    })
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Book Selector */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Kitab
          </label>
          <select
            value={selectedBook?.id || ''}
            onChange={(e) => {
              const book = books.find(b => b.id === parseInt(e.target.value))
              setSelectedBook(book || null)
              setChapter('')
              setVerseStart('')
              setVerseEnd('')
            }}
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">Pilih Kitab</option>
            {books.map(book => (
              <option key={book.id} value={book.id}>
                {book.book_name}
              </option>
            ))}
          </select>
        </div>

        {/* Chapter Input */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Pasal
          </label>
          <input
            type="number"
            min="1"
            max={selectedBook?.total_chapters || 1}
            value={chapter}
            onChange={(e) => setChapter(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Verse Range */}
        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Ayat (dari)
          </label>
          <input
            type="number"
            min="1"
            value={verseStart}
            onChange={(e) => setVerseStart(e.target.value)}
            placeholder="1"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
            Sampai
          </label>
          <input
            type="number"
            min="1"
            value={verseEnd}
            onChange={(e) => setVerseEnd(e.target.value)}
            placeholder="5"
            className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-emerald-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Translation Selector */}
      <div className="flex items-center gap-4">
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Terjemahan:</span>
        {['TB', 'BIS', 'FAYH'].map(t => (
          <label key={t} className="flex items-center gap-1 cursor-pointer">
            <input
              type="radio"
              name="translation"
              value={t}
              checked={translation === t}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-3 h-3 text-emerald-600"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{t}</span>
          </label>
        ))}
      </div>

      {/* Preview & Error */}
      {isLoading && (
        <div className="text-center py-4 text-gray-500">
          <div className="animate-spin w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}

      {error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-700 dark:text-amber-300">
          {error}
        </div>
      )}

      {verses.length > 0 && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              {selectedBook?.book_name} {chapter}:{verseStart || verses[0]?.verse}-{verseEnd || verses[verses.length - 1]?.verse} ({translation})
            </span>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-3 py-1 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Pilih Ayat Ini
            </button>
          </div>
          <p className="text-sm text-emerald-700 dark:text-emerald-300 max-h-32 overflow-y-auto">
            {verses.map(v => `${v.verse}. ${v.content}`).join(' ')}
          </p>
        </div>
      )}
    </div>
  )
}
