import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// GET - Fetch today's renungan
export async function GET() {
  try {
    // Calculate today in WIB (UTC+7)
    const now = new Date();
    const WIB_OFFSET = 7 * 60 * 60 * 1000;
    const wibDate = new Date(now.getTime() + WIB_OFFSET);
    const today = wibDate.toISOString().split('T')[0];
    
    // Try to get renungan for today
    const result = await supabaseAdmin
      .from('renungan')
      .select('*')
      .eq('date', today)
      .eq('visible', true)
      .single();
    
    let data = result.data;
    const error = result.error;

    let isToday = true;

    // If no renungan for today, get the latest one
    if (!data || error) {
      isToday = false;
      const { data: latestData, error: latestError } = await supabaseAdmin
        .from('renungan')
        .select('*')
        .eq('visible', true)
        .order('date', { ascending: false })
        .limit(1)
        .single();

      if (latestError && latestError.code !== 'PGRST116') {
        throw latestError;
      }

      data = latestData;
    }

    // Return null if no renungan found
    if (!data) {
      return NextResponse.json({ data: null, is_today: false });
    }

    return NextResponse.json({ data, is_today: isToday });
  } catch (error) {
    console.error('Error fetching today renungan:', error);
    return NextResponse.json({ error: 'Failed to fetch renungan' }, { status: 500 });
  }
}
