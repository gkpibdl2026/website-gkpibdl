import { NextResponse } from 'next/server'
import { supabaseAdmin, type JadwalIbadah } from '@/lib/supabase'

// GET - Fetch all jadwal ibadah
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const limit = searchParams.get('limit')

    let query = supabaseAdmin
      .from('jadwal_ibadah')
      .select('*')
      .order('sort_order', { ascending: true })

    if (active === 'true') {
      query = query.eq('active', true)
    }

    if (limit) {
      query = query.limit(parseInt(limit))
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching jadwal:', error)
    return NextResponse.json({ error: 'Failed to fetch jadwal' }, { status: 500 })
  }
}

// POST - Create new jadwal
export async function POST(request: Request) {
  try {
    const body = await request.json()

    const newJadwal: Partial<JadwalIbadah> = {
      name: body.name,
      day: body.day,
      time: body.time,
      location: body.location || null,
      description: body.description || null,
      active: body.active ?? true,
      sort_order: body.sort_order || 0,
    }

    const { data, error } = await supabaseAdmin
      .from('jadwal_ibadah')
      .insert(newJadwal)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Error creating jadwal:', error)
    return NextResponse.json({ error: 'Failed to create jadwal' }, { status: 500 })
  }
}
