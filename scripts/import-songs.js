/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import lagu KJ dari kidung-jemaat-api
// Jalankan: node scripts/import-songs.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const KIDUNG_API = 'https://kidung-jemaat-api.vercel.app/api/graphql';

async function fetchSong(number) {
  const query = `{ song(number: ${number}) { number title verses { number content } } }`;
  const res = await fetch(KIDUNG_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const { data } = await res.json();
  return data?.song;
}

async function importSong(number, category = 'KJ') {
  const song = await fetchSong(number);
  if (!song) {
    console.log(`⚠ ${category} ${number} not found`);
    return;
  }

  const { error } = await supabase.from('songs').upsert({
    title: song.title,
    song_number: String(number),
    category: category,
    lyrics: song.verses.map(v => ({ verse: v.number, content: v.content }))
  }, { onConflict: 'song_number,category' });

  if (error) throw error;
  console.log(`✓ ${category} ${number}: ${song.title}`);
}

async function importAllKJ(start = 1, end = 478) {
  console.log(`\nImporting KJ ${start}-${end}...`);
  for (let i = start; i <= end; i++) {
    try {
      await importSong(i, 'KJ');
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`Error KJ ${i}:`, err.message);
    }
  }
  console.log('\n✓ Done!\n');
}

// =============================================
// CONTOH PENGGUNAAN
// =============================================

// Uncomment salah satu untuk menjalankan:

// Import semua 478 lagu KJ
// importAllKJ();

// Import sebagian: KJ 1-50
// importAllKJ(1, 50);

// Import satu lagu saja
// importSong(21, 'KJ');

module.exports = { importSong, importAllKJ };
