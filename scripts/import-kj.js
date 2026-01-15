/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import Kidung Jemaat dari alkitab.mobi
// Jalankan: node scripts/import-kj.js
// Options: 
//   --start=1 --end=10  (import KJ 1-10 only)
//   --all               (import semua KJ 1-478)

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BASE_URL = 'https://alkitab.mobi/kidung/kj';
const DELAY_MS = 500; // delay between requests to be respectful
const MAX_RETRIES = 3; // akan retry 3x jika error
const RETRY_DELAY = 2000; // delay 2 detik sebelum retry

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Parse HTML content to extract song sections (Reff and Bait)
 * HTML structure from alkitab.mobi:
 * - Reff: <i>Reff:</i><br/> content <br>
 * - Bait: <i><strong>N</strong>.</i>&nbsp; content
 */
function parseSongHtml(html, songNumber) {
  const sections = [];
  
  // Extract title from meta or heading - pattern: "KJ X - Title"
  const titleMatch = html.match(/KJ\s*\d+\s*-\s*([^<\n"]+)/);
  const title = titleMatch ? titleMatch[1].trim() : `Kidung Jemaat ${songNumber}`;
  
  // Find all Reff sections
  // Pattern: <i>Reff:</i><br/> ... content until next <p> or verse
  const reffPattern = /<i>Reff:<\/i><br\/?>\s*([\s\S]*?)(?=<\/p>|<p>|<i><strong>\d+<\/strong>)/gi;
  let reffMatch;
  let reffCount = 0;
  
  while ((reffMatch = reffPattern.exec(html)) !== null) {
    reffCount++;
    let content = reffMatch[1]
      .replace(/<br\/?>/gi, ' ')  // Replace <br> with space
      .replace(/<[^>]*>/g, '')    // Remove all HTML tags
      .replace(/Kembali ke Reff\./gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (content && content.length > 5) {
      // Only add unique reff (avoid duplicates)
      const exists = sections.some(s => s.section === 'reff' && s.content === content);
      if (!exists) {
        sections.push({
          section: 'reff',
          number: reffCount,
          content: content
        });
      }
    }
  }
  
  // Re-number reff after deduplication
  let reffNum = 0;
  sections.forEach(s => {
    if (s.section === 'reff') {
      reffNum++;
      s.number = reffNum;
    }
  });
  
  // Find all Bait (verse) sections
  // Pattern: <i><strong>N</strong>.</i>&nbsp; ... content until next tag
  const versePattern = /<i><strong>(\d+)<\/strong>\.<\/i>&nbsp;\s*([\s\S]*?)(?=<\/p>|<p>|<i>(?:Reff:|<strong>))/gi;
  let verseMatch;
  
  while ((verseMatch = versePattern.exec(html)) !== null) {
    const verseNum = parseInt(verseMatch[1]);
    let content = verseMatch[2]
      .replace(/<br\/?>/gi, ' ')
      .replace(/<[^>]*>/g, '')
      .replace(/Kembali ke Reff\./gi, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (content && content.length > 5) {
      sections.push({
        section: 'bait',
        number: verseNum,
        content: content
      });
    }
  }
  
  // Sort sections: reff first, then bait by number
  sections.sort((a, b) => {
    if (a.section === 'reff' && b.section !== 'reff') return -1;
    if (a.section !== 'reff' && b.section === 'reff') return 1;
    return a.number - b.number;
  });
  
  return { title, sections };
}

/**
 * Fetch dengan retry mechanism
 */
async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res;
      
      // Retry on timeout/server errors
      if (res.status === 504 || res.status === 503 || res.status === 500) {
        console.log(`  ⏳ Server error (${res.status}), retry ${i + 1}/${retries}...`);
        await sleep(RETRY_DELAY * (i + 1));
        continue;
      }
      
      // Don't retry on 404
      if (res.status === 404) return null;
      
      throw new Error(`HTTP ${res.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      console.log(`  ⏳ Network error, retry ${i + 1}/${retries}...`);
      await sleep(RETRY_DELAY * (i + 1));
    }
  }
  throw new Error('Max retries exceeded');
}

async function fetchSong(songNumber) {
  const url = `${BASE_URL}/${songNumber}`;
  
  try {
    const res = await fetchWithRetry(url);
    if (!res) return null; // 404
    
    const html = await res.text();
    return parseSongHtml(html, songNumber);
  } catch (err) {
    console.log(`  ❌ Error fetching KJ ${songNumber}: ${err.message}`);
    return null;
  }
}

async function importSong(songNumber) {
  const songData = await fetchSong(songNumber);
  
  if (!songData || songData.sections.length === 0) {
    return { success: false, reason: 'no data' };
  }
  
  const song = {
    title: songData.title,
    song_number: String(songNumber),
    category: 'KJ',
    lyrics: songData.sections
  };
  
  // Retry database insert juga
  for (let i = 0; i < MAX_RETRIES; i++) {
    const { error } = await supabase
      .from('songs')
      .upsert(song, { onConflict: 'song_number,category' });
    
    if (!error) {
      return { success: true, title: songData.title, sectionCount: songData.sections.length };
    }
    
    if (i < MAX_RETRIES - 1) {
      console.log(`  ⏳ DB Error, retry ${i + 1}/${MAX_RETRIES}...`);
      await sleep(RETRY_DELAY);
    } else {
      console.log(`  ❌ DB Error KJ ${songNumber}: ${error.message}`);
      return { success: false, reason: error.message };
    }
  }
  
  return { success: false, reason: 'unknown error' };
}

async function run() {
  const args = process.argv.slice(2);
  let start = 1;
  let end = 10; // default: import first 10
  
  // Parse arguments
  for (const arg of args) {
    if (arg === '--all') {
      end = 478;
    } else if (arg.startsWith('--start=')) {
      start = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--end=')) {
      end = parseInt(arg.split('=')[1]);
    }
  }
  
  console.log(`\n🎵 Import Kidung Jemaat dari alkitab.mobi`);
  console.log(`   Range: KJ ${start} - KJ ${end}`);
  console.log(`   Retry: ${MAX_RETRIES}x per lagu\n`);
  
  let success = 0;
  let failed = 0;
  const failedList = [];
  
  for (let i = start; i <= end; i++) {
    const result = await importSong(i);
    
    if (result.success) {
      console.log(`✓ KJ ${i}: ${result.title} (${result.sectionCount} sections)`);
      success++;
    } else {
      console.log(`✗ KJ ${i}: ${result.reason}`);
      failed++;
      failedList.push(i);
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log(`\n📊 Hasil Import:`);
  console.log(`   ✅ Berhasil: ${success}`);
  console.log(`   ❌ Gagal: ${failed}`);
  console.log(`   📝 Total: ${success + failed}`);
  
  if (failedList.length > 0) {
    console.log(`\n⚠️  Yang gagal: KJ ${failedList.join(', ')}`);
    console.log(`   Jalankan ulang: node scripts/import-kj.js --start=${failedList[0]} --end=${failedList[failedList.length - 1]}`);
  }
  
  console.log('');
}

run();
