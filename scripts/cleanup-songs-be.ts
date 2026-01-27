#!/usr/bin/env tsx
/**
 * Script to clean up inconsistent data in the songs table for BE category
 * 
 * IMPORTANT: Run backup-songs-table.sql in Supabase SQL Editor FIRST!
 * 
 * This script will:
 * 1. Confirm backup has been created
 * 2. Parse and clean titles in BE category
 * 3. Extract song numbers from titles
 * 4. Remove extraneous text like " – BatakPedia"
 * 
 * Usage: npm run cleanup:songs-be
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Error: Missing required environment variables')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

interface Song {
  id: string
  title: string
  song_number: string
  category: string
  lyrics: unknown
  created_at: string
  updated_at: string
}

interface CleanedData {
  songNumber: string
  cleanTitle: string
}

/**
 * Parse BE song title and extract song number and clean title
 * Pattern examples:
 * - "BE 720 NAENG MARSINONDANG NGOLUNGKU. – BatakPedia"
 * - "BE 708 JESUS HO DO SIPALUA I – BatakPedia"
 */
function parseBeTitle(title: string): CleanedData | null {
  // Pattern 1: "BE <number> <title> – BatakPedia" or "BE <number> <title>. – BatakPedia"
  const pattern1 = /^BE\s+(\d+)\s+(.+?)(?:\.\s*)?(?:\s*–\s*BatakPedia)?$/i
  const match1 = title.match(pattern1)
  
  if (match1) {
    const [, songNumber, cleanTitle] = match1
    return {
      songNumber: songNumber.trim(),
      cleanTitle: cleanTitle.trim()
    }
  }

  // Pattern 2: Just has "– BatakPedia" at the end but no "BE" prefix
  const pattern2 = /^(.+?)(?:\.\s*)?(?:\s*–\s*BatakPedia)$/i
  const match2 = title.match(pattern2)
  
  if (match2) {
    const [, cleanTitle] = match2
    return {
      songNumber: '', // Keep existing song_number
      cleanTitle: cleanTitle.trim()
    }
  }

  return null
}

/**
 * Ask user for confirmation
 */
function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

/**
 * Confirm backup was created
 */
async function confirmBackup(): Promise<void> {
  console.log('\n⚠️  IMPORTANT: Backup Confirmation')
  console.log('=' .repeat(60))
  console.log('\nBefore proceeding, you MUST create a backup of the songs table.')
  console.log('\n1. Open Supabase SQL Editor')
  console.log('2. Run the SQL script: scripts/backup-songs-table.sql')
  console.log('3. Verify the backup table was created successfully\n')
  
  const answer = await askQuestion('Have you created the backup table? (yes/no): ')
  if (answer.toLowerCase() !== 'yes') {
    console.log('\n❌ Please create a backup first before running this script.')
    console.log('   Run: scripts/backup-songs-table.sql in Supabase SQL Editor\n')
    process.exit(0)
  }
  
  console.log('✅ Backup confirmed. Proceeding with cleanup...')
}

/**
 * Fetch all BE category songs
 */
async function fetchBeSongs(): Promise<Song[]> {
  console.log('\n🔍 Fetching BE category songs...')
  
  const { data, error } = await supabase
    .from('songs')
    .select('*')
    .eq('category', 'BE')
    .order('song_number', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch songs: ${error.message}`)
  }

  console.log(`✅ Found ${data.length} songs in BE category`)
  return data
}

/**
 * Preview changes
 */
function previewChanges(songs: Song[]): Array<{song: Song, cleaned: CleanedData | null}> {
  console.log('\n📋 Preview of changes:\n')
  console.log('=' .repeat(100))
  
  const changes: Array<{song: Song, cleaned: CleanedData | null}> = []
  
  songs.forEach((song, index) => {
    const cleaned = parseBeTitle(song.title)
    
    if (cleaned && (cleaned.cleanTitle !== song.title || (cleaned.songNumber && cleaned.songNumber !== song.song_number))) {
      console.log(`\n[${index + 1}] ID: ${song.id}`)
      console.log(`    Current Title:  "${song.title}"`)
      console.log(`    New Title:      "${cleaned.cleanTitle}"`)
      console.log(`    Current Number: "${song.song_number}"`)
      console.log(`    New Number:     "${cleaned.songNumber || song.song_number}"`)
      changes.push({ song, cleaned })
    }
  })

  console.log('\n' + '='.repeat(100))
  console.log(`\n📊 Summary: ${changes.length} songs will be updated out of ${songs.length} total`)
  
  return changes
}

/**
 * Update songs in database
 */
async function updateSongs(changes: Array<{song: Song, cleaned: CleanedData | null}>): Promise<void> {
  console.log('\n🔄 Updating songs in database...\n')
  
  let successCount = 0
  let errorCount = 0

  for (const { song, cleaned } of changes) {
    if (!cleaned) continue

    try {
      const updateData: Record<string, unknown> = {
        title: cleaned.cleanTitle,
        updated_at: new Date().toISOString()
      }

      // Only update song_number if we extracted one
      if (cleaned.songNumber) {
        updateData.song_number = cleaned.songNumber
      }

      const { error } = await supabase
        .from('songs')
        .update(updateData)
        .eq('id', song.id)

      if (error) {
        console.error(`❌ Error updating song ${song.id}:`, error.message)
        errorCount++
      } else {
        console.log(`✅ Updated: ${song.id} - ${cleaned.cleanTitle}`)
        successCount++
      }
    } catch (error) {
      console.error(`❌ Exception updating song ${song.id}:`, error)
      errorCount++
    }
  }

  console.log(`\n📊 Update Summary:`)
  console.log(`   ✅ Success: ${successCount}`)
  console.log(`   ❌ Errors: ${errorCount}`)
}

/**
 * Main execution
 */
async function main() {
  console.log('🎵 Songs Table Cleanup Script - BE Category')
  console.log('=' .repeat(60))

  try {
    // Step 1: Confirm backup
    console.log('\n📍 Step 1: Backup Confirmation')
    await confirmBackup()

    // Step 2: Fetch BE songs
    console.log('\n📍 Step 2: Fetch Data')
    const songs = await fetchBeSongs()

    if (songs.length === 0) {
      console.log('\n✅ No BE category songs found. Nothing to do.')
      return
    }

    // Step 3: Preview changes
    console.log('\n📍 Step 3: Preview Changes')
    const changes = previewChanges(songs)

    if (changes.length === 0) {
      console.log('\n✅ No changes needed. All songs are already clean.')
      return
    }

    // Step 4: Confirm with user
    console.log('\n📍 Step 4: Confirmation')
    const answer = await askQuestion(`\nDo you want to proceed with updating ${changes.length} songs? (yes/no): `)

    if (answer.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled by user.')
      return
    }

    // Step 5: Update songs
    console.log('\n📍 Step 5: Update Database')
    await updateSongs(changes)

    console.log('\n✅ Cleanup completed successfully!')
    console.log(`\n💡 If you need to restore from backup, run this SQL:`)
    console.log(`   DROP TABLE songs;`)
    console.log(`   ALTER TABLE songs_backup_YYYYMMDD RENAME TO songs;`)
    console.log(`   (Replace YYYYMMDD with your backup table suffix)`)

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
