import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Fetch single pengumuman
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('pengumuman')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching pengumuman:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT - Update pengumuman
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('pengumuman')
      .update({
        title: body.title,
        content: body.content,
        priority: body.priority,
        visible: body.visible,
        expires_at: body.expires_at || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating pengumuman:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete pengumuman
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('pengumuman')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting pengumuman:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
