'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface BreadcrumbItem {
  label: string
  href?: string
}

const pathLabels: Record<string, string> = {
  admin: 'Dashboard',
  warta: 'Warta',
  pengumuman: 'Pengumuman',
  keuangan: 'Keuangan',
  jadwal: 'Jadwal',
  struktur: 'Struktur Organisasi',
  galeri: 'Galeri',
  album: 'Album',
  new: 'Tambah Baru',
  edit: 'Edit',
}

export function Breadcrumb() {
  const pathname = usePathname()
  
  // Don't show breadcrumb on main dashboard
  if (pathname === '/admin') return null
  
  const segments = pathname.split('/').filter(Boolean)
  
  const items: BreadcrumbItem[] = segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const isLast = index === segments.length - 1
    
    // Check if segment is a UUID or number (for dynamic routes)
    const isId = /^[0-9a-fA-F-]{8,}$/.test(segment) || !isNaN(Number(segment))
    
    let label = pathLabels[segment] || segment
    if (isId) {
      label = 'Detail'
    }
    
    return {
      label,
      href: isLast ? undefined : href,
    }
  })

  return (
    <nav className="flex items-center gap-2 text-sm mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && (
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          {item.href ? (
            <Link 
              href={item.href} 
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
