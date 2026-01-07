import Link from "next/link";

const wartaData = [
  { id: 1, title: "Renungan Minggu: Kasih yang Sejati", excerpt: "Kasih yang sejati adalah kasih yang tidak mengharapkan balasan, melainkan memberi dengan tulus ikhlas kepada sesama.", date: "6 Jan 2026", author: "Pdt. Andreas" },
  { id: 2, title: "Perayaan Natal 2025 Bersama Jemaat", excerpt: "Dokumentasi perayaan Natal bersama jemaat GKPI Bandar Lampung yang penuh sukacita dan syukur.", date: "25 Des 2025", author: "Admin" },
  { id: 3, title: "Bakti Sosial ke Panti Asuhan", excerpt: "GKPI Bandar Lampung mengadakan bakti sosial ke panti asuhan sebagai wujud kasih kepada sesama.", date: "20 Des 2025", author: "Komisi Diakonia" },
  { id: 4, title: "Persekutuan Pemuda Akhir Tahun", excerpt: "Kegiatan retreat pemuda akhir tahun dengan tema 'Generasi yang Berdampak'.", date: "15 Des 2025", author: "Komisi Pemuda" },
  { id: 5, title: "Pemberkatan Nikah Br. Yohanes & Sr. Maria", excerpt: "Selamat atas pemberkatan nikah saudara Yohanes dan saudari Maria. Tuhan memberkati.", date: "10 Des 2025", author: "Admin" },
  { id: 6, title: "Laporan Kegiatan Sekolah Minggu", excerpt: "Rangkuman kegiatan Sekolah Minggu selama semester ini dengan berbagai program menarik.", date: "5 Des 2025", author: "Komisi Anak" },
];

export default function WartaPage() {
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
      <section className="py-16 md:py-24 bg-white">
        <div className="container">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {wartaData.map((warta) => (
              <Link 
                key={warta.id}
                href={`/warta/${warta.id}`}
                className="group block bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className="h-48 bg-linear-to-br from-blue-100 to-purple-100 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-linear-to-br from-blue-500/10 to-purple-500/10 group-hover:opacity-0 transition-opacity"></div>
                  <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                  </svg>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    <span>{warta.date}</span>
                    <span>•</span>
                    <span>{warta.author}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {warta.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-3">{warta.excerpt}</p>
                  <p className="mt-4 text-blue-600 font-medium group-hover:underline">Baca selengkapnya →</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
