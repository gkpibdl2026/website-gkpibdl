import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Renungan } from '@/features/renungan';

// GET - Fetch all renungan
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const visible = searchParams.get('visible');
    const limit = searchParams.get('limit');
    const source = searchParams.get('source');

    let query = supabaseAdmin
      .from('renungan')
      .select('*')
      .order('date', { ascending: false });

    if (visible === 'true') {
      query = query.eq('visible', true);
    }

    if (source) {
      query = query.eq('source', source);
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching renungan:', error);
    return NextResponse.json({ error: 'Failed to fetch renungan' }, { status: 500 });
  }
}

// POST - Create new renungan
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const newRenungan: Partial<Renungan> = {
      title: body.title,
      date: body.date,
      ayat_kunci: body.ayat_kunci,
      referensi: body.referensi,
      isi_renungan: body.isi_renungan,
      kutipan: body.kutipan || null,
      lagu: body.lagu || null,
      doa: body.doa || null,
      source: body.source || 'manual',
      source_url: body.source_url || null,
      visible: body.visible ?? true,
    };

    const { data, error } = await supabaseAdmin
      .from('renungan')
      .insert(newRenungan)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error('Error creating renungan:', error);
    return NextResponse.json({ error: 'Failed to create renungan' }, { status: 500 });
  }
}
