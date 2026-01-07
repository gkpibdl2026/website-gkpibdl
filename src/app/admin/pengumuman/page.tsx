'use client'

import Link from 'next/link'
import { useState } from 'react'

// Mock data
const pengumumanData = [
  { id: '1', title: 'Pendaftaran Sekolah Minggu', date: '6 Jan 2026', priority: 'important', visible: true },
  { id: '2', title: 'Latihan Paduan Suara', date: '5 Jan 2026', priority: 'normal', visible: true },
  { id: '3', title: 'Ibadah Tahun Baru 2026', date: '28 Des 2025', priority: 'important', visible: true },
  { id: '4', title: 'Persembahan Khusus Bencana', date: '20 Des 2025', priority: 'urgent', visible: false },
]

export default function AdminPengumuman() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredData = pengumumanData.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Pengumuman</h2>
          <p className="text-gray-300 mt-1">Kelola pengumuman untuk jemaat</p>
        </div>
        <Link 
          href="/admin/pengumuman/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengumuman
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Cari pengumuman..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Judul</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Tanggal</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Prioritas</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{item.date}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                      item.priority === 'important' ? 'bg-amber-100 text-amber-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.priority === 'urgent' ? 'Mendesak' : item.priority === 'important' ? 'Penting' : 'Info'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      item.visible ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {item.visible ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
