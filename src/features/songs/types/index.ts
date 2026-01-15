// Songs Types
// Export feature-specific type definitions here

export interface Song {
  id: string;
  judul: string;
  lirik?: string;
  nada_dasar?: string;
  kategori?: string;
  created_at?: string;
  updated_at?: string;
}
