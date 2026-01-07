import { NextResponse } from 'next/server'
import { supabaseAdmin, type Warta } from '@/lib/supabase'

// GET - Fetch all warta
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get('published')
    const limit = searchParams.get('limit')

    let query = supabaseAdmin
      .from('warta')
      .select('*')
      .order('created_at', { ascending: false })

    if (published === 'true') {
      query = query.eq('published', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching warta:', error)
    return NextResponse.json({ error: 'Failed to fetch warta' }, { status: 500 })
  }
}

// POST - Create new warta
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      + '-' + Date.now()

    const newWarta: Partial<Warta> = {
      title: body.title,
      slug,
      content: body.content,
      excerpt: body.excerpt || null,
      image_url: body.image_url || null,
      published: body.published || false,
    }

    const { data, error } = await supabaseAdmin
      .from('warta')
      .insert(newWarta)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating warta:', error)
    return NextResponse.json({ error: 'Failed to create warta' }, { status: 500 })
  }
}
