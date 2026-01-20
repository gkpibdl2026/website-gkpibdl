// Renungan Services
// Business logic for parsing RSS and processing renungan data

import type { ParsedRenungan } from '../types';

/**
 * Strip HTML tags from content
 */
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp;
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&lsquo;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Parse RSS content from GKPI Sinode to extract renungan data
 */
/**
 * Parse RSS content from GKPI Sinode to extract renungan data
 */
export function parseRenunganContent(content: string, title: string, link: string, pubDate: string): ParsedRenungan {
  // Strip HTML tags first
  const cleanContent = stripHtml(content);
  
  // Extract date from content (format: "Selasa, 20 Januari 2026" or "Minggu, 11 Januari 2026")
  const dateMatch = cleanContent.match(/([A-Za-z]+),\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  let date = new Date().toISOString().split('T')[0]; // Default to today
  
  // Priority 1: Extract date from content (format: "Selasa, 20 Januari 2026")
  // This is the most accurate as it's written in the text
  if (dateMatch) {
    const monthMap: Record<string, string> = {
      'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
      'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
      'september': '09', 'oktober': '10', 'november': '11', 'desember': '12'
    };
    const day = dateMatch[2].padStart(2, '0');
    const month = monthMap[dateMatch[3].toLowerCase()] || '01';
    const year = dateMatch[4];
    date = `${year}-${month}-${day}`;
  } 
  // Priority 2: Use pubDate from RSS if content regex failed
  else if (pubDate) {
    const pubDateObj = new Date(pubDate);
    // Add 7 hours (in milliseconds) to convert to WIB manually
    const WIB_OFFSET = 7 * 60 * 60 * 1000;
    const wibDate = new Date(pubDateObj.getTime() + WIB_OFFSET);
    date = wibDate.toISOString().split('T')[0];
  }

  // Extract referensi (book reference)
  // Pattern 1: (2 Korintus 12:9) or (Rut 1 : 16) - allow spaces around colon
  const refInParens = cleanContent.match(/\(([1-3]?\s*[A-Za-z]+\s+\d+\s*:\s*\d+(?:-\d+)?)\)/);
  // Pattern 2: (Yes. 42:1) - abbreviated
  const refAbbrev = cleanContent.match(/\(([A-Za-z]+\.?\s+\d+\s*:\s*\d+(?:-\d+)?)\)/);
  
  let referensi = '';
  let ayat_kunci = '';
  
  if (refInParens) {
    referensi = refInParens[1].trim();
  } else if (refAbbrev) {
    referensi = refAbbrev[1].trim();
  }

  // Extract the verse text (ayat kunci)
  // Look for text in quotes OR text before the reference
  const ayatMatch = cleanContent.match(/[""]([^""]+)[""]|^[^(]+(?=\()/);
  if (ayatMatch) {
    ayat_kunci = ayatMatch[1] ? ayatMatch[1].trim() : ayatMatch[0].trim();
    // Clean up - remove date from ayat_kunci if it got caught
    ayat_kunci = ayat_kunci.replace(/^[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*/i, '').trim();
    // Remove "The post ... first appeared on ..." garbage if present
    ayat_kunci = ayat_kunci.replace(/The post.*?first appeared on.*?\.?/g, '').trim();
  }
  
  // If ayat_kunci is empty, try to get first sentence
  if (!ayat_kunci && cleanContent.length > 0) {
    const firstSentence = cleanContent.split(/[.!?]/)[0];
    if (firstSentence) {
      ayat_kunci = firstSentence.replace(/^[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*/i, '').trim();
    }
  }

  // Extract kutipan (quote) - usually starts with "Kutipan Renungan:"
  const kutipanMatch = cleanContent.match(/Kutipan Renungan:\s*([^]*?)(?=Lagu:|Doa:|$)/i);
  const kutipan = kutipanMatch ? kutipanMatch[1].trim() : undefined;

  // Extract lagu (song) - usually starts with "Lagu:" and ends before "Doa:"
  const laguMatch = cleanContent.match(/Lagu:\s*([^]*?)(?=\s*Doa:|$)/i);
  let lagu = laguMatch ? laguMatch[1].trim() : undefined;
  
  // Clean up lagu - remove any trailing garbage
  if (lagu) {
    lagu = lagu.replace(/The post.*?first appeared on.*?GKPI Sinode\.?/gi, '').trim();
  }

  // Extract doa (prayer) - usually starts with "Doa:"
  const doaMatch = cleanContent.match(/Doa:\s*([^]*?)(?=Kutipan Renungan:|Lagu:|$)/i);
  let doa = doaMatch ? doaMatch[1].trim() : undefined;
  
  // Clean up doa - remove "The post ... first appeared on GKPI Sinode." garbage
  if (doa) {
    doa = doa.replace(/The post.*?first appeared on.*?GKPI Sinode\.?/gi, '').trim();
    // Also remove any "Amin." suffix cleanup if needed
    doa = doa.replace(/\s*Amin\.?\s*$/, ' Amin.').trim();
  }

  // Clean up isi_renungan (main content)
  let isi_renungan = cleanContent;
  
  // Remove date line
  isi_renungan = isi_renungan.replace(/^[A-Za-z]+,\s+\d{1,2}\s+[A-Za-z]+\s+\d{4}\s*/i, '');
  
  // Remove ayat_kunci from isi (to avoid duplication since it's shown separately)
  if (ayat_kunci && ayat_kunci.length > 10) {
    // Escape special regex characters in ayat_kunci
    const escapedAyat = ayat_kunci.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    isi_renungan = isi_renungan.replace(new RegExp(escapedAyat, 'gi'), '');
    // Also remove if it starts with the verse reference pattern
    isi_renungan = isi_renungan.replace(new RegExp(`^\\s*[""]?${escapedAyat}[""]?\\s*`, 'i'), '');
  }
  
  // Remove reference pattern at start (e.g., "(2 Korintus 12:9)")
  if (referensi) {
    const escapedRef = referensi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    isi_renungan = isi_renungan.replace(new RegExp(`\\(${escapedRef}\\)`, 'gi'), '');
  }
  
  // Remove kutipan, lagu, doa sections from main content
  isi_renungan = isi_renungan.replace(/Kutipan Renungan:\s*[^]*?(?=Lagu:|Doa:|$)/gi, '');
  isi_renungan = isi_renungan.replace(/Lagu:\s*[^\n]+/gi, '');
  isi_renungan = isi_renungan.replace(/Doa:\s*[^]*$/gi, '');
  
  // Clean up whitespace
  isi_renungan = isi_renungan.trim();

  return {
    title: stripHtml(title),
    date,
    ayat_kunci,
    referensi,
    isi_renungan,
    kutipan,
    lagu,
    doa,
    source_url: link,
  };
}

/**
 * Format date for display in Indonesian
 */
export function formatDateIndonesian(dateString: string): string {
  const date = new Date(dateString);
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}
