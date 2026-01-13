/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import SELURUH Alkitab (66 kitab)
// Jalankan: node scripts/import-all-bible.js

require('dotenv').config({ path: '.env.local' });
const { importBook } = require('./import-bible.js');

// Daftar semua kitab dengan jumlah pasal
const ALL_BOOKS = [
  // Perjanjian Lama (39 kitab)
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
  // Perjanjian Baru (27 kitab)
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

async function importAllBible(version = 'tb', startFrom = 0) {
  const totalBooks = ALL_BOOKS.length;
  const totalChapters = ALL_BOOKS.reduce((sum, b) => sum + b.chapters, 0);
  
  console.log(`\n📖 IMPORT SELURUH ALKITAB (${version.toUpperCase()})`);
  console.log(`   ${totalBooks} kitab, ${totalChapters} pasal`);
  console.log(`   Estimasi waktu: ~${Math.ceil(totalChapters * 0.6 / 60)} menit\n`);
  
  let completed = 0;
  let failed = [];

  for (let i = startFrom; i < ALL_BOOKS.length; i++) {
    const book = ALL_BOOKS[i];
    try {
      console.log(`\n[${i + 1}/${totalBooks}] ${book.abbr} (${book.chapters} pasal)`);
      await importBook(book.abbr, book.chapters, version);
      completed++;
    } catch (err) {
      console.error(`❌ Error: ${book.abbr} - ${err.message}`);
      failed.push(book.abbr);
    }
  }

  console.log('\n========================================');
  console.log(`✅ Selesai: ${completed}/${totalBooks} kitab`);
  if (failed.length > 0) {
    console.log(`❌ Gagal: ${failed.join(', ')}`);
  }
  console.log('========================================\n');
}

// Jalankan import
const version = process.argv[2] || 'tb';
const startFrom = parseInt(process.argv[3]) || 0;

importAllBible(version, startFrom);
