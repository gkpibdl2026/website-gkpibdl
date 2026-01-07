'use client'

import Link from 'next/link'

// Mock data
const jadwalData = [
  { id: '1', name: 'Ibadah Minggu Pagi', day: 'Minggu', time: '07:00 WIB', location: 'Gedung Utama', active: true },
  { id: '2', name: 'Ibadah Minggu Siang', day: 'Minggu', time: '10:00 WIB', location: 'Gedung Utama', active: true },
  { id: '3', name: 'Ibadah Pemuda', day: 'Sabtu', time: '17:00 WIB', location: 'Aula Pemuda', active: true },
  { id: '4', name: 'Ibadah Doa', day: 'Rabu', time: '18:30 WIB', location: 'Ruang Doa', active: true },
  { id: '5', name: 'Sekolah Minggu', day: 'Minggu', time: '08:00 WIB', location: 'Gedung SM', active: true },
]

export default function AdminJadwal() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Jadwal Ibadah</h2>
          <p className="text-gray-300 mt-1">Kelola jadwal ibadah gereja</p>
        </div>
        <Link 
          href="/admin/jadwal/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-xl hover:bg-green-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Jadwal
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {jadwalData.map((jadwal) => (
          <div key={jadwal.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                jadwal.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {jadwal.active ? 'Aktif' : 'Nonaktif'}
              </span>
            </div>
            
            <h3 className="font-bold text-gray-900 text-lg mb-2">{jadwal.name}</h3>
            <p className="text-blue-600 font-medium mb-1">{jadwal.day}, {jadwal.time}</p>
            <p className="text-gray-500 text-sm">{jadwal.location}</p>
            
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button className="flex-1 py-2 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors text-sm">
                Edit
              </button>
              <button className="flex-1 py-2 text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors text-sm">
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
