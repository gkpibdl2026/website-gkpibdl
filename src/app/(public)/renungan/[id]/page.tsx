'use client';

import Link from 'next/link';
import { useState, useEffect, useCallback, use } from 'react';

interface Renungan {
  id: string;
  title: string;
  date: string;
  ayat_kunci: string;
  referensi: string;
  isi_renungan: string;
  lagu: string | null;
  doa: string | null;
  source: 'manual' | 'gkpi_sinode';
  source_url: string | null;
}

export default function RenunganDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [renungan, setRenungan] = useState<Renungan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState(18); // Base font size in px

  // Calculate reading time (average 200 words per minute for Indonesian)
  const getReadingTime = (text: string) => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return minutes;
  };

  const fetchRenungan = useCallback(async () => {
    try {
      const res = await fetch(`/api/renungan/${id}`);
      const { data } = await res.json();
      setRenungan(data);
    } catch (error) {
      console.error('Error fetching renungan:', error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchRenungan();
  }, [fetchRenungan]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const copyToClipboard = () => {
    if (!renungan) return;
    
    const shareText = `📖 *RENUNGAN HARIAN*
${formatDate(renungan.date)}

*${renungan.title.toUpperCase()}*

📜 _"${renungan.ayat_kunci}"_
— ${renungan.referensi}

${renungan.isi_renungan ? renungan.isi_renungan.substring(0, 500) + (renungan.isi_renungan.length > 500 ? '...' : '') : ''}

${renungan.lagu ? `🎵 Lagu: ${renungan.lagu}` : ''}
${renungan.doa ? `\n🙏 Doa: ${renungan.doa}` : ''}

_Sumber: GKPI Bandar Lampung_
🔗 Selengkapnya: ${typeof window !== 'undefined' ? window.location.href : ''}`;

    navigator.clipboard.writeText(shareText.trim()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!renungan) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Renungan tidak ditemukan</h1>
        <Link href="/renungan" className="text-blue-600 hover:underline">
          Kembali ke daftar renungan
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container max-w-3xl">
          <Link href="/renungan" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Renungan Lainnya
          </Link>
          <p className="text-blue-200 text-sm mb-2">{formatDate(renungan.date)}</p>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{renungan.title}</h1>
          {renungan.source === 'gkpi_sinode' && (
            <span className="inline-block text-xs bg-white/20 px-3 py-1 rounded-full">
              Sumber: GKPI Sinode
            </span>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-16 bg-white dark:bg-gray-900">
        <div className="container max-w-3xl">
          {/* Reading Info & Font Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>⏱️ {getReadingTime(renungan.isi_renungan || '')} menit baca</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500 dark:text-gray-400 text-sm">Ukuran:</span>
              <button
                onClick={() => setFontSize(prev => Math.max(14, prev - 2))}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-bold text-gray-700 dark:text-gray-300"
                disabled={fontSize <= 14}
              >
                A-
              </button>
              <button
                onClick={() => setFontSize(prev => Math.min(24, prev + 2))}
                className="w-8 h-8 flex items-center justify-center bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-bold text-gray-700 dark:text-gray-300"
                disabled={fontSize >= 24}
              >
                A+
              </button>
            </div>
          </div>

          {/* Ayat Kunci */}
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 mb-8 border-l-4 border-blue-500">
            <p className="text-lg md:text-xl italic text-gray-800 dark:text-gray-200 leading-relaxed font-serif">
              &ldquo;{renungan.ayat_kunci}&rdquo;
            </p>
            <p className="text-blue-600 dark:text-blue-400 font-medium mt-3">— {renungan.referensi}</p>
          </div>

          {/* Isi Renungan */}
          {renungan.isi_renungan && (
            <div className="mb-8">
              <div 
                className="text-gray-700 dark:text-gray-300 leading-loose whitespace-pre-line font-serif"
                style={{ fontSize: `${fontSize}px`, lineHeight: '1.8' }}
              >
                {renungan.isi_renungan}
              </div>
            </div>
          )}

          {/* Lagu */}
          {renungan.lagu && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-6 mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                Lagu Pujian
              </h3>
              <p className="text-gray-700 dark:text-gray-300">{renungan.lagu}</p>
            </div>
          )}

          {/* Doa */}
          {renungan.doa && (
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-6 mb-8">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <span className="text-2xl">🙏</span>
                Doa
              </h3>
              <p className="text-gray-700 dark:text-gray-300 italic whitespace-pre-line">{renungan.doa}</p>
            </div>
          )}

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={copyToClipboard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors font-medium"
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tersalin!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Salin Renungan
                </>
              )}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`📖 *RENUNGAN HARIAN*\n${formatDate(renungan.date)}\n\n*${renungan.title.toUpperCase()}*\n\n📜 _"${renungan.ayat_kunci}"_\n— ${renungan.referensi}\n\n🔗 Selengkapnya: ${typeof window !== 'undefined' ? window.location.href : ''}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Bagikan via WhatsApp
            </a>
          </div>

          {/* Source Link */}
          {renungan.source_url && (
            <div className="text-center pt-8 border-t border-gray-200 dark:border-gray-700">
              <a
                href={renungan.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Baca di GKPI Sinode
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Navigation */}
      <section className="py-8 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-3xl flex justify-between">
          <Link
            href="/renungan"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Renungan Lainnya
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            Beranda
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </Link>
        </div>
      </section>
    </>
  );
}
