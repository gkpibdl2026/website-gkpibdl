import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Fetch single warta by ID
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('warta')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Warta not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching warta:', error)
    return NextResponse.json({ error: 'Failed to fetch warta' }, { status: 500 })
  }
}

// PUT - Update warta
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('warta')
      .update({
        title: body.title,
        content: body.content,
        excerpt: body.excerpt,
        image_url: body.image_url,
        published: body.published,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating warta:', error)
    return NextResponse.json({ error: 'Failed to update warta' }, { status: 500 })
  }
}

// DELETE - Delete warta
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('warta')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Warta deleted successfully' })
  } catch (error) {
    console.error('Error deleting warta:', error)
    return NextResponse.json({ error: 'Failed to delete warta' }, { status: 500 })
  }
}
