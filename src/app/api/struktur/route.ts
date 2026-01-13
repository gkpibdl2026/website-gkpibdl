import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all struktur organisasi
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('struktur_organisasi')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching struktur:', error)
    return NextResponse.json({ error: 'Failed to fetch struktur organisasi' }, { status: 500 })
  }
}

// POST - Create new struktur
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, position, image_url, description, sort_order } = body

    const { data, error } = await supabase
      .from('struktur_organisasi')
      .insert([{ name, position, image_url, description, sort_order }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating struktur:', error)
    return NextResponse.json({ error: 'Failed to create struktur' }, { status: 500 })
  }
}
