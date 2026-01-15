// Keuangan Types
// Export feature-specific type definitions here

export interface LaporanKeuangan {
  id: string;
  periode: string;
  tanggal_laporan: string;
  pemasukan: number;
  pengeluaran: number;
  saldo: number;
  keterangan?: string;
  kategori?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TransaksiKeuangan {
  id: string;
  laporan_id: string;
  tanggal: string;
  jenis: 'pemasukan' | 'pengeluaran';
  nominal: number;
  deskripsi: string;
  kategori?: string;
}
