import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch all galeri with optional category filter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')

    let query = supabase
      .from('galeri')
      .select('*')
      .eq('active', true)
      .order('event_date', { ascending: false, nullsFirst: false })

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching galeri:', error)
    return NextResponse.json({ error: 'Failed to fetch galeri' }, { status: 500 })
  }
}

// POST - Create new galeri item
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, image_url, category, description, event_date } = body

    const { data, error } = await supabase
      .from('galeri')
      .insert([{ title, image_url, category, description, event_date }])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating galeri:', error)
    return NextResponse.json({ error: 'Failed to create galeri' }, { status: 500 })
  }
}
