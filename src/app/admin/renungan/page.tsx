'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback } from 'react';
import { useNotification } from '@/features/common';
import { WartaListSkeleton } from '@/components/ui/Skeleton';

interface Renungan {
  id: string;
  title: string;
  date: string;
  referensi: string;
  source: 'manual' | 'gkpi_sinode';
  visible: boolean;
  created_at: string;
}

export default function AdminRenungan() {
  const [renunganList, setRenunganList] = useState<Renungan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<'all' | 'manual' | 'gkpi_sinode'>('all');
  const { showToast, showConfirm } = useNotification();

  const fetchRenungan = useCallback(async () => {
    try {
      const res = await fetch('/api/renungan');
      const { data } = await res.json();
      setRenunganList(data || []);
    } catch (error) {
      console.error('Error fetching renungan:', error);
      showToast('Gagal memuat data renungan', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRenungan();
  }, [fetchRenungan]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/renungan/sync', { method: 'POST' });
      const result = await res.json();
      
      if (res.ok) {
        showToast(`Berhasil sinkronisasi ${result.synced} renungan dari GKPI Sinode`, 'success');
        fetchRenungan();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Error syncing:', error);
      showToast('Gagal sinkronisasi dari GKPI Sinode', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDelete = (id: string) => {
    showConfirm('Hapus Renungan', 'Yakin ingin menghapus renungan ini?', async () => {
      try {
        const res = await fetch(`/api/renungan/${id}`, { method: 'DELETE' });
        if (res.ok) {
          showToast('Renungan berhasil dihapus', 'success');
          fetchRenungan();
        } else {
          throw new Error('Failed to delete');
        }
      } catch (error) {
        console.error('Error deleting:', error);
        showToast('Gagal menghapus renungan', 'error');
      }
    });
  };

  const handleDeleteAll = () => {
    if (renunganList.length === 0) return;
    
    showConfirm(
      'Hapus Semua Renungan',
      `Yakin ingin menghapus ${renunganList.length} renungan? Aksi ini tidak bisa dibatalkan.`,
      async () => {
        setIsDeleting(true);
        try {
          const res = await fetch('/api/renungan/all', { method: 'DELETE' });
          if (res.ok) {
            showToast('Semua renungan berhasil dihapus', 'success');
            fetchRenungan();
          } else {
            throw new Error('Failed to delete all');
          }
        } catch (error) {
          console.error('Error deleting all:', error);
          showToast('Gagal menghapus semua renungan', 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredList = renunganList.filter((item) => {
    if (filter === 'all') return true;
    return item.source === filter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--text-primary)">Renungan Harian</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Kelola renungan harian untuk jemaat
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-medium rounded-lg transition-colors"
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sinkronisasi...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sync GKPI Sinode
              </>
            )}
          </button>
          <Link
            href="/admin/renungan/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah Renungan
          </Link>

        </div>
      </div>

      {/* Filter & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Semua' },
            { value: 'manual', label: 'Manual' },
            { value: 'gkpi_sinode', label: 'GKPI Sinode' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-(--bg-secondary) text-(--text-secondary) hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {renunganList.length > 0 && (
          <button
            onClick={handleDeleteAll}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors"
          >
            {isDeleting ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Menghapus...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Hapus Semua
              </>
            )}
          </button>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <WartaListSkeleton />
      ) : filteredList.length === 0 ? (
        <div className="bg-(--bg-secondary) rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <h3 className="text-lg font-semibold text-(--text-primary) mb-2">Belum ada renungan</h3>
          <p className="text-(--text-secondary) mb-4">
            {filter === 'all'
              ? 'Mulai dengan menambahkan renungan atau sync dari GKPI Sinode'
              : `Tidak ada renungan dari sumber ${filter === 'manual' ? 'manual' : 'GKPI Sinode'}`}
          </p>
        </div>
      ) : (
        <div className="bg-(--bg-secondary) rounded-xl overflow-hidden border border-(--border)">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Tanggal
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Judul
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Referensi
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Sumber
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-(--text-secondary) uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-(--border)">
                {filteredList.map((renungan) => (
                  <tr key={renungan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-(--text-primary)">
                        {formatDate(renungan.date)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-(--text-primary) line-clamp-1">
                        {renungan.title}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-(--text-secondary)">
                        {renungan.referensi}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          renungan.source === 'gkpi_sinode'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}
                      >
                        {renungan.source === 'gkpi_sinode' ? 'GKPI Sinode' : 'Manual'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          renungan.visible
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {renungan.visible ? 'Tampil' : 'Tersembunyi'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/renungan/${renungan.id}`}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(renungan.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      )}
    </div>
  );
}
