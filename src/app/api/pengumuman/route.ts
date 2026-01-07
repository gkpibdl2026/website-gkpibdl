import { NextResponse } from 'next/server'
import { supabaseAdmin, type Pengumuman } from '@/lib/supabase'

// GET - Fetch all pengumuman
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const visible = searchParams.get('visible')

    let query = supabaseAdmin
      .from('pengumuman')
      .select('*')
      .order('created_at', { ascending: false })

    if (visible === 'true') {
      query = query.eq('visible', true)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching pengumuman:', error)
    return NextResponse.json({ error: 'Failed to fetch pengumuman' }, { status: 500 })
  }
}

// POST - Create new pengumuman
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newPengumuman: Partial<Pengumuman> = {
      title: body.title,
      content: body.content,
      priority: body.priority || 'normal',
      visible: body.visible ?? true,
      expires_at: body.expires_at || null,
    }

    const { data, error } = await supabaseAdmin
      .from('pengumuman')
      .insert(newPengumuman)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating pengumuman:', error)
    return NextResponse.json({ error: 'Failed to create pengumuman' }, { status: 500 })
  }
}
