import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import RenunganViewer from './RenunganViewer'

interface Props {
  params: Promise<{ id: string }>
}

// Dynamic Metadata Generator (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  const { data: renungan } = await supabaseAdmin
    .from('renungan')
    .select('title, date, referensi, isi_renungan')
    .eq('id', id)
    .single()

  if (!renungan) {
    return {
      title: 'Renungan Tidak Ditemukan | GKPI Bandar Lampung',
    }
  }

  const formattedDate = new Date(renungan.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  // Get first 160 chars of content for description
  const description = renungan.isi_renungan 
    ? renungan.isi_renungan.substring(0, 160).replace(/\n/g, ' ').trim() + '...'
    : `Renungan Harian - ${renungan.referensi}`

  const title = `📖 ${renungan.title} | Renungan ${formattedDate}`

  return {
    title: title,
    description: description,
    openGraph: {
      title: `📖 Renungan: ${renungan.title}`,
      description: description,
      type: 'article',
      images: ['/logo-gkpi.png'],
    },
  }
}

// Server Component (Data Fetching)
export default async function RenunganDetailPage({ params }: Props) {
  const { id } = await params

  const { data: renungan, error } = await supabaseAdmin
    .from('renungan')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !renungan) {
    notFound()
  }

  return (
    <RenunganViewer 
      renungan={{
        id: renungan.id,
        title: renungan.title,
        date: renungan.date,
        ayat_kunci: renungan.ayat_kunci,
        referensi: renungan.referensi,
        isi_renungan: renungan.isi_renungan,
        lagu: renungan.lagu,
        doa: renungan.doa,
        source: renungan.source,
        source_url: renungan.source_url
      }}
    />
  )
}
