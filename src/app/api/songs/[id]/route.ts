import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params
    
    const { data, error } = await supabaseAdmin
      .from('songs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
       if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching song:', error)
    return NextResponse.json({ error: 'Failed to fetch song' }, { status: 500 })
  }
}


export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    // Validate if song exists
    const { error: findError } = await supabaseAdmin
      .from('songs')
      .select('id')
      .eq('id', id)
      .single()

    if (findError) {
      if (findError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Song not found' }, { status: 404 })
      }
      throw findError
    }

    const { data, error } = await supabaseAdmin
      .from('songs')
      .update({
        title: body.title,
        song_number: body.song_number,
        category: body.category,
        lyrics: body.lyrics,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating song:', error)
    return NextResponse.json({ error: 'Failed to update song' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('songs')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Song deleted successfully' })
  } catch (error) {
    console.error('Error deleting song:', error)
    return NextResponse.json({ error: 'Failed to delete song' }, { status: 500 })
  }
}
