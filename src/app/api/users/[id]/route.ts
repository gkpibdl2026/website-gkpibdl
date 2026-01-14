import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { adminAuth } from '@/lib/firebase-admin'

type RouteParams = { params: Promise<{ id: string }> }

// Helper to verify admin access
async function verifyAdminAccess(request: NextRequest) {
  const token = request.headers.get('Authorization')?.split('Bearer ')[1]

  if (!token) {
    return { error: 'Authorization token required', status: 401 }
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token)
    
    const { data: requestingUser } = await supabaseAdmin
      .from('users')
      .select('role, approved')
      .eq('firebase_uid', decodedToken.uid)
      .single()

    if (!requestingUser || requestingUser.role !== 'admin' || !requestingUser.approved) {
      return { error: 'Admin access required', status: 403 }
    }

    return { success: true, uid: decodedToken.uid }
  } catch {
    return { error: 'Invalid token', status: 401 }
  }
}

// PUT - Update user profile, role and approval status
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authResult = await verifyAdminAccess(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { role, approved, first_name, last_name, whatsapp, lingkungan, alamat, password } = body

    // Validate role
    if (role && !['admin', 'editor', 'jemaat'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be admin, editor, or jemaat' },
        { status: 400 }
      )
    }

    // Validate lingkungan (must be integer if provided)
    if (lingkungan !== undefined && lingkungan !== null && !Number.isInteger(lingkungan)) {
      return NextResponse.json(
        { error: 'Lingkungan must be an integer' },
        { status: 400 }
      )
    }

    // Format WhatsApp number
    let formattedWhatsapp = whatsapp
    if (whatsapp) {
      // Remove all non-digit characters except +
      formattedWhatsapp = whatsapp.replace(/[^\d+]/g, '')
      // Convert leading 0 to +62
      if (formattedWhatsapp.startsWith('0')) {
        formattedWhatsapp = '+62' + formattedWhatsapp.slice(1)
      }
      // Ensure it starts with +
      if (!formattedWhatsapp.startsWith('+')) {
        formattedWhatsapp = '+' + formattedWhatsapp
      }
    }

    // Build update object for Supabase
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString()
    }

    if (role !== undefined) updateData.role = role
    if (approved !== undefined) updateData.approved = approved
    if (first_name !== undefined) updateData.first_name = first_name
    if (last_name !== undefined) updateData.last_name = last_name
    if (formattedWhatsapp !== undefined) updateData.whatsapp = formattedWhatsapp
    if (lingkungan !== undefined) updateData.lingkungan = lingkungan
    if (alamat !== undefined) updateData.alamat = alamat

    // Handle password update via Firebase Admin
    if (password && password.length >= 6) {
      // Get user's firebase_uid first
      const { data: userData } = await supabaseAdmin
        .from('users')
        .select('firebase_uid')
        .eq('id', id)
        .single()

      if (userData?.firebase_uid) {
        try {
          await adminAuth.updateUser(userData.firebase_uid, {
            password: password
          })
          updateData.has_password = true
        } catch (firebaseError) {
          console.error('Error updating Firebase password:', firebaseError)
          return NextResponse.json(
            { error: 'Failed to update password' },
            { status: 500 }
          )
        }
      }
    }

    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating user:', error)
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
    }

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Error in PUT /api/users/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE - Remove user from database
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResult = await verifyAdminAccess(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/users/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
