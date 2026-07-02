import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseRenunganContent } from '@/features/renungan';
import Parser from 'rss-parser';

const RSS_URL = 'https://gkpisinode.org/category/terang-hidup/feed/';

// GET - Cek apakah renungan hari ini sudah ada, jika tidak trigger sync otomatis
export async function GET() {
  try {
    // Tanggal hari ini dalam WIB (UTC+7)
    const nowUTC = new Date();
    const wibOffset = 7 * 60 * 60 * 1000;
    const nowWIB = new Date(nowUTC.getTime() + wibOffset);
    const todayWIB = nowWIB.toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // Cek apakah renungan hari ini sudah ada di database
    const { data: existing } = await supabaseAdmin
      .from('renungan')
      .select('id, title, date')
      .eq('date', todayWIB)
      .eq('visible', true)
      .single();

    if (existing) {
      // Renungan hari ini sudah ada, tidak perlu sync
      return NextResponse.json({
        synced: false,
        message: 'Renungan hari ini sudah tersedia',
        date: todayWIB,
      });
    }

    // Renungan hari ini belum ada, lakukan sync dari RSS
    console.log(`[CHECK-TODAY] Renungan ${todayWIB} belum ada, mulai sync...`);

    const parser = new Parser({
      customFields: { item: ['content:encoded', 'content'] },
    });

    const feed = await parser.parseURL(RSS_URL);

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({
        synced: false,
        message: 'RSS feed kosong',
        date: todayWIB,
      });
    }

    let syncedCount = 0;

    for (const item of feed.items) {
      try {
        const itemAny = item as unknown as Record<string, string>;
        const content =
          itemAny['content:encoded'] ||
          itemAny['content'] ||
          item.contentSnippet ||
          '';

        if (!content || !item.title) continue;

        const parsed = parseRenunganContent(
          content,
          item.title,
          item.link || '',
          item.pubDate || ''
        );

        // Cek duplikasi berdasarkan source_url
        const { data: existingByUrl } = await supabaseAdmin
          .from('renungan')
          .select('id')
          .eq('source_url', parsed.source_url)
          .single();

        if (!existingByUrl) {
          const { error } = await supabaseAdmin.from('renungan').insert({
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

          if (!error) syncedCount++;
        }
      } catch {
        // Skip item yang gagal
        continue;
      }
    }

    console.log(`[CHECK-TODAY] Sync selesai: ${syncedCount} renungan baru`);

    return NextResponse.json({
      synced: true,
      syncedCount,
      message: `Sync otomatis: ${syncedCount} renungan baru ditambahkan`,
      date: todayWIB,
    });
  } catch (error) {
    console.error('[CHECK-TODAY] Error:', error);
    return NextResponse.json(
      { synced: false, message: 'Gagal cek/sync renungan' },
      { status: 500 }
    );
  }
}
