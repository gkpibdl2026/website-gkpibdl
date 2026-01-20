'use client';

import type { Renungan } from '../types';
import { formatDateIndonesian } from '../services';

interface RenunganCardProps {
  renungan: Renungan;
  variant?: 'hero' | 'full' | 'compact';
}

export function RenunganCard({ renungan, variant = 'hero' }: RenunganCardProps) {
  if (variant === 'hero') {
    return (
      <div className="bg-blue-900/60 backdrop-blur-md rounded-2xl p-6 border border-white/30 max-w-md">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
          <span className="text-yellow-300 text-sm font-semibold uppercase tracking-wide">
            Renungan Hari Ini
          </span>
        </div>
        <h3 className="text-white font-bold text-lg mb-2">{renungan.title}</h3>
        <p className="text-white italic text-base mb-3 leading-relaxed line-clamp-3">
          &ldquo;{renungan.ayat_kunci}&rdquo;
        </p>
        <p className="text-blue-200 text-sm">— {renungan.referensi}</p>
        {renungan.source === 'gkpi_sinode' && (
          <p className="text-blue-300/70 text-xs mt-3">
            Sumber: GKPI Sinode
          </p>
        )}
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <article className="bg-(--bg-secondary) rounded-2xl p-6 md:p-8 border border-(--border)">
        <div className="mb-6">
          <p className="text-blue-600 text-sm font-medium mb-2">
            {formatDateIndonesian(renungan.date)}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-(--text-primary) mb-4">
            {renungan.title}
          </h1>
          <blockquote className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-r-lg">
            <p className="text-(--text-primary) italic text-lg">
              &ldquo;{renungan.ayat_kunci}&rdquo;
            </p>
            <cite className="text-(--text-secondary) text-sm not-italic">
              — {renungan.referensi}
            </cite>
          </blockquote>
        </div>

        <div className="prose prose-lg dark:prose-invert max-w-none mb-6">
          <div className="text-(--text-secondary) leading-relaxed whitespace-pre-line">
            {renungan.isi_renungan}
          </div>
        </div>

        {renungan.kutipan && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
            <h3 className="text-yellow-800 dark:text-yellow-300 font-semibold text-sm mb-2">
              ✨ Kutipan Renungan
            </h3>
            <p className="text-yellow-900 dark:text-yellow-100 italic">
              {renungan.kutipan}
            </p>
          </div>
        )}

        {renungan.lagu && (
          <div className="flex items-start gap-3 mb-4">
            <span className="text-2xl">🎵</span>
            <div>
              <h3 className="font-semibold text-(--text-primary) text-sm">Lagu</h3>
              <p className="text-(--text-secondary)">{renungan.lagu}</p>
            </div>
          </div>
        )}

        {renungan.doa && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4">
            <h3 className="text-purple-800 dark:text-purple-300 font-semibold text-sm mb-2">
              🙏 Doa
            </h3>
            <p className="text-purple-900 dark:text-purple-100 italic leading-relaxed">
              {renungan.doa}
            </p>
          </div>
        )}

        {renungan.source === 'gkpi_sinode' && renungan.source_url && (
          <div className="mt-6 pt-4 border-t border-(--border)">
            <p className="text-(--text-muted) text-sm">
              Sumber:{' '}
              <a
                href={renungan.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                GKPI Sinode - Terang Hidup
              </a>
            </p>
          </div>
        )}
      </article>
    );
  }

  // Compact variant
  return (
    <div className="bg-(--bg-secondary) rounded-xl p-4 border border-(--border) hover:shadow-md transition-shadow">
      <p className="text-blue-600 text-xs font-medium mb-1">
        {formatDateIndonesian(renungan.date)}
      </p>
      <h3 className="font-bold text-(--text-primary) mb-2 line-clamp-1">
        {renungan.title}
      </h3>
      <p className="text-(--text-secondary) text-sm italic line-clamp-2">
        &ldquo;{renungan.ayat_kunci}&rdquo;
      </p>
      <p className="text-(--text-muted) text-xs mt-1">— {renungan.referensi}</p>
    </div>
  );
}
