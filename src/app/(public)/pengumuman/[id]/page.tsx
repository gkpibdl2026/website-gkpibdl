import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import PengumumanViewer from './PengumumanViewer'

interface Props {
  params: Promise<{ id: string }>
}

// Dynamic Metadata Generator (SEO)
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  const { data: pengumuman } = await supabaseAdmin
    .from('pengumuman')
    .select('title, content, priority, image_urls')
    .eq('id', id)
    .single()

  if (!pengumuman) {
    return {
      title: 'Pengumuman Tidak Ditemukan | GKPI Bandar Lampung',
    }
  }

  // Priority emoji prefix
  const priorityPrefix = pengumuman.priority === 'urgent' ? '🔴 '
    : pengumuman.priority === 'important' ? '🟡 '
    : ''

  // Get first 160 chars of content for description
  const description = pengumuman.content
    .substring(0, 160)
    .replace(/\n/g, ' ')
    .trim() + '...'

  const title = `${priorityPrefix}${pengumuman.title} | GKPI Bandar Lampung`

  return {
    title: title,
    description: description,
    openGraph: {
      title: `${priorityPrefix}${pengumuman.title}`,
      description: description,
      type: 'article',
      // Gunakan gambar pertama jika ada, fallback ke logo
      images: [pengumuman.image_urls?.[0] || '/logo-gkpi.png'],
    },
  }
}

// Server Component (Data Fetching)
export default async function PengumumanDetailPage({ params }: Props) {
  const { id } = await params

  const { data: pengumuman, error } = await supabaseAdmin
    .from('pengumuman')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !pengumuman) {
    notFound()
  }

  return (
    <PengumumanViewer
      pengumuman={{
        id: pengumuman.id,
        title: pengumuman.title,
        content: pengumuman.content,
        priority: pengumuman.priority,
        image_urls: pengumuman.image_urls || [],
        created_at: pengumuman.created_at,
      }}
    />
  )
}
