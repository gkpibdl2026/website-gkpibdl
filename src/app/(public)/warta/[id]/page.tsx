import Link from "next/link";
import { notFound } from "next/navigation";

// Mock data - akan diganti dengan database query
const wartaData: Record<string, {
  title: string;
  content: string;
  date: string;
  author: string;
}> = {
  "1": {
    title: "Renungan Minggu: Kasih yang Sejati",
    content: `
      <p>Kasih yang sejati adalah kasih yang tidak mengharapkan balasan, melainkan memberi dengan tulus ikhlas kepada sesama. Dalam 1 Korintus 13, rasul Paulus menuliskan tentang kasih yang sempurna.</p>
      
      <h2>Kasih Itu Sabar dan Murah Hati</h2>
      <p>Kasih itu sabar; kasih itu murah hati; ia tidak cemburu. Ia tidak memegahkan diri dan tidak sombong. Ia tidak melakukan yang tidak sopan dan tidak mencari keuntungan diri sendiri.</p>
      
      <h2>Kasih Tidak Pernah Berkesudahan</h2>
      <p>Kasih tidak pernah berkesudahan. Nubuat akan berakhir; bahasa roh akan berhenti; pengetahuan akan lenyap. Sebab pengetahuan kita tidak lengkap dan nubuat kita tidak sempurna.</p>
      
      <p>Marilah kita terus mengasihi sesama seperti Kristus telah mengasihi kita. Karena kasih adalah perintah yang terutama.</p>
    `,
    date: "6 Januari 2026",
    author: "Pdt. Andreas"
  },
  "2": {
    title: "Perayaan Natal 2025 Bersama Jemaat",
    content: `
      <p>Puji Tuhan, perayaan Natal 2025 di GKPI Bandar Lampung telah berlangsung dengan penuh sukacita. Acara dihadiri oleh seluruh jemaat dan tamu undangan.</p>
      
      <h2>Rangkaian Acara</h2>
      <p>Perayaan dimulai dengan ibadah syukur yang dipimpin oleh Pdt. Andreas. Dilanjutkan dengan persembahan pujian dari paduan suara dan penampilan drama dari anak-anak Sekolah Minggu.</p>
      
      <h2>Ucapan Terima Kasih</h2>
      <p>Terima kasih kepada seluruh panitia dan jemaat yang telah berpartisipasi dalam menyukseskan acara ini. Kiranya sukacita Natal tetap menyertai kita sepanjang tahun.</p>
    `,
    date: "25 Desember 2025",
    author: "Admin"
  },
  "3": {
    title: "Bakti Sosial ke Panti Asuhan",
    content: `
      <p>Sebagai wujud kasih kepada sesama, GKPI Bandar Lampung mengadakan bakti sosial ke Panti Asuhan Kasih Ibu pada tanggal 20 Desember 2025.</p>
      
      <h2>Kegiatan yang Dilakukan</h2>
      <p>Kegiatan meliputi pemberian sembako, pakaian layak pakai, dan perlengkapan sekolah untuk anak-anak panti. Selain itu, jemaat juga mengadakan games dan hiburan bersama anak-anak.</p>
      
      <h2>Harapan Ke Depan</h2>
      <p>Semoga kegiatan ini dapat menjadi berkat bagi anak-anak panti asuhan dan dapat terus dilaksanakan secara rutin sebagai bentuk pelayanan diakonia gereja.</p>
    `,
    date: "20 Desember 2025",
    author: "Komisi Diakonia"
  }
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function WartaDetailPage({ params }: Props) {
  const { id } = await params;
  const warta = wartaData[id];

  if (!warta) {
    notFound();
  }

  return (
    <>
      {/* Header */}
      <section className="bg-linear-to-br from-blue-600 to-purple-700 text-white py-16 md:py-24">
        <div className="container max-w-4xl">
          <Link href="/warta" className="inline-flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Kembali ke Warta
          </Link>
          <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">{warta.title}</h1>
          <div className="flex items-center gap-4 text-blue-100">
            <span>{warta.date}</span>
            <span>•</span>
            <span>{warta.author}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container max-w-3xl">
          <article 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-bold prose-p:text-gray-600 prose-p:leading-relaxed"
            dangerouslySetInnerHTML={{ __html: warta.content }}
          />
        </div>
      </section>

      {/* Navigation */}
      <section className="py-12 bg-gray-50">
        <div className="container max-w-3xl">
          <div className="flex justify-between items-center">
            <Link href="/warta" className="inline-flex items-center gap-2 text-blue-600 font-medium hover:underline">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Kembali ke Daftar Warta
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
