"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Jadwal {
  id: string;
  name: string;
  day: string;
  time: string;
  location: string;
}

interface Pengumuman {
  id: string;
  title: string;
  content: string;
  priority: string;
}

interface Warta {
  id: string;
  title: string;
  excerpt: string | null;
  created_at: string;
}

interface Renungan {
  id: string;
  title: string;
  ayat_kunci: string;
  referensi: string;
  source: 'manual' | 'gkpi_sinode';
}

// Fallback renungan if API fails
const fallbackRenungan = {
  ayat_kunci: "Takut akan TUHAN adalah permulaan hikmat, dan mengenal Yang Mahakudus adalah pengertian.",
  referensi: "Amsal 9:10",
  title: "Hikmat Sejati",
};

export default function Home() {
  const [jadwalData, setJadwalData] = useState<Jadwal[]>([]);
  const [pengumumanData, setPengumumanData] = useState<Pengumuman[]>([]);
  const [wartaData, setWartaData] = useState<Warta[]>([]);
  const [renunganData, setRenunganData] = useState<Renungan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [jadwalRes, pengumumanRes, wartaRes] = await Promise.all([
        fetch("/api/jadwal?active=true&limit=3"),
        fetch("/api/pengumuman?visible=true&limit=2"),
        fetch("/api/warta?published=true&limit=3"),
      ]);

      if (jadwalRes.ok) {
        const { data } = await jadwalRes.json();
        setJadwalData(data || []);
      }
      if (pengumumanRes.ok) {
        const { data } = await pengumumanRes.json();
        setPengumumanData(data || []);
      }
      if (wartaRes.ok) {
        const { data } = await wartaRes.json();
        setWartaData(data || []);
      }

      // Fetch renungan separately due to its conditional sync logic
      const fetchRenungan = async () => {
        try {
          const res = await fetch("/api/renungan/today");
          const { data, is_today } = await res.json();
          if (data) {
            setRenunganData(data);
            
            // Auto-sync strategy:
            // If the renungan returned is NOT from today (is_today === false),
            // it means the database is stale. Trigger a background sync.
            if (is_today === false) {
              console.log("Renungan stale, triggering background sync...");
              fetch("/api/renungan/sync", { method: "POST" })
                .then(syncRes => syncRes.json())
                .then(syncResult => {
                  console.log("Background sync result:", syncResult);
                  // Optional: Re-fetch if sync found new items
                  if (syncResult.synced > 0) {
                     fetch("/api/renungan/today") // fetch again to get the new one
                       .then(r => r.json())
                       .then(newData => {
                         if (newData.data) setRenunganData(newData.data);
                       });
                  }
                })
                .catch(err => console.error("Background sync failed:", err));
            }
          } else {
            // No data at all? Also trigger sync
            fetch("/api/renungan/sync", { method: "POST" });
            setRenunganData(fallbackRenungan as Renungan);
          }
        } catch (error) {
          console.error("Error fetching renungan:", error);
          setRenunganData(fallbackRenungan as Renungan);
        }
      };
      await fetchRenungan(); // Call the renungan fetch function
      
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <>
      {/* Hero Section - Split Layout like pmkitera */}
      <section className="hero-section relative min-h-[85vh] bg-linear-to-br from-blue-900 via-blue-800 to-purple-900 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-30"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=1920')",
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-blue-900/90 via-blue-900/70 to-transparent" />

        <div className="relative z-10 grid lg:grid-cols-2 gap-8 mx-auto px-4 md:px-8 xl:px-16 py-24 lg:py-32">
          {/* Left Side - Main Content */}
          <div className="flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight mb-6">
              GKPI Bandar Lampung
            </h1>
            <p className="text-lg lg:text-xl text-white/90 mb-8 max-w-xl leading-relaxed">
              Melayani dengan kasih, bertumbuh dalam iman, dan menjadi berkat
              bagi sesama dalam komunitas Kristen yang penuh sukacita.
            </p>

            {/* Renungan Harian Card */}
            <div className="bg-blue-900/60 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/30 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                <span className="text-yellow-300 text-sm font-semibold uppercase tracking-wide">
                  Renungan Hari Ini
                </span>
              </div>
              {renunganData?.title && (
                <h3 className="text-white font-bold text-lg mb-2">{renunganData.title}</h3>
              )}
              <p className="text-white italic text-base mb-3 leading-relaxed line-clamp-3">
                &ldquo;{renunganData?.ayat_kunci || fallbackRenungan.ayat_kunci}&rdquo;
              </p>
              <p className="text-blue-200 text-sm">— {renunganData?.referensi || fallbackRenungan.referensi}</p>
              {renunganData?.source === 'gkpi_sinode' && (
                <p className="text-blue-300/70 text-xs mt-3">
                  Sumber: GKPI Sinode
                </p>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <Link
                href="/jadwal"
                className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                Jadwal Ibadah
              </Link>
              <Link
                href="/warta"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
              >
                Warta Jemaat
              </Link>
            </div>
          </div>

          {/* Right Side - Featured Card (hidden on mobile) */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="text-center mb-6">
                <span className="text-blue-200 text-sm font-medium uppercase tracking-wide">
                  Jadwal Ibadah Mendatang
                </span>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 space-y-4">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                ) : jadwalData.length === 0 ? (
                  <p className="text-white/70 text-center py-4">
                    Belum ada jadwal ibadah
                  </p>
                ) : (
                  jadwalData.map((jadwal) => (
                    <div
                      key={jadwal.id}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                    >
                      <div className="w-12 h-12 rounded-full bg-linear-to-br from-yellow-400 to-orange-500 flex items-center justify-center shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-white font-semibold">
                          {jadwal.name}
                        </h3>
                        <p className="text-blue-200 text-sm">
                          {jadwal.day}, {jadwal.time}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <Link
                  href="/jadwal"
                  className="block text-center text-blue-300 hover:text-white text-sm font-medium mt-4 transition-colors"
                >
                  Lihat semua jadwal →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - 2 Column Layout */}
      <section className="py-16 lg:py-24 bg-(--bg-secondary)" id="about">
        <div className="mx-auto px-4 md:px-8 xl:px-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text Content */}
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-(--text-primary) mb-2 relative inline-block">
                Tentang GKPI Bandar Lampung
                <span className="absolute -bottom-2 left-0 w-24 h-1 bg-blue-600 rounded-full"></span>
              </h2>
              <p className="text-(--text-secondary) mt-8 leading-relaxed text-justify">
                Gereja Kristen Protestan Indonesia (GKPI) Bandar Lampung adalah
                komunitas iman yang berdiri untuk menjadi wadah pertumbuhan
                rohani bagi jemaat di Kota Bandar Lampung dan sekitarnya. Dengan
                menjadikan Alkitab sebagai pedoman hidup dan Kristus sebagai
                teladan utama, kami hadir untuk menolong jemaat mengenal Tuhan
                Yesus Kristus lebih dalam.
              </p>

              <div className="mt-8">
                <p className="font-semibold text-(--text-primary) mb-4">
                  GKPI Bandar Lampung berkomitmen untuk:
                </p>
                <ul className="space-y-3">
                  {[
                    "Membangun persekutuan yang hangat dan membangun iman antar jemaat",
                    "Mendorong pertumbuhan rohani melalui pendalaman Alkitab",
                    "Menjadi terang dan berkat bagi masyarakat melalui pelayanan sosial",
                    "Membina generasi muda dalam iman Kristen",
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-blue-600 mt-0.5 shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-(--text-secondary)">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/tentang"
                className="inline-flex items-center gap-2 mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
              >
                Kenali Lebih Dalam
              </Link>
            </div>

            {/* Right - Image */}
            <div className="relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl aspect-4/3 bg-gray-200">
                <div className="w-full h-full bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <div className="text-center">
                    <svg
                      className="w-24 h-24 text-blue-400 mx-auto mb-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <p className="text-blue-600 font-medium text-sm">
                      Foto Gereja
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-4 border-blue-200 rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Jadwal Ibadah Section - Mobile View */}
      <section className="lg:hidden py-12 bg-(--bg-primary)">
        <div className="mx-auto px-4">
          <div className="text-center mb-8">
            <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
              Ibadah
            </p>
            <h2 className="text-2xl font-bold text-(--text-primary)">
              Jadwal Ibadah
            </h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {jadwalData.map((jadwal) => (
                <div
                  key={jadwal.id}
                  className="flex items-center gap-4 p-4 bg-(--bg-secondary) rounded-xl"
                >
                  <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center shrink-0">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-(--text-primary)">
                      {jadwal.name}
                    </h3>
                    <p className="text-blue-600 text-sm font-medium">
                      {jadwal.day}, {jadwal.time}
                    </p>
                    <p className="text-(--text-secondary) text-xs">
                      {jadwal.location}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="text-center mt-6">
            <Link
              href="/jadwal"
              className="text-blue-600 font-semibold text-sm hover:underline"
            >
              Lihat semua jadwal →
            </Link>
          </div>
        </div>
      </section>

      {/* Warta Section - Articles Grid */}
      <section className="py-16 lg:py-24 bg-(--bg-primary)">
        <div className="mx-auto px-4 md:px-8 xl:px-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold text-(--text-primary) mb-4 relative inline-block">
              Warta Jemaat
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-blue-600 rounded-full"></span>
            </h2>
            <p className="text-(--text-secondary) mt-6 max-w-2xl mx-auto">
              Berita dan informasi terbaru dari GKPI Bandar Lampung
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
            </div>
          ) : wartaData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-(--text-secondary)">Belum ada warta jemaat</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wartaData.map((warta) => (
                <Link
                  key={warta.id}
                  href={`/warta/${warta.id}`}
                  className="group block bg-(--bg-secondary) rounded-2xl overflow-hidden border border-(--border) hover:shadow-xl hover:border-blue-200 transition-all duration-300"
                >
                  <div className="h-48 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                    <svg
                      className="w-16 h-16 text-blue-300 group-hover:scale-110 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
                      />
                    </svg>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-(--text-muted) mb-2 font-medium">
                      {formatDate(warta.created_at)}
                    </p>
                    <h3 className="font-bold text-(--text-primary) text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {warta.title}
                    </h3>
                    <p className="text-(--text-secondary) text-sm line-clamp-2">
                      {warta.excerpt || "Klik untuk baca selengkapnya..."}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              href="/warta"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition-all"
            >
              Lihat Semua Warta
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pengumuman Section */}
      <section className="py-16 lg:py-24 bg-(--bg-secondary)">
        <div className="mx-auto px-4 md:px-8 xl:px-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-10">
            <div>
              <p className="text-blue-600 font-semibold text-sm uppercase tracking-wide mb-2">
                Informasi
              </p>
              <h2 className="text-3xl lg:text-4xl font-bold text-(--text-primary)">
                Pengumuman
              </h2>
            </div>
            <Link
              href="/pengumuman"
              className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
          ) : pengumumanData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-(--text-secondary)">Belum ada pengumuman</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pengumumanData.map((item) => (
                <Link
                  key={item.id}
                  href={`/pengumuman/${item.id}`}
                  className="flex flex-col sm:flex-row sm:items-start gap-4 p-6 bg-(--bg-primary) rounded-2xl border border-(--border) hover:shadow-lg hover:border-blue-200 transition-all group"
                >
                  <span
                    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 w-fit ${
                      item.priority === "urgent"
                        ? "bg-red-100 text-red-700"
                        : item.priority === "important"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {item.priority === "urgent"
                      ? "🔴 Mendesak"
                      : item.priority === "important"
                      ? "🟡 Penting"
                      : "ℹ️ Info"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-(--text-primary) text-lg group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-(--text-secondary) mt-1 line-clamp-2">
                      {item.content}
                    </p>
                    <span className="inline-flex items-center gap-1 mt-3 text-blue-600 text-sm font-medium">
                      Baca selengkapnya
                      <svg
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section - Full Width Background */}
      <section className="cta-section relative py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1473177104440-ffee2f376098?w=1920')",
            filter: "brightness(0.3)",
          }}
        />

        <div className="relative z-10 mx-auto px-4 md:px-8 xl:px-16 text-center">
          <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-6">
            Bergabunglah Bersama Kami
          </h2>
          <p className="text-white text-lg lg:text-xl mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-md">
            Mari bertumbuh bersama dalam persekutuan dan pelayanan untuk
            mewujudkan kasih Kristus di Kota Bandar Lampung.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              Kunjungi Kami
            </Link>
            <Link
              href="/keuangan#persembahan"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-xl hover:bg-white/20 transition-all"
            >
              Dukung Pelayanan Kami
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
