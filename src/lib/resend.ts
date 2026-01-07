import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY)

// Helper function untuk kirim email
export async function sendEmail({
  to,
  subject,
  html,
  from = 'noreply@yourdomain.com', // Ganti dengan domain kamu
}: {
  to: string | string[]
  subject: string
  html: string
  from?: string
}) {
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}
