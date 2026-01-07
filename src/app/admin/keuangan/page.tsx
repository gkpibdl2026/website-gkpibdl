'use client'

import Link from 'next/link'

// Mock data
const keuanganData = [
  { id: '1', period: 'Desember 2025', pemasukan: 45000000, pengeluaran: 38000000, saldo: 157000000, hasDoc: true },
  { id: '2', period: 'November 2025', pemasukan: 42000000, pengeluaran: 35000000, saldo: 150000000, hasDoc: true },
  { id: '3', period: 'Oktober 2025', pemasukan: 48000000, pengeluaran: 40000000, saldo: 143000000, hasDoc: false },
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function AdminKeuangan() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Laporan Keuangan</h2>
          <p className="text-gray-300 mt-1">Kelola laporan keuangan gereja</p>
        </div>
        <Link 
          href="/admin/keuangan/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white font-medium rounded-xl hover:bg-amber-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Laporan
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Periode</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Pemasukan</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Pengeluaran</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Saldo</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Dokumen</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {keuanganData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{item.period}</td>
                  <td className="px-6 py-4 text-right text-green-600">{formatCurrency(item.pemasukan)}</td>
                  <td className="px-6 py-4 text-right text-red-600">{formatCurrency(item.pengeluaran)}</td>
                  <td className="px-6 py-4 text-right font-semibold text-gray-900">{formatCurrency(item.saldo)}</td>
                  <td className="px-6 py-4 text-center">
                    {item.hasDoc ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        Ada
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        Belum
                      </span>
                    )}
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
