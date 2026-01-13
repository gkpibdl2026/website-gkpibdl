import { NextResponse } from 'next/server'
import { supabaseAdmin, type Song } from '@/lib/supabase'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const query = searchParams.get('query')

    let dbQuery = supabaseAdmin
      .from('songs')
      .select('*')
      .order('created_at', { ascending: false })

    if (category) {
      dbQuery = dbQuery.eq('category', category)
    }

    if (query) {
      // Search by title OR song_number (e.g., "1" or "Haleluya")
      dbQuery = dbQuery.or(`title.ilike.%${query}%,song_number.ilike.%${query}%`)
    }

    const { data, error } = await dbQuery

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    const newSong: Partial<Song> = {
      title: body.title,
      song_number: body.song_number,
      category: body.category,
      lyrics: body.lyrics || [],
    }

    const { data, error } = await supabaseAdmin
      .from('songs')
      .insert(newSong)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating song:', error)
    return NextResponse.json({ error: 'Failed to create song' }, { status: 500 })
  }
}
