/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import ulang kitab yang gagal (dengan retry)
// Jalankan: node scripts/import-retry.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BEEBLE_BASE = 'https://beeble.vercel.app/api/v1';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 detik

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (res.status === 504 || res.status === 503) {
        console.log(`  ⏳ Timeout, retry ${i + 1}/${retries}...`);
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  ⏳ Error, retry ${i + 1}/${retries}...`);
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

async function importChapter(bookAbbr, chapter, version, bookId) {
  const url = `${BEEBLE_BASE}/passage/${bookAbbr}/${chapter}?ver=${version}`;
  const response = await fetchWithRetry(url);
  
  const versesData = response.data?.verses || [];
  const verses = versesData
    .filter(v => v.type === 'content')
    .map(v => ({
      book_id: bookId,
      chapter: chapter,
      verse: v.verse,
      translation: version.toUpperCase(),
      content: v.content
    }));

  const { error } = await supabase.from('bible_verses').upsert(verses, { 
    onConflict: 'book_id,chapter,verse,translation' 
  });

  if (error) throw error;
  return verses.length;
}

async function importBook(bookAbbr, totalChapters, version = 'tb') {
  const { data: book } = await supabase
    .from('bible_books')
    .select('id')
    .eq('book_abbr', bookAbbr)
    .single();
  
  if (!book) {
    console.log(`❌ ${bookAbbr} not found in database`);
    return false;
  }

  console.log(`\n📖 ${bookAbbr} (${totalChapters} pasal)...`);
  let success = 0;
  let failed = [];

  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const count = await importChapter(bookAbbr, ch, version, book.id);
      console.log(`  ✓ Pasal ${ch} (${count} ayat)`);
      success++;
      await sleep(600);
    } catch (err) {
      console.log(`  ❌ Pasal ${ch} gagal: ${err.message}`);
      failed.push(ch);
    }
  }

  console.log(`✅ ${bookAbbr}: ${success}/${totalChapters} pasal`);
  if (failed.length > 0) {
    console.log(`   Gagal: pasal ${failed.join(', ')}`);
  }
  return failed.length === 0;
}

async function run() {
  console.log('\n🔄 Import ulang kitab yang gagal...\n');
  
  const books = [
    { abbr: 'Kej', chapters: 50 },
    { abbr: 'Im', chapters: 27 },
    { abbr: 'Yos', chapters: 24 },
    { abbr: '1Raj', chapters: 22 },
    { abbr: '2Raj', chapters: 25 },
    { abbr: '1Taw', chapters: 29 },
    { abbr: 'Mrk', chapters: 16 },
    { abbr: '1Yoh', chapters: 5 },
  ];

  for (const book of books) {
    await importBook(book.abbr, book.chapters, 'tb');
  }
  
  console.log('\n✅ Selesai import ulang!\n');
}

run();
