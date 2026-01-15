// Warta Types
// Export feature-specific type definitions here

export interface Warta {
  id: string;
  judul: string;
  konten: string;
  tanggal: string;
  kategori?: string;
  gambar_url?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface WartaRenungan {
  id: string;
  warta_id: string;
  ayat_alkitab: string;
  isi_renungan: string;
}
