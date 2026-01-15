/* eslint-disable @typescript-eslint/no-require-imports */
// Script untuk import Buku Ende dari BatakPedia.org
// Jalankan: node scripts/import-be.js
// Options:
//   --start=1 --end=100  (import BE 1-100 only)
//   --all                (import semua BE 1-864)
//   --fetch-urls         (hanya fetch daftar URL, simpan ke file)

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const INDEX_URL = 'https://batakpedia.org/daftar-lagu-buku-ende/';
const DELAY_MS = 800; // delay between requests
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;
const URLS_FILE = path.join(__dirname, 'be-urls.json');

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.text();
      if (res.status === 429 || res.status === 503 || res.status === 500) {
        console.log(`  ⏳ Rate limit/server error, retry ${i + 1}/${retries}...`);
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

/**
 * Fetch semua URL lagu dari halaman indeks BatakPedia
 */
async function fetchSongUrls() {
  console.log('📋 Fetching daftar URL lagu dari BatakPedia...');
  
  const urls = [];
  let page = 1;
  let hasMore = true;
  
  // BatakPedia has pagination, we need to fetch multiple pages
  while (hasMore) {
    const pageUrl = page === 1 ? INDEX_URL : `${INDEX_URL}page/${page}/`;
    console.log(`   Fetching page ${page}...`);
    
    try {
      const html = await fetchWithRetry(pageUrl);
      if (!html) {
        hasMore = false;
        break;
      }
      
      // Extract BE song links - pattern: /be-NUMBER-slug/
      const linkPattern = /href="(https:\/\/batakpedia\.org\/be-(\d+)-[^"]+)"/gi;
      let match;
      let foundOnPage = 0;
      
      while ((match = linkPattern.exec(html)) !== null) {
        const url = match[1];
        const number = parseInt(match[2]);
        
        // Avoid duplicates
        if (!urls.find(u => u.number === number)) {
          urls.push({ number, url });
          foundOnPage++;
        }
      }
      
      console.log(`   Found ${foundOnPage} new songs on page ${page}`);
      
      if (foundOnPage === 0) {
        hasMore = false;
      } else {
        page++;
        await sleep(DELAY_MS);
      }
      
      // Safety limit
      if (page > 50) {
        console.log('   Reached page limit, stopping...');
        hasMore = false;
      }
    } catch (err) {
      console.log(`   Error fetching page ${page}: ${err.message}`);
      hasMore = false;
    }
  }
  
  // Sort by number
  urls.sort((a, b) => a.number - b.number);
  
  console.log(`\n✅ Total URLs found: ${urls.length}`);
  return urls;
}

const cheerio = require('cheerio');

/**
 * Parse HTML lagu untuk extract lirik using Cheerio
 */
function parseSongHtml(html, songNumber) {
  const $ = cheerio.load(html);
  
  // Extract title
  let title = $('title').text().replace(' - BatakPedia', '').trim();
  if (!title || title === 'BatakPedia') {
    title = $('h1').first().text().trim();
  }
  
  // Find lyrics content container
  let contentContainer = $('.content-inner');
  if (contentContainer.length === 0) contentContainer = $('.entry-content');
  if (contentContainer.length === 0) contentContainer = $('.td-post-content');
  
  const sections = [];
  
  if (contentContainer.length > 0) {
    let currentVerseNum = 0;
    let currentLines = [];
    
    // Function to flush current verse
    const flushVerse = () => {
        if (currentVerseNum > 0 && currentLines.length > 0) {
            // Clean up lines: remove empty, trim
            const cleanLines = currentLines
                .map(l => l.replace(/\s+/g, ' ').trim()) // Compress internal whitespace
                .filter(l => l.length > 0);
            
            if (cleanLines.length > 0) {
                sections.push({
                    section: 'bait',
                    number: currentVerseNum,
                    content: cleanLines.join('\n')
                });
            }
            currentLines = [];
        }
    };

    // Iterate over ALL children elements (p, pre, div, etc)
    contentContainer.children().each((i, el) => {
      const tag = $(el).prop('tagName').toLowerCase();
      let text = $(el).text();
      
      // Skip empty text nodes if any (cheerio usually handles elements)
      if (!text || !text.trim()) return;

      // Handle PRE/CODE tags (BE 74, 75 case)
      if (tag === 'pre' || tag === 'code') {
          // Pre text often has newlines we want to preserve as separate lines
          const lines = text.split('\n');
          lines.forEach(line => {
              const trimmed = line.trim();
              if (!trimmed || trimmed.includes('Download') || trimmed.includes('Previous')) return;
              
              // Check if line is just a number (e.g. "2")
              if (/^\d+\.?$/.test(trimmed)) {
                  flushVerse();
                  currentVerseNum = parseInt(trimmed.replace('.', ''));
                  return;
              }

              // Check if line starts with number "1. Lyrics"
              const combinedMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
              if (combinedMatch) {
                  flushVerse();
                  currentVerseNum = parseInt(combinedMatch[1]);
                  currentLines.push(combinedMatch[2].trim());
                  return;
              }
              
              // Special case: If content found but Verse is 0, assume it's Verse 1
              // (BE 75 case where "1" is missing or implicit at start)
              if (currentVerseNum === 0) {
                  currentVerseNum = 1;
              }

              currentLines.push(trimmed);
          });
          return;
      }
      
      text = text.trim();

      // Case 1: Just a number "1" or "1." -> Start of new verse
      if (/^\d+\.?$/.test(text)) {
          flushVerse();
          currentVerseNum = parseInt(text.replace('.', ''));
          return;
      }
      
      // Case 2: Number combined with text "1. Ringgas..." -> Start of new verse
      const combinedMatch = text.match(/^(\d+)\.\s+(.*)/);
      if (combinedMatch) {
          flushVerse();
          currentVerseNum = parseInt(combinedMatch[1]);
          currentLines.push(combinedMatch[2].trim());
          return;
      }
      
      // Case 3: Content line -> Append to current verse
      if (currentVerseNum > 0) {
          // Filter out navigation/metadata text if any
          if (text.includes('Download') || text.includes('Previous') || text.includes('Next')) return;
          
          // Split by newline if exists within P tag
          text.split('\n').forEach(t => {
              if(t.trim()) currentLines.push(t.trim());
          });
      }
    });
    
    // Flush last verse
    flushVerse();
  }
  
  // Remove duplicates just in case
  const uniqueSections = [];
  const seenNumbers = new Set();
  
  // Sort by number
  sections.sort((a, b) => a.number - b.number);
  
  for (const s of sections) {
      if (!seenNumbers.has(s.number)) {
          uniqueSections.push(s);
          seenNumbers.add(s.number);
      }
  }

  // Fallback title
  if (!title || title.trim() === '') {
      title = `Buku Ende No. ${songNumber}`;
  }

  return { title, sections: uniqueSections };
}

