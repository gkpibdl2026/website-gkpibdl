/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import Alkitab Batak Toba dari Beeble API
// Jalankan: node scripts/import-toba.js
// Options:
//   --book=Kej           (import satu kitab saja)
//   --start=1 --end=10   (import kitab 1-10)
//   --all                (import semua 66 kitab)

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BEEBLE_BASE = 'https://beeble.vercel.app/api/v1';
const TRANSLATION = 'TOBA';
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const DELAY_MS = 600;

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (res.status === 504 || res.status === 503 || res.status === 500) {
        console.log(`  ⏳ Timeout, retry ${i + 1}/${retries}...`);
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }
      if (res.status === 404) return null;
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  ⏳ Error, retry ${i + 1}/${retries}...`);
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

async function importChapter(bookAbbr, chapter, bookId) {
  const url = `${BEEBLE_BASE}/passage/${bookAbbr}/${chapter}?ver=toba`;
  
  try {
    const response = await fetchWithRetry(url);
    if (!response || !response.data) return { success: false, count: 0 };
    
    const versesData = response.data?.verses || [];
    const verses = versesData
      .filter(v => v.type === 'content' && v.verse > 0)
      .map(v => ({
        book_id: bookId,
        chapter: chapter,
        verse: v.verse,
        translation: TRANSLATION,
        content: v.content
      }));

    if (verses.length === 0) return { success: true, count: 0 };

    const { error } = await supabase.from('bible_verses').upsert(verses, { 
      onConflict: 'book_id,chapter,verse,translation' 
    });

    if (error) throw error;
    return { success: true, count: verses.length };
  } catch (err) {
    console.log(`    ❌ Pasal ${chapter}: ${err.message}`);
    return { success: false, count: 0 };
  }
}

async function importBook(bookAbbr, totalChapters) {
  // Get book ID from database
  const { data: book } = await supabase
    .from('bible_books')
    .select('id, book_name')
    .eq('book_abbr', bookAbbr)
    .single();
  
  if (!book) {
    console.log(`❌ ${bookAbbr} tidak ditemukan di database`);
    return { success: 0, failed: 0 };
  }

  console.log(`\n📖 ${book.book_name} (${bookAbbr}) - ${totalChapters} pasal`);
  
  let success = 0;
  let failed = 0;
  let totalVerses = 0;

  for (let ch = 1; ch <= totalChapters; ch++) {
    const result = await importChapter(bookAbbr, ch, book.id);
    
    if (result.success) {
      process.stdout.write(`  ✓ Pasal ${ch} (${result.count} ayat)\r`);
      success++;
      totalVerses += result.count;
    } else {
      console.log(`  ✗ Pasal ${ch} gagal`);
      failed++;
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log(`\n  📊 ${book.book_name}: ${success}/${totalChapters} pasal, ${totalVerses} ayat`);
  return { success, failed };
}

// Daftar kitab dengan singkatan dan jumlah pasal
const BOOKS = [
  // Perjanjian Lama
  { abbr: 'Kej', chapters: 50 },
  { abbr: 'Kel', chapters: 40 },
  { abbr: 'Im', chapters: 27 },
  { abbr: 'Bil', chapters: 36 },
  { abbr: 'Ul', chapters: 34 },
  { abbr: 'Yos', chapters: 24 },
  { abbr: 'Hak', chapters: 21 },
  { abbr: 'Rut', chapters: 4 },
  { abbr: '1Sam', chapters: 31 },
  { abbr: '2Sam', chapters: 24 },
  { abbr: '1Raj', chapters: 22 },
  { abbr: '2Raj', chapters: 25 },
  { abbr: '1Taw', chapters: 29 },
  { abbr: '2Taw', chapters: 36 },
  { abbr: 'Ezr', chapters: 10 },
  { abbr: 'Neh', chapters: 13 },
  { abbr: 'Est', chapters: 10 },
  { abbr: 'Ayb', chapters: 42 },
  { abbr: 'Mzm', chapters: 150 },
  { abbr: 'Ams', chapters: 31 },
  { abbr: 'Pkh', chapters: 12 },
  { abbr: 'Kid', chapters: 8 },
  { abbr: 'Yes', chapters: 66 },
  { abbr: 'Yer', chapters: 52 },
  { abbr: 'Rat', chapters: 5 },
  { abbr: 'Yeh', chapters: 48 },
  { abbr: 'Dan', chapters: 12 },
  { abbr: 'Hos', chapters: 14 },
  { abbr: 'Yl', chapters: 3 },
  { abbr: 'Am', chapters: 9 },
  { abbr: 'Ob', chapters: 1 },
  { abbr: 'Yun', chapters: 4 },
  { abbr: 'Mi', chapters: 7 },
  { abbr: 'Nah', chapters: 3 },
  { abbr: 'Hab', chapters: 3 },
  { abbr: 'Zef', chapters: 3 },
  { abbr: 'Hag', chapters: 2 },
  { abbr: 'Za', chapters: 14 },
  { abbr: 'Mal', chapters: 4 },
  // Perjanjian Baru
  { abbr: 'Mat', chapters: 28 },
  { abbr: 'Mrk', chapters: 16 },
  { abbr: 'Luk', chapters: 24 },
  { abbr: 'Yoh', chapters: 21 },
  { abbr: 'Kis', chapters: 28 },
  { abbr: 'Rm', chapters: 16 },
  { abbr: '1Kor', chapters: 16 },
  { abbr: '2Kor', chapters: 13 },
  { abbr: 'Gal', chapters: 6 },
  { abbr: 'Ef', chapters: 6 },
  { abbr: 'Flp', chapters: 4 },
  { abbr: 'Kol', chapters: 4 },
  { abbr: '1Tes', chapters: 5 },
  { abbr: '2Tes', chapters: 3 },
  { abbr: '1Tim', chapters: 6 },
  { abbr: '2Tim', chapters: 4 },
  { abbr: 'Tit', chapters: 3 },
  { abbr: 'Flm', chapters: 1 },
  { abbr: 'Ibr', chapters: 13 },
  { abbr: 'Yak', chapters: 5 },
  { abbr: '1Ptr', chapters: 5 },
  { abbr: '2Ptr', chapters: 3 },
  { abbr: '1Yoh', chapters: 5 },
  { abbr: '2Yoh', chapters: 1 },
  { abbr: '3Yoh', chapters: 1 },
  { abbr: 'Yud', chapters: 1 },
  { abbr: 'Why', chapters: 22 },
];

async function run() {
  const args = process.argv.slice(2);
  let booksToImport = [];
  
  // Parse arguments
  const bookArg = args.find(a => a.startsWith('--book='));
  const startArg = args.find(a => a.startsWith('--start='));
  const endArg = args.find(a => a.startsWith('--end='));
  const allArg = args.includes('--all');
  
  if (bookArg) {
    const abbr = bookArg.split('=')[1];
    const book = BOOKS.find(b => b.abbr.toLowerCase() === abbr.toLowerCase());
    if (book) booksToImport = [book];
    else {
      console.log(`❌ Kitab "${abbr}" tidak ditemukan`);
      return;
    }
  } else if (startArg || endArg || allArg) {
    const start = startArg ? parseInt(startArg.split('=')[1]) - 1 : 0;
    const end = endArg ? parseInt(endArg.split('=')[1]) : (allArg ? 66 : 5);
    booksToImport = BOOKS.slice(start, end);
  } else {
    // Default: import first 5 books
    booksToImport = BOOKS.slice(0, 5);
  }
  
  console.log(`\n📚 Import Alkitab Batak Toba (TOBA)`);
  console.log(`   Jumlah kitab: ${booksToImport.length}`);
  console.log(`   Retry: ${MAX_RETRIES}x per pasal\n`);
  
  let totalSuccess = 0;
  let totalFailed = 0;
  
  for (const book of booksToImport) {
    const result = await importBook(book.abbr, book.chapters);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }
  
  console.log(`\n${'='.repeat(50)}`);
  console.log(`📊 HASIL IMPORT ALKITAB BATAK TOBA:`);
  console.log(`   ✅ Pasal berhasil: ${totalSuccess}`);
  console.log(`   ❌ Pasal gagal: ${totalFailed}`);
  console.log(`${'='.repeat(50)}\n`);
}

run();
