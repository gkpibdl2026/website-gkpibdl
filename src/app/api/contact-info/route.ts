import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

// GET /api/contact-info - Ambil data kontak publik
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('contact_info')
      .select('*')
      .limit(1)
      .single()

    if (error) {
      // Jika tabel belum ada / belum ada data, kembalikan default
      if (error.code === 'PGRST116' || error.code === '42P01') {
        return NextResponse.json({
          data: {
            id: null,
            address_line1: 'Jl. Turi Raya No.40',
            address_line2: 'Tj. Senang, Kec. Tj. Senang',
            address_line3: 'Kota Bandar Lampung, Lampung 35141',
            phone: '+62 812-3456-7890',
            phone_name: 'Sekretariat Gereja',
            phone_hours: 'Senin - Sabtu, 08.00 - 16.00 WIB',
            email: 'info@gkpibdl.org',
            facebook_url: 'https://facebook.com/gkpibandarlampung',
            instagram_url: 'https://instagram.com/gkpibandarlampung',
            youtube_url: 'https://youtube.com/@gkpibandarlampung',
            maps_embed_url: '',
          }
        })
      }
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json({ error: 'Gagal mengambil data kontak' }, { status: 500 })
  }
}

// PUT /api/contact-info - Update data kontak (admin only)
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      id,
      address_line1,
      address_line2,
      address_line3,
      phone,
      phone_name,
      phone_hours,
      email,
      facebook_url,
      instagram_url,
      youtube_url,
      maps_embed_url,
    } = body

    // Validasi field wajib
    if (!address_line1 || !phone || !email) {
      return NextResponse.json(
        { error: 'Alamat, telepon, dan email wajib diisi' },
        { status: 400 }
      )
    }

    const updateData = {
      address_line1,
      address_line2: address_line2 || '',
      address_line3: address_line3 || '',
      phone,
      phone_name: phone_name || '',
      phone_hours: phone_hours || '',
      email,
      facebook_url: facebook_url || '',
      instagram_url: instagram_url || '',
      youtube_url: youtube_url || '',
      maps_embed_url: maps_embed_url || '',
      updated_at: new Date().toISOString(),
    }

    let data, error

    if (id) {
      // Update existing record
      ;({ data, error } = await supabaseAdmin
        .from('contact_info')
        .update(updateData)
        .eq('id', id)
        .select()
        .single())
    } else {
      // Insert new record (first time setup)
      ;({ data, error } = await supabaseAdmin
        .from('contact_info')
        .insert(updateData)
        .select()
        .single())
    }

    if (error) throw error

    return NextResponse.json({ data, message: 'Informasi kontak berhasil diperbarui' })
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json({ error: 'Gagal memperbarui data kontak' }, { status: 500 })
  }
}
