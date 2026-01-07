import Link from 'next/link'

// Mock data for dashboard stats
const stats = [
  { label: 'Total Warta', value: 12, icon: 'newspaper', color: 'blue' },
  { label: 'Pengumuman Aktif', value: 5, icon: 'megaphone', color: 'purple' },
  { label: 'Jadwal Ibadah', value: 7, icon: 'calendar', color: 'green' },
  { label: 'Laporan Keuangan', value: 8, icon: 'currency', color: 'amber' },
]

const recentWarta = [
  { id: 1, title: 'Renungan Minggu: Kasih yang Sejati', date: '6 Jan 2026', status: 'Published' },
  { id: 2, title: 'Perayaan Natal 2025', date: '25 Des 2025', status: 'Published' },
  { id: 3, title: 'Draft: Kegiatan Tahun Baru', date: '1 Jan 2026', status: 'Draft' },
]

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-2xl font-bold text-white">Selamat Datang, Admin!</h2>
        <p className="text-gray-300 mt-1">Kelola konten website GKPI Bandar Lampung dari sini.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
              stat.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              stat.color === 'purple' ? 'bg-purple-100 text-purple-600' :
              stat.color === 'green' ? 'bg-green-100 text-green-600' :
              'bg-amber-100 text-amber-600'
            }`}>
              {stat.icon === 'newspaper' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              )}
              {stat.icon === 'megaphone' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              )}
              {stat.icon === 'calendar' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              )}
              {stat.icon === 'currency' && (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Warta */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Warta Terbaru</h3>
            <Link href="/admin/warta" className="text-sm text-blue-600 font-medium hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentWarta.map((warta) => (
              <div key={warta.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="font-medium text-gray-900 text-sm">{warta.title}</p>
                  <p className="text-gray-500 text-xs mt-1">{warta.date}</p>
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  warta.status === 'Published' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {warta.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Aksi Cepat</h3>
          <div className="grid gap-3">
            <Link 
              href="/admin/warta/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-blue-200 hover:bg-blue-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Tambah Warta Baru</p>
                <p className="text-gray-500 text-xs">Buat berita atau renungan baru</p>
              </div>
            </Link>
            <Link 
              href="/admin/pengumuman/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Tambah Pengumuman</p>
                <p className="text-gray-500 text-xs">Buat pengumuman untuk jemaat</p>
              </div>
            </Link>
            <Link 
              href="/admin/keuangan/new" 
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-amber-200 hover:bg-amber-50 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Tambah Laporan Keuangan</p>
                <p className="text-gray-500 text-xs">Upload laporan keuangan bulanan</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
