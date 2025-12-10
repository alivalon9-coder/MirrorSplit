import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  // eslint-disable-next-line no-console
  console.warn('SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not set. /api/uploads will not work correctly.');
}

const supabase = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } })
  : null;

export async function GET(req: Request) {
  if (!supabase) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const section = searchParams.get('section');

  try {
    let query = supabase.from('uploads').select('*');
    if (section) {
      query = query.eq('section', section);
    }
    query = query.order('createdAt', { ascending: false });

    const { data, error } = await query;
    if (error) {
      // eslint-disable-next-line no-console
      console.error('Supabase list uploads error', error);
      return NextResponse.json({ error: 'Failed to load uploads' }, { status: 500 });
    }

    return NextResponse.json({ items: data || [] }, { status: 200 });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('GET /api/uploads error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
