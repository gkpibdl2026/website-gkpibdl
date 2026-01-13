import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch photos for album
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabase
      .from('album_photos')
      .select('*')
      .eq('album_id', id)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching photos:', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}

// POST - Add photo(s) to album
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Support both single photo and array of photos
    const photos = Array.isArray(body) ? body : [body]
    
    const photosToInsert = photos.map((photo, index) => ({
      album_id: id,
      image_url: photo.image_url,
      caption: photo.caption || null,
      sort_order: photo.sort_order ?? index
    }))

    const { data, error } = await supabase
      .from('album_photos')
      .insert(photosToInsert)
      .select()

    if (error) throw error

    // Update cover image if album doesn't have one
    if (data && data.length > 0) {
      const { data: album } = await supabase
        .from('album')
        .select('cover_image')
        .eq('id', id)
        .single()

      if (!album?.cover_image) {
        await supabase
          .from('album')
          .update({ cover_image: data[0].image_url })
          .eq('id', id)
      }
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding photos:', error)
    return NextResponse.json({ error: 'Failed to add photos' }, { status: 500 })
  }
}

// DELETE - Remove photo from album
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: 'Photo ID required' }, { status: 400 })
    }

    const { error } = await supabase
      .from('album_photos')
      .delete()
      .eq('id', photoId)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting photo:', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
