import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Send email to admin
    const { error } = await resend.emails.send({
      from: 'Website GKPI <onboarding@resend.dev>', // Change after domain verification
      to: ['info@gkpibdl.org'], // Admin email
      subject: `[Kontak Website] ${subject}`,
      html: `
        <h2>Pesan dari Website</h2>
        <p><strong>Nama:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subjek:</strong> ${subject}</p>
        <hr />
        <p><strong>Pesan:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      replyTo: email,
    })

    if (error) {
      console.error('Resend error:', error)
      throw error
    }

    return NextResponse.json({ message: 'Email sent successfully' })
  } catch (error) {
    console.error('Error sending email:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}
