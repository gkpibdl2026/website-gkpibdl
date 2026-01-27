import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import WartaPublicViewer from '@/features/warta/components/WartaPublicViewer'

interface Props {
  params: Promise<{ id: string }>
}

// 1. Dynamic Metadata Generator (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  
  const { data: warta } = await supabaseAdmin
    .from('warta')
    .select('title, date, minggu_name, image_url, published')
    .eq('id', id)
    .single()

  if (!warta || !warta.published) {
    return {
      title: 'Warta Tidak Ditemukan',
    }
  }

  const title = `Warta Jemaat: ${warta.title}`
  const description = `Warta Jemaat GKPI Bandar Lampung - ${warta.minggu_name}, ${new Date(warta.date).toLocaleDateString('id-ID', { dateStyle: 'long' })}`

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      type: 'article',
      images: warta.image_url ? [warta.image_url] : ['/logo-gkpi.png'],
    },
  }
}

// 2. Server Component (Data Fetching)
export default async function WartaDetailPage({ params }: Props) {
  const { id } = await params

  // Direct DB call (Faster than fetch API)
  const { data: warta, error } = await supabaseAdmin
    .from('warta')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !warta || !warta.published) {
    notFound()
  }

  return (
    <WartaPublicViewer 
      warta={{
        id: warta.id,
        title: warta.title,
        date: warta.date,
        minggu_name: warta.minggu_name,
        modules: warta.modules || [] // Ensure modules is never null
      }}
    />
  )
}
