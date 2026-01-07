import { NextRequest, NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('Authorization')?.split('Bearer ')[1]

    if (!token) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      )
    }

    // Verify Firebase token
    const decodedToken = await adminAuth.verifyIdToken(token)

    return NextResponse.json({
      success: true,
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
      },
    })
  } catch (error) {
    console.error('Token verification failed:', error)
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 }
    )
  }
}
