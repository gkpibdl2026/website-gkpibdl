'use client'

import Link from "next/link";
import { useState, useEffect } from "react";

interface Jadwal {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
  description: string;
}

export default function JadwalPage() {
  const [jadwalData, setJadwalData] = useState<Jadwal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchJadwal();
  }, []);

  const fetchJadwal = async () => {
    try {
      const res = await fetch('/api/jadwal?active=true');
      if (res.ok) {
        const { data } = await res.json();
        setJadwalData(data || []);
      }
    } catch (error) {
      console.error('Error fetching jadwal:', error);
    } finally {
      setIsLoading(false);
    }
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Jadwal Ibadah</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Beribadahlah bersama kami. Gereja selalu terbuka untuk menyambut Anda.
          </p>
        </div>
      </section>

      {/* Jadwal List */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : jadwalData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">Belum ada jadwal ibadah.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {jadwalData.map((jadwal) => (
                <div 
                  key={jadwal.id}
                  className="group p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300"
                >
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-2">{jadwal.name}</h3>
                      <div className="flex flex-wrap gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          {jadwal.day}
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {jadwal.time}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">{jadwal.description || ''}</p>
                      <p className="text-gray-500 text-sm flex items-center gap-1.5">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {jadwal.location || 'Lokasi belum ditentukan'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gray-50">
        <div className="container text-center">
          <p className="text-gray-600 mb-4">Ada pertanyaan tentang jadwal ibadah?</p>
          <Link 
            href="/kontak" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Hubungi Kami
          </Link>
        </div>
      </section>
    </>
  );
}
