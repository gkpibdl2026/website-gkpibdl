import Link from "next/link";

const pengumumanData = [
  { id: 1, title: "Pendaftaran Sekolah Minggu Tahun Ajaran Baru", content: "Pendaftaran Sekolah Minggu tahun ajaran baru telah dibuka. Segera daftarkan putra-putri Anda di sekretariat gereja. Formulir pendaftaran tersedia mulai hari Minggu.", priority: "important", date: "6 Jan 2026" },
  { id: 2, title: "Latihan Paduan Suara", content: "Latihan paduan suara rutin setiap Sabtu pukul 15.00 WIB di ruang musik. Terbuka untuk semua jemaat yang ingin melayani dalam bidang musik.", priority: "normal", date: "5 Jan 2026" },
  { id: 3, title: "Ibadah Tahun Baru 2026", content: "Ibadah syukur tahun baru akan dilaksanakan pada 1 Januari 2026 pukul 10.00 WIB. Mari bersyukur bersama untuk tahun yang baru.", priority: "important", date: "28 Des 2025" },
  { id: 4, title: "Persembahan Khusus untuk Korban Bencana", content: "Gereja membuka persembahan khusus untuk membantu saudara-saudara kita yang terkena bencana. Persembahan dapat diserahkan melalui bendahara gereja.", priority: "urgent", date: "20 Des 2025" },
  { id: 5, title: "Jadwal Konseling Pendeta", content: "Konseling dengan pendeta tersedia setiap Selasa dan Kamis pukul 09.00-12.00 WIB. Silakan hubungi sekretariat untuk membuat janji.", priority: "normal", date: "15 Des 2025" },
];

export default function PengumumanPage() {
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
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl">
          <div className="space-y-6">
            {pengumumanData.map((item) => (
              <div 
                key={item.id}
                className={`p-6 rounded-2xl border-l-4 bg-white shadow-sm hover:shadow-lg transition-all ${
                  item.priority === 'urgent' 
                    ? 'border-l-red-500 bg-red-50/30' 
                    : item.priority === 'important' 
                    ? 'border-l-amber-500 bg-amber-50/30' 
                    : 'border-l-gray-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold shrink-0 w-fit ${
                    item.priority === 'urgent' 
                      ? 'bg-red-100 text-red-700' 
                      : item.priority === 'important' 
                      ? 'bg-amber-100 text-amber-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.priority === 'urgent' ? '🔴 Mendesak' : item.priority === 'important' ? '🟡 Penting' : 'ℹ️ Info'}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 mb-2">{item.date}</p>
                    <h3 className="font-bold text-gray-900 text-xl mb-3">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
