import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Fetch single jadwal
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('jadwal_ibadah')
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
    console.error('Error fetching jadwal:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT - Update jadwal
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('jadwal_ibadah')
      .update({
        name: body.name,
        day: body.day,
        time: body.time,
        location: body.location,
        description: body.description,
        active: body.active,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating jadwal:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete jadwal
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('jadwal_ibadah')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting jadwal:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
