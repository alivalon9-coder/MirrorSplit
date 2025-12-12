import path from 'path';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

if (!HAS_SUPABASE) {
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. /api/uploads will use local data.');
}

const supabase = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

const DATA_FILE = path.join(process.cwd(), 'data', 'uploads.json');

function fromDbRow(row: any) {
  return {
    id: row.id,
    title: row.title ?? '',
    artist: row.artist ?? '',
    price: row.price ?? '',
    section: row.section ?? 'unknown',
    fileName: row.file_path ?? row.file_name ?? row.filename ?? row.fileName ?? null,
    url: row.url ?? null,
    createdAt: row.created_at ?? row.createdat ?? row.createdAt ?? new Date().toISOString(),
  };
}

async function fetchUploadsFromSupabase(section?: string | null) {
  if (!supabase) {
    return { data: null, error: new Error('Supabase not configured') };
  }

  const orderColumns = ['created_at', 'createdat', 'createdAt'];
  let lastError: any = null;

  for (const column of orderColumns) {
    try {
      let query = supabase.from('uploads').select('*');
      if (section) {
        query = query.eq('section', section);
      }
      query = query.order(column as any, { ascending: false });

      const result = await query;
      if (!result.error) {
        return { data: result.data ?? [], error: null };
      }

      lastError = result.error;

      if (result.error.code !== '42703') {
        break;
      }
    } catch (err) {
      lastError = err;
      break;
    }
  }

  return { data: null, error: lastError };
}

async function readLocalUploads() {
  try {
    const contents = await readFile(DATA_FILE, 'utf8');
    const parsed = contents ? JSON.parse(contents) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      return [];
    }
    throw err;
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');

  if (!HAS_SUPABASE || !supabase) {
    try {
      const items = await readLocalUploads();
      const filtered = section ? items.filter((item) => item.section === section) : items;
      return NextResponse.json({ items: filtered }, { status: 200 });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Local uploads read error', err);
      return NextResponse.json({ error: 'Uploads unavailable' }, { status: 500 });
    }
  }

  try {
    const { data, error } = await fetchUploadsFromSupabase(section);
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase list uploads error', error);
      return NextResponse.json({ error: 'Failed to load uploads' }, { status: 500 });
    }

    const items = (data || []).map(fromDbRow);
    return NextResponse.json({ items }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/uploads error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
