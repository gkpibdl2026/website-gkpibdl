import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { parseRenunganContent } from '@/features/renungan';
import Parser from 'rss-parser';

const RSS_URL = 'https://gkpisinode.org/category/terang-hidup/feed/';

// Vercel Cron Job handler - dipanggil otomatis setiap hari jam 06:00 WIB (23:00 UTC)
export async function GET(request: Request) {
  // Validasi request berasal dari Vercel Cron (bukan request random dari luar)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const parser = new Parser({
      customFields: {
        item: ['content:encoded', 'content'],
      },
    });

    // Ambil RSS feed dari GKPI Sinode
    const feed = await parser.parseURL(RSS_URL);

    if (!feed.items || feed.items.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada item di RSS feed',
        synced: 0,
        timestamp: new Date().toISOString(),
      });
    }

    let syncedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

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

        // Cek apakah renungan sudah ada berdasarkan source_url (hindari duplikasi)
        const { data: existing } = await supabaseAdmin
          .from('renungan')
          .select('id')
          .eq('source_url', parsed.source_url)
          .single();

        if (existing) {
          // Update renungan yang sudah ada
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
          updatedCount++;
        } else {
          // Insert renungan baru
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

          if (error) {
            errors.push(`Gagal insert: ${item.title} - ${error.message}`);
            continue;
          }
          syncedCount++;
        }
      } catch (itemError) {
        console.error('Error processing RSS item:', item.title, itemError);
        errors.push(`Gagal proses: ${item.title}`);
      }
    }

    console.log(`[CRON] sync-renungan selesai: ${syncedCount} baru, ${updatedCount} diupdate`);

    return NextResponse.json({
      message: `Sync selesai: ${syncedCount} renungan baru, ${updatedCount} diupdate`,
      synced: syncedCount,
      updated: updatedCount,
      total_rss: feed.items.length,
      errors: errors.length > 0 ? errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[CRON] Error sync-renungan:', error);
    return NextResponse.json(
      { error: 'Gagal sync dari GKPI Sinode RSS feed', timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
