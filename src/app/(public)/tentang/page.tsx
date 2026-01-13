'use client'

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

interface StrukturOrganisasi {
  id: string
  name: string
  position: string
  image_url: string | null
  description: string | null
}

interface Album {
  id: string
  title: string
  description: string | null
  cover_image: string | null
  category: string
  event_date: string | null
  photo_count: number
}

interface AlbumPhoto {
  id: string
  album_id: string
  image_url: string
  caption: string | null
  sort_order: number
}

const categories = [
  { value: 'all', label: 'Semua' },
  { value: 'ibadah', label: 'Ibadah' },
  { value: 'persekutuan', label: 'Persekutuan' },
  { value: 'pelayanan', label: 'Pelayanan' },
  { value: 'sosial', label: 'Kegiatan Sosial' },
]

// Helper function to ensure image URL is valid
const getImageUrl = (url: string | null): string => {
  if (!url) return ''
  
  // If it's a data URL or full HTTP URL, return as-is
  if (url.startsWith('data:') || url.startsWith('http')) {
    return url
  }
  
  // If already using the API images route, return as-is
  if (url.startsWith('/api/images/')) {
    return url
  }
  
  // Remove leading slash if present
  const cleanPath = url.startsWith('/') ? url.slice(1) : url
  
  // Add /api/images/ prefix
  return `/api/images/${cleanPath}`
}

