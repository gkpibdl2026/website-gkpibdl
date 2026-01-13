import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const bookId = searchParams.get('book_id')
    const chapter = searchParams.get('chapter')
    const verseStart = searchParams.get('verse_start')
    const verseEnd = searchParams.get('verse_end')
    const translation = searchParams.get('translation') || 'TB'

    // If no specific query, return list of available books
    if (!bookId) {
      const { data: books, error } = await supabaseAdmin
        .from('bible_books')
        .select('id, book_name, book_abbr, testament, book_order, total_chapters')
        .order('book_order', { ascending: true })

      if (error) throw error
      return NextResponse.json({ data: books })
    }

    // Build query for verses
    let query = supabaseAdmin
      .from('bible_verses')
      .select('*')
      .eq('book_id', bookId)
      .eq('translation', translation.toUpperCase())
      .order('verse', { ascending: true })

    if (chapter) {
      query = query.eq('chapter', parseInt(chapter))
    }

    if (verseStart) {
      query = query.gte('verse', parseInt(verseStart))
    }

    if (verseEnd) {
      query = query.lte('verse', parseInt(verseEnd))
    }

    const { data: verses, error } = await query

    if (error) throw error

    return NextResponse.json({ data: verses })
  } catch (error) {
    console.error('Error fetching verses:', error)
    return NextResponse.json({ error: 'Failed to fetch verses' }, { status: 500 })
  }
}
