'use client'

import Link from "next/link";
import { useState, useEffect } from "react";

interface Pengumuman {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

export default function PengumumanPage() {
  const [pengumumanData, setPengumumanData] = useState<Pengumuman[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPengumuman();
  }, []);

  const fetchPengumuman = async () => {
    try {
      const res = await fetch('/api/pengumuman?visible=true');
      if (res.ok) {
        const { data } = await res.json();
        setPengumumanData(data || []);
      }
    } catch (error) {
      console.error('Error fetching pengumuman:', error);
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Pengumuman</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Informasi penting dan pengumuman terbaru untuk jemaat GKPI Bandar Lampung.
          </p>
        </div>
      </section>

      {/* Pengumuman List */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
          ) : pengumumanData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">Belum ada pengumuman.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {pengumumanData.map((item) => (
                <div 
                  key={item.id}
                  className={`p-6 rounded-2xl border-l-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all ${
                    item.priority === 'urgent' 
                      ? 'border-l-red-500 bg-red-50/30 dark:bg-red-900/20' 
                      : item.priority === 'important' 
                      ? 'border-l-amber-500 bg-amber-50/30 dark:bg-amber-900/20' 
                      : 'border-l-gray-300 dark:border-l-gray-600'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 w-fit ${
                      item.priority === 'urgent' 
                        ? 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' 
                        : item.priority === 'important' 
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                    }`}>
                      {item.priority === 'urgent' ? '🔴 Mendesak' : item.priority === 'important' ? '🟡 Penting' : 'ℹ️ Info'}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-400 dark:text-gray-500 mb-2">{formatDate(item.created_at)}</p>
                      <h3 className="font-bold text-gray-900 dark:text-white text-xl mb-3">{item.title}</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
