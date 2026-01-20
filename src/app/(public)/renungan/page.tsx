'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

interface Renungan {
  id: string;
  title: string;
  date: string;
  ayat_kunci: string;
  referensi: string;
  isi_renungan: string;
  lagu: string | null;
  source: 'manual' | 'gkpi_sinode';
  source_url: string | null;
}

export default function RenunganListPage() {
  const [renunganList, setRenunganList] = useState<Renungan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRenungan();
  }, []);

  const fetchRenungan = async () => {
    try {
      const res = await fetch('/api/renungan');
      const { data } = await res.json();
      setRenunganList(data || []);
    } catch (error) {
      console.error('Error fetching renungan:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Header */}
      <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Renungan Harian</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Koleksi renungan harian untuk menguatkan iman dan menyegarkan jiwa.
          </p>
        </div>
      </section>

      {/* List */}
      <section className="py-16 md:py-24 bg-gray-50 dark:bg-gray-900">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : renunganList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada renungan tersedia.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {renunganList.map((item) => (
                <Link
                  key={item.id}
                  href={`/renungan/${item.id}`}
                  className="block p-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
                        {formatDate(item.date)}
                      </p>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-2">
                        {item.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 italic line-clamp-2">
                        &ldquo;{item.ayat_kunci}&rdquo;
                      </p>
                      <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                        — {item.referensi}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.source === 'gkpi_sinode' && (
                        <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded-full">
                          GKPI Sinode
                        </span>
                      )}
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