/**
 * Import satu lagu
 */
async function importSong(songUrl, songNumber) {
  try {
    const html = await fetchWithRetry(songUrl);
    if (!html) return { success: false, reason: 'not found' };
    
    const songData = parseSongHtml(html, songNumber);
    
    if (!songData || songData.sections.length === 0) {
      return { success: false, reason: 'no lyrics parsed' };
    }
    
    const song = {
      title: songData.title,
      song_number: String(songNumber),
      category: 'BE',
      lyrics: songData.sections
    };
    
    const { error } = await supabase
      .from('songs')
      .upsert(song, { onConflict: 'song_number,category' });
    
    if (error) {
      return { success: false, reason: error.message };
    }
    
    return { success: true, title: songData.title, sectionCount: songData.sections.length };
  } catch (err) {
    return { success: false, reason: err.message };
  }
}

async function run() {
  const args = process.argv.slice(2);
  
  // Check if just fetching URLs
  if (args.includes('--fetch-urls')) {
    const urls = await fetchSongUrls();
    fs.writeFileSync(URLS_FILE, JSON.stringify(urls, null, 2));
    console.log(`\n💾 URLs saved to ${URLS_FILE}`);
    return;
  }
  
  // Load or fetch URLs
  let songUrls;
  if (fs.existsSync(URLS_FILE)) {
    console.log(`📂 Loading URLs from ${URLS_FILE}...`);
    songUrls = JSON.parse(fs.readFileSync(URLS_FILE, 'utf-8'));
  } else {
    songUrls = await fetchSongUrls();
    fs.writeFileSync(URLS_FILE, JSON.stringify(songUrls, null, 2));
    console.log(`💾 URLs saved to ${URLS_FILE}`);
  }
  
  // Parse arguments for range
  let start = 1;
  let end = 50; // default: first 50
  
  for (const arg of args) {
    if (arg === '--all') {
      end = 864;
    } else if (arg.startsWith('--start=')) {
      start = parseInt(arg.split('=')[1]);
    } else if (arg.startsWith('--end=')) {
      end = parseInt(arg.split('=')[1]);
    }
  }
  
  // Filter songs to import
  const toImport = songUrls.filter(s => s.number >= start && s.number <= end);
  
  console.log(`\n🎵 Import Buku Ende dari BatakPedia`);
  console.log(`   Range: BE ${start} - BE ${end}`);
  console.log(`   Songs to import: ${toImport.length}`);
  console.log(`   Retry: ${MAX_RETRIES}x per lagu\n`);
  
  let success = 0;
  let failed = 0;
  const failedList = [];
  
  for (const song of toImport) {
    const result = await importSong(song.url, song.number);
    
    if (result.success) {
      console.log(`✓ BE ${song.number}: ${result.title} (${result.sectionCount} bait)`);
      success++;
    } else {
      console.log(`✗ BE ${song.number}: ${result.reason}`);
      failed++;
      failedList.push(song.number);
    }
    
    await sleep(DELAY_MS);
  }
  
  console.log(`\n📊 Hasil Import Buku Ende:`);
  console.log(`   ✅ Berhasil: ${success}`);
  console.log(`   ❌ Gagal: ${failed}`);
  console.log(`   📝 Total: ${success + failed}`);
  
  if (failedList.length > 0) {
    console.log(`\n⚠️  Yang gagal: BE ${failedList.slice(0, 20).join(', ')}${failedList.length > 20 ? '...' : ''}`);
  }
  
  console.log('');
}

run();
