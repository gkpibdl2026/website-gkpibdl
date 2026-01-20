// Renungan (Daily Devotion) Types

export interface Renungan {
  id: string;
  title: string;
  date: string;
  ayat_kunci: string;
  referensi: string;
  isi_renungan: string;
  kutipan?: string;
  lagu?: string;
  doa?: string;
  source: 'manual' | 'gkpi_sinode';
  source_url?: string;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface RenunganFormData {
  title: string;
  date: string;
  ayat_kunci: string;
  referensi: string;
  isi_renungan: string;
  kutipan?: string;
  lagu?: string;
  doa?: string;
  visible: boolean;
}

export interface RSSRenunganItem {
  title: string;
  link: string;
  pubDate: string;
  content: string;
  contentSnippet: string;
}

export interface ParsedRenungan {
  title: string;
  date: string;
  ayat_kunci: string;
  referensi: string;
  isi_renungan: string;
  kutipan?: string;
  lagu?: string;
  doa?: string;
  source_url: string;
}
