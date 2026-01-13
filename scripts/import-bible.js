/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import ayat alkitab dari Beeble API
// Jalankan: node scripts/import-bible.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BEEBLE_BASE = 'https://beeble.vercel.app/api/v1';

async function fetchChapter(bookAbbr, chapter, version = 'tb') {
  const url = `${BEEBLE_BASE}/passage/${bookAbbr}/${chapter}?ver=${version}`;
  console.log(`Fetching: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed: ${url} (${res.status})`);
  return res.json();
}

async function importChapter(bookAbbr, chapter, version = 'tb') {
  const { data: book } = await supabase
    .from('bible_books')
    .select('id')
    .eq('book_abbr', bookAbbr)
    .single();
  
  if (!book) throw new Error(`Book ${bookAbbr} not found`);

  const response = await fetchChapter(bookAbbr, chapter, version);
  
  // FIX: response.data.verses bukan response.data
  const versesData = response.data?.verses || [];
  const verses = versesData
    .filter(v => v.type === 'content') // Skip titles
    .map(v => ({
      book_id: book.id,
      chapter: chapter,
      verse: v.verse,
      translation: version.toUpperCase(),
      content: v.content
    }));

  const { error } = await supabase.from('bible_verses').upsert(verses, { 
    onConflict: 'book_id,chapter,verse,translation' 
  });

  if (error) throw error;
  console.log(`✓ ${bookAbbr} ${chapter} (${version.toUpperCase()}) - ${verses.length} ayat`);
}

async function importBook(bookAbbr, totalChapters, version = 'tb') {
  console.log(`\nImporting ${bookAbbr} (${totalChapters} chapters)...`);
  for (let ch = 1; ch <= totalChapters; ch++) {
    await importChapter(bookAbbr, ch, version);
    await new Promise(r => setTimeout(r, 500));
  }
  console.log(`✓ Done: ${bookAbbr}\n`);
}

// =============================================
// CONTOH PENGGUNAAN
// =============================================

// Uncomment salah satu untuk menjalankan:

// Import Yohanes (21 pasal) versi TB
// importBook('Yoh', 21, 'tb');

// Import Mazmur (150 pasal) versi TB
// importBook('Mzm', 150, 'tb');

// Import Matius (28 pasal) versi TB dan BIS
// importBook('Mat', 28, 'tb').then(() => importBook('Mat', 28, 'bis'));

module.exports = { importChapter, importBook };
