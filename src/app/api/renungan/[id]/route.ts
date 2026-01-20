import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import type { Renungan } from '@/features/renungan';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET - Fetch single renungan by ID
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    
    const { data, error } = await supabaseAdmin
      .from('renungan')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    if (!data) {
      return NextResponse.json({ error: 'Renungan not found' }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error fetching renungan:', error);
    return NextResponse.json({ error: 'Failed to fetch renungan' }, { status: 500 });
  }
}

// PUT - Update renungan
export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData: Partial<Renungan> = {
      title: body.title,
      date: body.date,
      ayat_kunci: body.ayat_kunci,
      referensi: body.referensi,
      isi_renungan: body.isi_renungan,
      kutipan: body.kutipan || null,
      lagu: body.lagu || null,
      doa: body.doa || null,
      visible: body.visible ?? true,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin
      .from('renungan')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error updating renungan:', error);
    return NextResponse.json({ error: 'Failed to update renungan' }, { status: 500 });
  }
}

// DELETE - Delete renungan
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    const { error } = await supabaseAdmin
      .from('renungan')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ message: 'Renungan deleted successfully' });
  } catch (error) {
    console.error('Error deleting renungan:', error);
    return NextResponse.json({ error: 'Failed to delete renungan' }, { status: 500 });
  }
}
