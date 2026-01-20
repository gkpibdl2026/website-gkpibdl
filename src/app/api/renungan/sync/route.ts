import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseRenunganContent } from '@/features/renungan';
import Parser from 'rss-parser';

const RSS_URL = 'https://gkpisinode.org/category/terang-hidup/feed/';

// POST - Sync renungan from GKPI Sinode RSS feed
export async function POST() {
  try {
    const parser = new Parser({
      customFields: {
        item: ['content:encoded', 'content'],
      },
    });

    // Fetch and parse RSS feed
    const feed = await parser.parseURL(RSS_URL);
    
    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({ message: 'No items found in RSS feed', synced: 0 });
    }

    let syncedCount = 0;
    const errors: string[] = [];

    for (const item of feed.items) {
      try {
        // Get content from RSS item - use unknown first for proper type casting
        const itemAny = item as unknown as Record<string, string>;
        const content = itemAny['content:encoded'] || 
                       itemAny['content'] || 
                       item.contentSnippet || '';
        
        if (!content || !item.title) continue;

        // Parse the content to extract renungan data
        const parsed = parseRenunganContent(
          content,
          item.title,
          item.link || '',
          item.pubDate || ''
        );

        // Check if renungan with this source_url already exists (not by date)
        const { data: existing } = await supabaseAdmin
          .from('renungan')
          .select('id')
          .eq('source_url', parsed.source_url)
          .single();

        if (existing) {
          // Update existing renungan
          await supabaseAdmin
            .from('renungan')
            .update({
              title: parsed.title,
              date: parsed.date,
              ayat_kunci: parsed.ayat_kunci,
              referensi: parsed.referensi,
              isi_renungan: parsed.isi_renungan,
              kutipan: parsed.kutipan,
              lagu: parsed.lagu,
              doa: parsed.doa,
              source: 'gkpi_sinode',
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          // Insert new renungan
          const { error } = await supabaseAdmin
            .from('renungan')
            .insert({
              title: parsed.title,
              date: parsed.date,
              ayat_kunci: parsed.ayat_kunci,
              referensi: parsed.referensi,
              isi_renungan: parsed.isi_renungan,
              kutipan: parsed.kutipan,
              lagu: parsed.lagu,
              doa: parsed.doa,
              source: 'gkpi_sinode',
              source_url: parsed.source_url,
              visible: true,
            });
          
          if (error) {
            console.error('Insert error:', error);
            errors.push(`Failed to insert: ${item.title} - ${error.message}`);
            continue;
          }
        }

        syncedCount++;
      } catch (itemError) {
        console.error('Error processing RSS item:', item.title, itemError);
        errors.push(`Failed to process: ${item.title}`);
      }
    }

    return NextResponse.json({
      message: `Successfully synced ${syncedCount} renungan from GKPI Sinode`,
      synced: syncedCount,
      total: feed.items.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('Error syncing from RSS:', error);
    return NextResponse.json(
      { error: 'Failed to sync from GKPI Sinode RSS feed' },
      { status: 500 }
    );
  }
}
