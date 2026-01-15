'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/warta', label: 'Warta' },
  { href: '/jadwal', label: 'Jadwal' },
  { href: '/keuangan', label: 'Keuangan' },
  { href: '/pengumuman', label: 'Pengumuman' },
  { href: '/kontak', label: 'Kontak' },
]

export function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 backdrop-blur-lg ${
        scrolled 
          ? 'bg-(--bg-primary)/95 shadow-md' 
          : 'bg-(--bg-primary)/80'
      }`}
    >
      <nav className="mx-auto px-4 md:px-8 xl:px-16">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <Image 
              src="https://upload.wikimedia.org/wikipedia/commons/2/29/Logo_GKPI.png" 
              alt="Logo GKPI"
              width={48}
              height={48}
              className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-contain shadow-lg bg-white p-0.5"
              unoptimized
            />
            <div>
              <p className="font-bold text-(--text-primary) text-sm lg:text-base leading-tight">GKPI</p>
              <p className="text-xs lg:text-sm text-(--text-secondary)">Bandar Lampung</p>
            </div>
          </Link>

          {/* Desktop Navigation - Aligned Right */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  pathname === item.href
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-(--text-primary) hover:text-blue-600 hover:bg-(--bg-secondary)'
                }`}
              >
                {item.label}
              </Link>
            ))}
            
            {/* Theme Toggle */}
            <div className="ml-2 border-l border-(--border) pl-2">
              <ThemeToggle />
            </div>
          </div>

          {/* Mobile Menu Button & Theme Toggle */}
          <div className="lg:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-(--bg-secondary) transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6 text-(--text-primary)"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div 
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isOpen ? 'max-h-96 pb-4' : 'max-h-0'
          }`}
        >
          <div className="pt-2 border-t border-(--border)">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-blue-600/10 text-blue-600'
                    : 'text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-secondary)'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </header>
  )
}
