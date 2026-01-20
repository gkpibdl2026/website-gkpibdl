import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE - Delete all renungan
export async function DELETE() {
  try {
    const { error } = await supabaseAdmin
      .from('renungan')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) throw error;

    return NextResponse.json({ message: 'All renungan deleted successfully' });
  } catch (error) {
    console.error('Error deleting all renungan:', error);
    return NextResponse.json(
      { error: 'Failed to delete all renungan' },
      { status: 500 }
    );
  }
}
