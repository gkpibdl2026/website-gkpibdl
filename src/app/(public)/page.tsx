import Link from "next/link";

// Temporary mock data - will be replaced with database queries
const mockJadwal = [
  { id: 1, name: "Ibadah Minggu Pagi", day: "Minggu", time: "07:00 WIB", location: "Gedung Utama" },
  { id: 2, name: "Ibadah Minggu Siang", day: "Minggu", time: "10:00 WIB", location: "Gedung Utama" },
  { id: 3, name: "Ibadah Pemuda", day: "Sabtu", time: "17:00 WIB", location: "Aula Pemuda" },
];

const mockPengumuman = [
  { id: 1, title: "Pendaftaran Sekolah Minggu", content: "Pendaftaran Sekolah Minggu tahun ajaran baru telah dibuka. Segera daftarkan putra-putri Anda.", priority: "important" },
  { id: 2, title: "Latihan Paduan Suara", content: "Latihan paduan suara setiap Sabtu pukul 15.00 WIB di ruang musik.", priority: "normal" },
];

const mockWarta = [
  { id: 1, title: "Renungan Minggu: Kasih yang Sejati", excerpt: "Kasih yang sejati adalah kasih yang tidak mengharapkan balasan, melainkan memberi dengan tulus ikhlas.", date: "6 Jan 2026" },
  { id: 2, title: "Perayaan Natal 2025 Bersama Jemaat", excerpt: "Dokumentasi perayaan Natal bersama jemaat GKPI Bandar Lampung yang penuh sukacita.", date: "25 Des 2025" },
  { id: 3, title: "Bakti Sosial ke Panti Asuhan", excerpt: "GKPI Bandar Lampung mengadakan bakti sosial ke panti asuhan sebagai wujud kasih.", date: "20 Des 2025" },
];

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center bg-linear-to-br from-blue-600 via-blue-700 to-purple-700 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 py-20">
          <div className="max-w-2xl">
            <p className="text-blue-200 font-medium mb-4 tracking-wide uppercase text-sm">
              Selamat Datang di
            </p>
            <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6">
              GKPI <span className="block">Bandar Lampung</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed max-w-lg">
              Melayani dengan kasih, bertumbuh dalam iman, dan menjadi berkat bagi sesama.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/jadwal" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Jadwal Ibadah
              </Link>
              <Link 
                href="/kontak" 
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/50 text-white font-semibold rounded-xl hover:bg-white/10 transition-all"
              >
                Hubungi Kami
              </Link>
            </div>
          </div>
        </div>
        
        {/* Wave Decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Jadwal Ibadah Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Ibadah</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Jadwal Ibadah</h2>
            </div>
            <Link href="/jadwal" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            {mockJadwal.map((jadwal) => (
              <div 
                key={jadwal.id} 
                className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">{jadwal.name}</h3>
                    <p className="text-blue-600 font-semibold">{jadwal.day}, {jadwal.time}</p>
                    <p className="text-gray-500 text-sm mt-2 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {jadwal.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Informasi</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Pengumuman</h2>
            </div>
            <Link href="/pengumuman" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="space-y-4">
            {mockPengumuman.map((item) => (
              <div 
                key={item.id} 
                className="flex flex-col sm:flex-row sm:items-center gap-4 p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-lg hover:border-blue-100 transition-all"
              >
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 w-fit ${
                  item.priority === 'urgent' 
                    ? 'bg-red-100 text-red-700' 
                    : item.priority === 'important' 
                    ? 'bg-amber-100 text-amber-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {item.priority === 'urgent' ? '🔴 Mendesak' : item.priority === 'important' ? '🟡 Penting' : 'ℹ️ Info'}
                </span>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{item.title}</h3>
                  <p className="text-gray-600 mt-1">{item.content}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Warta Section */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">Berita</p>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Warta Terbaru</h2>
            </div>
            <Link href="/warta" className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1">
              Lihat Semua
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {mockWarta.map((warta) => (
              <Link 
                key={warta.id} 
                href={`/warta/${warta.id}`} 
                className="group block bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="h-48 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-0 transition-opacity"></div>
                  <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-400 mb-3">{warta.date}</p>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {warta.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">{warta.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 bg-linear-to-r from-blue-600 to-purple-600 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Mari Beribadah Bersama</h2>
          <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Bergabunglah bersama kami dalam persekutuan dan ibadah. Pintu gereja selalu terbuka untuk Anda dan keluarga.
          </p>
          <Link 
            href="/kontak" 
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            Kunjungi Kami
          </Link>
        </div>
      </section>
    </>
  );
}

