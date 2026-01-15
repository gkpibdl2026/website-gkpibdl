// Jadwal Types
// Export feature-specific type definitions here

export interface Jadwal {
  id: string;
  judul: string;
  tanggal: string;
  waktu: string;
  lokasi?: string;
  deskripsi?: string;
  jenis_ibadah?: string;
  created_at?: string;
  updated_at?: string;
}
