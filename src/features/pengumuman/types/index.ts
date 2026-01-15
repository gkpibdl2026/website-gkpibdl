// Pengumuman Types
// Export feature-specific type definitions here

export interface Pengumuman {
  id: string;
  judul: string;
  konten: string;
  tanggal_mulai?: string;
  tanggal_selesai?: string;
  prioritas?: 'tinggi' | 'sedang' | 'rendah';
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