export default function TentangKamiPage() {
  const [struktur, setStruktur] = useState<StrukturOrganisasi[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null)
  const [albumPhotos, setAlbumPhotos] = useState<AlbumPhoto[]>([])
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [loadingPhotos, setLoadingPhotos] = useState(false)

  useEffect(() => {
    // Fetch struktur organisasi
    fetch('/api/struktur')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStruktur(data)
      })
      .catch(console.error)

    // Fetch albums
    fetch('/api/album')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setAlbums(data)
      })
      .catch(console.error)
  }, [])

  const filteredAlbums = selectedCategory === 'all' 
    ? albums 
    : albums.filter(item => item.category === selectedCategory)

  const openAlbum = async (album: Album) => {
    setSelectedAlbum(album)
    setCurrentPhotoIndex(0)
    setLoadingPhotos(true)
    try {
      const res = await fetch(`/api/album/${album.id}/photos`)
      const data = await res.json()
      if (Array.isArray(data)) setAlbumPhotos(data)
    } catch (error) {
      console.error('Error fetching photos:', error)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const closeAlbum = () => {
    setSelectedAlbum(null)
    setAlbumPhotos([])
    setCurrentPhotoIndex(0)
  }

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex < albumPhotos.length - 1) {
      setCurrentPhotoIndex(currentPhotoIndex + 1)
    }
  }

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (currentPhotoIndex > 0) {
      setCurrentPhotoIndex(currentPhotoIndex - 1)
    }
  }


  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-blue-600 via-blue-700 to-purple-800 text-white py-20 md:py-32 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Tentang Kami</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl leading-relaxed">
            Mengenal lebih dekat GKPI Bandar Lampung — Gereja yang melayani dengan kasih, 
            bertumbuh dalam iman, dan menjadi berkat bagi sesama.
          </p>
        </div>
      </section>

      {/* Visi Misi Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-6">
                Tentang Gereja
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                GKPI Bandar Lampung
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
                Gereja Kristen Protestan Indonesia (GKPI) Bandar Lampung adalah gereja yang 
                berkomitmen untuk melayani jemaat dan masyarakat dengan kasih Kristus. 
                Kami percaya bahwa setiap orang berharga di mata Tuhan dan memiliki tujuan 
                yang mulia dalam hidupnya.
              </p>
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                Dengan semangat persekutuan yang hangat, kami mengundang Anda untuk bergabung 
                dalam perjalanan iman bersama kami, bertumbuh dalam pengenalan akan Tuhan, 
                dan menjadi berkat bagi sesama.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {/* Visi */}
              <div className="p-8 bg-linear-to-br from-blue-50 to-purple-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-blue-100 dark:border-gray-600">
                <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Visi</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Menjadi gereja yang hidup, bertumbuh, dan berbuah bagi kemuliaan Tuhan 
                  serta menjadi berkat bagi masyarakat sekitar.
                </p>
              </div>
              {/* Misi */}
              <div className="p-8 bg-linear-to-br from-purple-50 to-pink-50 dark:from-gray-700 dark:to-gray-800 rounded-2xl border border-purple-100 dark:border-gray-600">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Misi</h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Memberitakan Injil Keselamatan kepada semua orang
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Membina jemaat dalam iman dan pengenalan akan Kristus
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    Melayani masyarakat dengan kasih dan kepedulian
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sejarah Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold mb-4">
              Sejarah
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Perjalanan Kami
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Menelusuri jejak langkah GKPI Bandar Lampung dari awal berdiri hingga saat ini.
            </p>
          </div>

          {/* Timeline */}
          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200 md:left-1/2 md:-translate-x-0.5"></div>
              
              {/* Timeline Items */}
              <div className="space-y-12">
                <div className="relative flex items-start gap-8 md:gap-0">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                    <span className="text-white font-bold">1</span>
                  </div>
                  <div className="flex-1 md:w-1/2 md:pr-16 md:text-right">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">Tahun Berdiri</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">Awal Mula GKPI</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        GKPI Bandar Lampung didirikan dengan semangat untuk melayani masyarakat 
                        Kristiani di wilayah Bandar Lampung dan sekitarnya.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-8 md:gap-0 md:flex-row-reverse">
                  <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                    <span className="text-white font-bold">2</span>
                  </div>
                  <div className="flex-1 md:w-1/2 md:pl-16">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
                      <span className="text-purple-600 dark:text-purple-400 font-semibold">Perkembangan</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">Pertumbuhan Jemaat</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Jemaat terus bertumbuh dengan berbagai kegiatan pelayanan, 
                        persekutuan, dan program pembinaan iman.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start gap-8 md:gap-0">
                  <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center shrink-0 z-10 md:absolute md:left-1/2 md:-translate-x-1/2">
                    <span className="text-white font-bold">3</span>
                  </div>
                  <div className="flex-1 md:w-1/2 md:pr-16 md:text-right">
                    <div className="bg-white dark:bg-gray-700 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-600">
                      <span className="text-green-600 dark:text-green-400 font-semibold">Masa Kini</span>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-1 mb-2">Melangkah Maju</h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        Dengan alamat di Jl. Turi Raya No.40, Tj. Senang, kami terus 
                        berkomitmen melayani dengan kasih Kristus.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Struktur Organisasi */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
              Tim Kami
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Struktur Organisasi
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Para pelayan Tuhan yang dengan penuh dedikasi melayani jemaat GKPI Bandar Lampung.
            </p>
          </div>

          {struktur.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {struktur.map((person) => (
                <div 
                  key={person.id} 
                  className="bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-lg transition-shadow group flex flex-col"
                >
                  <div className="aspect-square relative bg-linear-to-br from-blue-100 to-purple-100 overflow-hidden">
                    {person.image_url ? (
                      <Image
                        src={getImageUrl(person.image_url)}
                        alt={person.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg className="w-24 h-24 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-5 text-center flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg line-clamp-2">{person.name}</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium text-sm mt-1 line-clamp-1">{person.position}</p>
                    {person.description && (
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 line-clamp-2">{person.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-700 rounded-2xl">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Struktur organisasi akan segera ditampilkan</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Silakan tambahkan melalui admin dashboard</p>
            </div>
          )}
        </div>
      </section>

      {/* Galeri Section */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-800">
        <div className="container">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-semibold mb-4">
              Dokumentasi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Galeri Kegiatan
            </h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Momen-momen berharga dari berbagai kegiatan di GKPI Bandar Lampung.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat.value
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {filteredAlbums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredAlbums.map((album) => (
                <div 
                  key={album.id} 
                  className="bg-white dark:bg-gray-700 rounded-xl border border-gray-100 dark:border-gray-600 overflow-hidden shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => openAlbum(album)}
                >
                  <div className="aspect-square relative overflow-hidden">
                    {album.cover_image ? (
                      <Image
                        src={getImageUrl(album.cover_image)}
                        alt={album.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-600">
                        <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 rounded-lg text-white text-xs">
                      {album.photo_count} foto
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-gray-900 dark:text-white font-medium text-sm line-clamp-1">{album.title}</p>
                    <div className="flex items-center justify-between mt-1">
                      {album.event_date ? (
                        <span className="text-gray-500 dark:text-gray-400 text-xs">
                          {new Date(album.event_date).toLocaleDateString('id-ID', { 
                            day: 'numeric', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </span>
                      ) : <span></span>}
                      <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full capitalize">
                        {categories.find(c => c.value === album.category)?.label || album.category}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-700 rounded-2xl border border-gray-100 dark:border-gray-600">
              <svg className="w-16 h-16 mx-auto text-gray-300 dark:text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400">Belum ada album</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Silakan tambahkan melalui admin dashboard</p>
            </div>
          )}
        </div>
      </section>

      {/* Album Lightbox Modal */}
      {selectedAlbum && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex flex-col"
          onClick={closeAlbum}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white">
            <div>
              <h3 className="text-lg font-semibold">{selectedAlbum.title}</h3>
              {albumPhotos.length > 0 && (
                <p className="text-sm text-gray-400">{currentPhotoIndex + 1} / {albumPhotos.length}</p>
              )}
            </div>
            <button 
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              onClick={closeAlbum}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main Photo Area */}
          <div className="flex-1 flex items-center justify-center px-4 relative" onClick={(e) => e.stopPropagation()}>
            {loadingPhotos ? (
              <div className="animate-spin w-8 h-8 border-4 border-white border-t-transparent rounded-full"></div>
            ) : albumPhotos.length > 0 ? (
              <>
                {/* Previous Button */}
                {currentPhotoIndex > 0 && (
                  <button 
                    onClick={prevPhoto}
                    className="absolute left-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                {/* Current Photo */}
                <div className="max-w-5xl max-h-[70vh] relative">
                  <Image
                    src={getImageUrl(albumPhotos[currentPhotoIndex]?.image_url)}
                    alt={albumPhotos[currentPhotoIndex]?.caption || selectedAlbum.title}
                    width={1200}
                    height={800}
                    className="object-contain max-h-[70vh] rounded-lg"
                  />
                </div>

                {/* Next Button */}
                {currentPhotoIndex < albumPhotos.length - 1 && (
                  <button 
                    onClick={nextPhoto}
                    className="absolute right-4 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors z-10"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </>
            ) : (
              <p className="text-gray-400">Tidak ada foto dalam album ini</p>
            )}
          </div>

          {/* Thumbnail Strip */}
          {albumPhotos.length > 1 && (
            <div className="p-4 bg-black/50" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-center gap-2 overflow-x-auto pb-2">
                {albumPhotos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      index === currentPhotoIndex 
                        ? 'border-white opacity-100' 
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={getImageUrl(photo.image_url)}
                      alt=""
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-linear-to-r from-blue-600 to-purple-600 text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Mari Bergabung Bersama Kami
          </h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Kami mengundang Anda untuk beribadah dan bertumbuh bersama dalam kasih Kristus.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/jadwal" 
              className="px-8 py-4 bg-white text-blue-600! font-semibold rounded-xl hover:shadow-lg hover:bg-blue-50 transition-all"
            >
              Lihat Jadwal Ibadah
            </Link>
            <Link 
              href="/kontak" 
              className="px-8 py-4 bg-white/10 backdrop-blur text-white! font-semibold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
            >
              Hubungi Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
