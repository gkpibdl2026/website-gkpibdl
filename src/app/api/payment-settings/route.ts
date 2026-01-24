import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const SETTINGS_ID = '00000000-0000-0000-0000-000000000001'

// GET /api/payment-settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('payment_settings')
      .select('*')
      .eq('id', SETTINGS_ID)
      .single()

    if (error) {
      // If no data, return default structure
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          qris_image_url: null,
          bank_accounts: []
        })
      }
      throw error
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment settings' },
      { status: 500 }
    )
  }
}

// PUT /api/payment-settings
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    const { qris_image_url, bank_accounts } = body

    // Upsert the settings
    const { data, error } = await supabaseAdmin
      .from('payment_settings')
      .upsert({
        id: SETTINGS_ID,
        qris_image_url,
        bank_accounts
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating payment settings:', error)
    return NextResponse.json(
      { error: 'Failed to update payment settings' },
      { status: 500 }
    )
  }
}
