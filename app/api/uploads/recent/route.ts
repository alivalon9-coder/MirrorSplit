import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import path from 'path';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
const DATA_FILE = path.join(process.cwd(), 'data', 'uploads.json');

const supabase = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

/**
 * GET /api/uploads/recent
 * Returns the most recent uploads across all sections
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    if (HAS_SUPABASE && supabase) {
      // Fetch from Supabase
      const { data, error } = await supabase
        .from('uploads')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Supabase query error:', error);
        return NextResponse.json({ 
          ok: false, 
          error: 'Failed to fetch recent uploads',
          details: error.message 
        }, { status: 500 });
      }

      const items = (data || []).map((row: any) => ({
        id: row.id,
        title: row.title || 'Untitled',
        artist: row.artist || 'Unknown',
        price: row.price || '',
        section: row.section || 'unknown',
        url: row.url || null,
        file_path: row.file_path || null,
        created_at: row.created_at || new Date().toISOString(),
      }));

      return NextResponse.json({ ok: true, items, count: items.length });
    }

    // Fallback to local JSON file
    try {
      const contents = await readFile(DATA_FILE, 'utf8');
      const parsed = JSON.parse(contents);
      const items = Array.isArray(parsed) ? parsed.slice(0, limit) : [];
      
      return NextResponse.json({ ok: true, items, count: items.length });
    } catch (fileErr: any) {
      if (fileErr?.code === 'ENOENT') {
        return NextResponse.json({ ok: true, items: [], count: 0 });
      }
      throw fileErr;
    }
  } catch (err) {
    console.error('Recent uploads error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch recent uploads',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}
