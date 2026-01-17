'use client'

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

interface Pengumuman {
  id: string;
  title: string;
  content: string;
  priority: string;
  created_at: string;
}

// Helper function to convert URLs in text to clickable links
function linkifyContent(text: string): React.ReactNode[] {
  // Regex to match URLs (including short links like bit.ly)
  const urlRegex = /(https?:\/\/[^\s]+)|((www\.)?[a-zA-Z0-9-]+\.[a-zA-Z]{2,}(\/[^\s]*)?)/gi;
  
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;
  
  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const url = match[0];
    // Add https:// if not present
    const href = url.startsWith('http') ? url : `https://${url}`;
    
    parts.push(
      <a
        key={`link-${keyIndex++}`}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan-400 hover:text-cyan-300 bg-cyan-500/20 px-1.5 py-0.5 rounded underline underline-offset-2 decoration-cyan-400/50 hover:decoration-cyan-300 inline-flex items-center gap-1 font-medium"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
        <svg className="w-3.5 h-3.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text after last URL
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  
  return parts.length > 0 ? parts : [text];
}

export default function PengumumanDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [pengumuman, setPengumuman] = useState<Pengumuman | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      try {
        const res = await fetch(`/api/pengumuman/${id}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Pengumuman tidak ditemukan');
          } else {
            setError('Gagal memuat pengumuman');
          }
          return;
        }
        const { data } = await res.json();
        setPengumuman(data);
      } catch (err) {
        console.error('Error fetching pengumuman:', err);
        setError('Gagal memuat pengumuman');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return { label: '🔴 Mendesak', className: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300' };
      case 'important':
        return { label: '🟡 Penting', className: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300' };
      default:
        return { label: 'ℹ️ Info', className: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
    }
  };

  if (isLoading) {
    return (
      <>
        <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
          <div className="container max-w-4xl">
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-blue-400/50 rounded mb-6"></div>
              <div className="h-12 w-3/4 bg-blue-400/50 rounded mb-4"></div>
              <div className="h-6 w-48 bg-blue-400/50 rounded"></div>
            </div>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (error || !pengumuman) {
    return (
      <>
        <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
          <div className="container max-w-4xl">
            <Link href="/pengumuman" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Pengumuman
            </Link>
            <h1 className="text-3xl md:text-5xl font-bold">Pengumuman</h1>
          </div>
        </section>
        <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
          <div className="container max-w-3xl text-center">
            <div className="py-12">
              <svg className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-gray-500 dark:text-gray-400 text-lg">{error || 'Pengumuman tidak ditemukan'}</p>
              <Link href="/pengumuman" className="inline-flex items-center gap-2 mt-6 text-blue-600 font-medium hover:underline">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Kembali ke Daftar Pengumuman
              </Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  const priorityInfo = getPriorityLabel(pengumuman.priority);

  return (
    <>
      {/* Header */}
      <section className={`py-16 md:py-24 ${
        pengumuman.priority === 'urgent' 
          ? 'bg-linear-to-br from-red-600 to-red-800' 
          : pengumuman.priority === 'important'
          ? 'bg-linear-to-br from-amber-500 to-orange-600'
          : 'bg-linear-to-br from-blue-600 to-purple-700'
      } text-white`}>
        <div className="container max-w-4xl">
          <Link href="/pengumuman" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Pengumuman
          </Link>
          
          <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold mb-4 ${priorityInfo.className}`}>
            {priorityInfo.label}
          </span>
          
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{pengumuman.title}</h1>
          
          <div className="flex items-center gap-2 text-white/80">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formatDate(pengumuman.created_at)}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="container max-w-3xl">
          <article className="prose prose-lg max-w-none dark:prose-invert prose-headings:text-gray-900 dark:prose-headings:text-white prose-headings:font-bold prose-p:text-gray-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed">
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
              {linkifyContent(pengumuman.content)}
            </div>
          </article>
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-gray-50 dark:bg-gray-800">
        <div className="container max-w-3xl">
          <div className="flex justify-between items-center">
            <Link href="/pengumuman" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Pengumuman
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
