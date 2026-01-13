import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch single struktur
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { data, error } = await supabase
      .from('struktur_organisasi')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching struktur:', error)
    return NextResponse.json({ error: 'Failed to fetch struktur' }, { status: 500 })
  }
}

// PUT - Update struktur
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, position, image_url, description, sort_order, active } = body

    const { data, error } = await supabase
      .from('struktur_organisasi')
      .update({ name, position, image_url, description, sort_order, active, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating struktur:', error)
    return NextResponse.json({ error: 'Failed to update struktur' }, { status: 500 })
  }
}

// DELETE - Delete struktur
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { error } = await supabase
      .from('struktur_organisasi')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting struktur:', error)
    return NextResponse.json({ error: 'Failed to delete struktur' }, { status: 500 })
  }
}
