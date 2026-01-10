'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useNotification } from '@/context/NotificationContext'

interface Keuangan {
  id: string
  title: string
  period: string
  pemasukan: number
  pengeluaran: number
  saldo: number
  document_url: string | null
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount)
}

export default function AdminKeuangan() {
  const [keuanganData, setKeuanganData] = useState<Keuangan[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { showConfirm, showToast } = useNotification()

  useEffect(() => {
    fetchKeuangan()
  }, [])

  const fetchKeuangan = async () => {
    try {
      const res = await fetch('/api/keuangan')
      if (res.ok) {
        const { data } = await res.json()
        setKeuanganData(data || [])
      }
    } catch (error) {
      console.error('Error fetching keuangan:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    showConfirm('Hapus Laporan', 'Apakah Anda yakin ingin menghapus laporan ini?', async () => {
      try {
        const res = await fetch(`/api/keuangan/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setKeuanganData(keuanganData.filter(k => k.id !== id))
          showToast('Laporan berhasil dihapus', 'success')
        } else {
          throw new Error('Failed to delete')
        }
      } catch {
        showToast('Gagal menghapus laporan', 'error')
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Laporan Keuangan</h2>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Kelola laporan keuangan gereja</p>
        </div>
        <Link 
          href="/admin/keuangan/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white! font-medium rounded-xl hover:bg-amber-700 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Laporan
        </Link>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-100 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Periode</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Pemasukan</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Pengeluaran</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Saldo</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Dokumen</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {keuanganData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{item.period}</td>
                    <td className="px-6 py-4 text-right text-green-600 dark:text-green-400">{formatCurrency(item.pemasukan)}</td>
                    <td className="px-6 py-4 text-right text-red-600 dark:text-red-400">{formatCurrency(item.pengeluaran)}</td>
                    <td className="px-6 py-4 text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(item.saldo)}</td>
                    <td className="px-6 py-4 text-center">
                      {item.document_url ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                          Ada
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                          Belum
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/keuangan/${item.id}/edit`}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                        >
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
        )}

        {!isLoading && keuanganData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">Tidak ada laporan keuangan ditemukan</p>
          </div>
        )}
      </div>
    </div>
  )
}
