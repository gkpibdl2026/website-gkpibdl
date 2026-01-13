'use client'

import Link from "next/link";
import { useState, useEffect } from "react";

interface Warta {
  id: string;
  title: string;
  excerpt: string | null;
  created_at: string;
  published: boolean;
}

export default function WartaPage() {
  const [wartaData, setWartaData] = useState<Warta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWarta();
  }, []);

  const fetchWarta = async () => {
    try {
      const res = await fetch('/api/warta?published=true');
      if (res.ok) {
        const { data } = await res.json();
        setWartaData(data || []);
      }
    } catch (error) {
      console.error('Error fetching warta:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Warta Jemaat</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Berita, renungan, dan kabar terbaru dari GKPI Bandar Lampung.
          </p>
        </div>
      </section>

      {/* Warta List */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : wartaData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada warta yang dipublikasikan.</p>
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {wartaData.map((warta) => (
                <Link 
                  key={warta.id}
                  href={`/warta/${warta.id}`}
                  className="group block bg-gray-50 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-blue-100 dark:hover:border-blue-800 transition-all duration-300"
                >
                  <div className="h-48 bg-linear-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-0 transition-opacity"></div>
                    <svg className="w-16 h-16 text-blue-300 dark:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 mb-3">
                      <span>{formatDate(warta.created_at)}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                      {warta.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 line-clamp-3">{warta.excerpt || 'Klik untuk membaca selengkapnya...'}</p>
                    <p className="mt-4 text-blue-600 dark:text-blue-400 font-medium group-hover:underline">Baca selengkapnya →</p>
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
