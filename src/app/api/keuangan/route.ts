import { NextResponse } from 'next/server'
import { supabaseAdmin, type Keuangan } from '@/lib/supabase'

// GET - Fetch all keuangan
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('keuangan')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching keuangan:', error)
    return NextResponse.json({ error: 'Failed to fetch keuangan' }, { status: 500 })
  }
}

// POST - Create new keuangan
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newKeuangan: Partial<Keuangan> = {
      title: body.title,
      period: body.period,
      description: body.description || null,
      document_url: body.document_url || null,
      pemasukan: body.pemasukan || 0,
      pengeluaran: body.pengeluaran || 0,
      saldo: body.saldo || 0,
    }

    const { data, error } = await supabaseAdmin
      .from('keuangan')
      .insert(newKeuangan)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating keuangan:', error)
    return NextResponse.json({ error: 'Failed to create keuangan' }, { status: 500 })
  }
}
