import Link from "next/link";

const keuanganData = [
  { id: 1, period: "Desember 2025", pemasukan: 45000000, pengeluaran: 38000000, saldo: 157000000, document: null },
  { id: 2, period: "November 2025", pemasukan: 42000000, pengeluaran: 35000000, saldo: 150000000, document: null },
  { id: 3, period: "Oktober 2025", pemasukan: 48000000, pengeluaran: 40000000, saldo: 143000000, document: null },
  { id: 4, period: "September 2025", pemasukan: 40000000, pengeluaran: 42000000, saldo: 135000000, document: null },
  { id: 5, period: "Agustus 2025", pemasukan: 44000000, pengeluaran: 37000000, saldo: 137000000, document: null },
];

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

export default function KeuanganPage() {
  const totalPemasukan = keuanganData.reduce((sum, item) => sum + item.pemasukan, 0);
  const totalPengeluaran = keuanganData.reduce((sum, item) => sum + item.pengeluaran, 0);

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
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Laporan Keuangan</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Transparansi keuangan gereja untuk pertanggungjawaban bersama jemaat.
          </p>
        </div>
      </section>

      {/* Summary Cards */}
      <section className="py-12 bg-gray-50">
        <div className="container">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Saldo Terakhir</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(keuanganData[0].saldo)}</p>
              <p className="text-gray-400 text-sm mt-2">{keuanganData[0].period}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Total Pemasukan (5 bulan)</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPemasukan)}</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <p className="text-gray-500 text-sm mb-1">Total Pengeluaran (5 bulan)</p>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalPengeluaran)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Keuangan List */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Rincian Per Bulan</h2>
          
          <div className="space-y-4">
            {keuanganData.map((item) => (
              <div 
                key={item.id}
                className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hover:shadow-md transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{item.period}</h3>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <span className="text-green-600 text-sm">
                        ↑ Pemasukan: {formatCurrency(item.pemasukan)}
                      </span>
                      <span className="text-red-600 text-sm">
                        ↓ Pengeluaran: {formatCurrency(item.pengeluaran)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-sm">Saldo</p>
                    <p className="text-xl font-bold text-gray-900">{formatCurrency(item.saldo)}</p>
                  </div>
                </div>
                {item.document && (
                  <a 
                    href={item.document} 
                    className="inline-flex items-center gap-2 mt-4 text-blue-600 font-medium hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Download Laporan PDF
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Note */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-4xl text-center">
          <p className="text-gray-600">
            Laporan keuangan lengkap dapat diminta di sekretariat gereja atau hubungi bendahara.
          </p>
        </div>
      </section>
    </>
  );
}
