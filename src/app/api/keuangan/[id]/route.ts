import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

interface Params {
  params: Promise<{ id: string }>
}

// GET - Fetch single keuangan
export async function GET(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('keuangan')
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
    console.error('Error fetching keuangan:', error)
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
  }
}

// PUT - Update keuangan
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params
    const body = await request.json()

    const { data, error } = await supabaseAdmin
      .from('keuangan')
      .update({
        title: body.title,
        period: body.period,
        description: body.description,
        document_url: body.document_url,
        pemasukan: body.pemasukan,
        pengeluaran: body.pengeluaran,
        saldo: body.saldo,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error updating keuangan:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE - Delete keuangan
export async function DELETE(request: Request, { params }: Params) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('keuangan')
      .delete()
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ message: 'Deleted successfully' })
  } catch (error) {
    console.error('Error deleting keuangan:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
