import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch single album with photos
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch album
    const { data: album, error: albumError } = await supabase
      .from('album')
      .select('*')
      .eq('id', id)
      .single()

    if (albumError) throw albumError

    // Fetch photos
    const { data: photos, error: photosError } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', id)
      .order('sort_order', { ascending: true })

    if (photosError) throw photosError

    return NextResponse.json({ ...album, photos })
  } catch (error) {
    console.error('Error fetching album:', error)
    return NextResponse.json({ error: 'Failed to fetch album' }, { status: 500 })
  }
}

// PUT - Update album
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, description, cover_image, category, event_date, active } = body

    const { data, error } = await supabase
      .from('album')
      .update({ 
        title, 
        description, 
        cover_image, 
        category, 
        event_date,
        active: active ?? true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating album:', error)
    return NextResponse.json({ error: 'Failed to update album' }, { status: 500 })
  }
}

// DELETE - Delete album (cascade deletes photos)
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabase
      .from('album')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting album:', error)
    return NextResponse.json({ error: 'Failed to delete album' }, { status: 500 })
  }
}
