import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { adminAuth } from '@/lib/firebase-admin'

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

// GET - Fetch all users (admin only)
export async function GET(request: NextRequest) {
  const authResult = await verifyAdminAccess(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    // Fetch all users with new profile fields
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, name, google_name, role, approved, created_at, updated_at, first_name, last_name, whatsapp, lingkungan, alamat, has_password')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in GET /api/users:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST - Create user (admin) or Sync Google user (login)
export async function POST(request: NextRequest) {
  let body: any = null
  try {
    body = await request.json()
  } catch {
    // Body is empty or invalid JSON, likely a sync request
  }

  // Check if it's a create action
  if (body && body.action === 'create') {
    return handleCreateUser(request, body)
  }

  // Otherwise, handle sync
  return handleSyncUser(request, body)
}

// Handle Admin Creating New User
async function handleCreateUser(request: NextRequest, body: any) {
  const authResult = await verifyAdminAccess(request)
  if ('error' in authResult) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status })
  }

  try {
    const { email, password, first_name, last_name, whatsapp, lingkungan, alamat, role, approved } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // 1. Create user in Firebase Auth
    const displayName = `${first_name || ''} ${last_name || ''}`.trim() || email.split('@')[0]
    
    let firebaseUser
    try {
      firebaseUser = await adminAuth.createUser({
        email,
        password,
        displayName,
        emailVerified: true // Auto verify since admin created it
      })
    } catch (error: any) {
      if (error.code === 'auth/email-already-exists') {
        return NextResponse.json({ error: 'Email is already being used' }, { status: 409 }) // Conflict
      }
      if (error.code === 'auth/invalid-password') {
        return NextResponse.json({ error: 'Password is too weak (min 6 characters)' }, { status: 400 })
      }
      console.error('Firebase create error:', error)
      return NextResponse.json({ error: error.message || 'Failed to create Firebase user' }, { status: 500 })
    }

    // 2. Format WhatsApp if provided
    let formattedWhatsapp = whatsapp
    if (whatsapp) {
      formattedWhatsapp = whatsapp.replace(/[^\d+]/g, '')
      if (formattedWhatsapp.startsWith('0')) {
        formattedWhatsapp = '+62' + formattedWhatsapp.slice(1)
      }
      if (!formattedWhatsapp.startsWith('+')) {
        formattedWhatsapp = '+' + formattedWhatsapp
      }
    }

    // 3. Create user in Supabase
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        firebase_uid: firebaseUser.uid,
        email: email,
        name: displayName,
        google_name: displayName,
        first_name: first_name || null,
        last_name: last_name || null,
        whatsapp: formattedWhatsapp || null,
        lingkungan: lingkungan || null,
        alamat: alamat || null,
        role: role || 'jemaat', // Default to jemaat if not specified
        approved: approved !== undefined ? approved : true, // Default to approved since admin created it
        has_password: true
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user in Supabase:', insertError)
      // Rollback Firebase user deletion would be ideal here if strict transaction needed
      // await adminAuth.deleteUser(firebaseUser.uid)
      return NextResponse.json({ error: 'Failed to create user record' }, { status: 500 })
    }

    return NextResponse.json({ user: newUser, message: 'User created successfully' })

  } catch (error) {
    console.error('Error in handleCreateUser:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// Handle Sync (Login)
async function handleSyncUser(request: NextRequest, body: any) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 })
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token)
    const { uid, email, name } = decodedToken
    const displayName = name || email?.split('@')[0] || 'User'

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (existingUser) {
      // Update firebase_uid if needed (e.g. from seed)
      if (existingUser.firebase_uid.startsWith('seed_')) {
        const { data: updatedUser } = await supabaseAdmin
          .from('users')
          .update({
            firebase_uid: uid,
            google_name: displayName,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUser.id)
          .select()
          .single()
        return NextResponse.json({ user: updatedUser, isNew: false })
      }
      
      // Minimal update of name if missing
      if (!existingUser.google_name) {
        await supabaseAdmin.from('users').update({ google_name: displayName }).eq('id', existingUser.id)
      }
      
      return NextResponse.json({ user: existingUser, isNew: false })
    }

    // Check by firebase_uid
    const { data: existingUserByUid } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('firebase_uid', uid)
      .single()

    if (existingUserByUid) {
      return NextResponse.json({ user: existingUserByUid, isNew: false })
    }

    // Create new jemaat (unapproved)
    const { data: newUser, error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        firebase_uid: uid,
        email: email,
        name: displayName,
        google_name: displayName,
        role: 'jemaat',
        approved: false
      })
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user:', insertError)
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
    }

    return NextResponse.json({ user: newUser, isNew: true })
  } catch (error) {
    console.error('Error in handleSyncUser:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
