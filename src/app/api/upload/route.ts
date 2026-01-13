import { NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

// Check if R2 is configured
const isR2Configured = !!(
  process.env.R2_ENDPOINT &&
  process.env.R2_ACCESS_KEY_ID &&
  process.env.R2_SECRET_ACCESS_KEY &&
  process.env.R2_BUCKET_NAME
)

const s3Client = isR2Configured ? new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
}) : null

export async function POST(request: Request) {
  try {
    // Check R2 configuration
    if (!isR2Configured || !s3Client) {
      console.error('R2 not configured. Missing env vars:', {
        R2_ENDPOINT: !!process.env.R2_ENDPOINT,
        R2_ACCESS_KEY_ID: !!process.env.R2_ACCESS_KEY_ID,
        R2_SECRET_ACCESS_KEY: !!process.env.R2_SECRET_ACCESS_KEY,
        R2_BUCKET_NAME: !!process.env.R2_BUCKET_NAME,
      })
      return NextResponse.json({ error: 'Storage not configured. Please check R2 environment variables.' }, { status: 500 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 })
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${folder}/${uuidv4()}.${ext}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Uploading to R2:', { bucket: process.env.R2_BUCKET_NAME, key: filename, size: file.size })

    // Upload to R2
    await s3Client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: filename,
        Body: buffer,
        ContentType: file.type,
      })
    )

    console.log('Upload successful:', filename)

    // Generate public URL - use R2_PUBLIC_URL if set, otherwise use API route
    const url = process.env.R2_PUBLIC_URL 
      ? `${process.env.R2_PUBLIC_URL}/${filename}`
      : `/api/images/${filename}`

    return NextResponse.json({ 
      url,
      filename,
      size: file.size,
      type: file.type 
    }, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: `Failed to upload: ${errorMessage}` }, { status: 500 })
  }
}

