import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const HAS_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);

const supabase = HAS_SUPABASE
  ? createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    })
  : null;

/**
 * POST /api/uploads/track-view
 * Track views/plays for uploaded files
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, type = 'view' } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Upload ID required' }, { status: 400 });
    }

    if (!HAS_SUPABASE || !supabase) {
      return NextResponse.json({ ok: true, message: 'Tracking not available' });
    }

    // Check if tracking table exists, if not, just return success
    // This prevents errors when the table doesn't exist yet
    try {
      // Increment view/play count
      const columnName = type === 'play' ? 'plays' : 'views';
      
      // First, try to get current count
      const { data: current } = await supabase
        .from('uploads')
        .select('id, views, plays')
        .eq('id', id)
        .single();

      if (current) {
        const newCount = (current[columnName] || 0) + 1;
        await supabase
          .from('uploads')
          .update({ [columnName]: newCount })
          .eq('id', id);
      }

      return NextResponse.json({ ok: true, type, id });
    } catch (err) {
      console.log('View tracking skipped (table may not have views/plays columns):', err);
      return NextResponse.json({ ok: true, message: 'Tracking skipped' });
    }
  } catch (err) {
    console.error('Track view error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to track view',
      details: err instanceof Error ? err.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/uploads/track-view?id={upload_id}
 * Get view/play statistics for an upload
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Upload ID required' }, { status: 400 });
    }

    if (!HAS_SUPABASE || !supabase) {
      return NextResponse.json({ ok: true, views: 0, plays: 0 });
    }

    try {
      const { data } = await supabase
        .from('uploads')
        .select('views, plays')
        .eq('id', id)
        .single();

      return NextResponse.json({ 
        ok: true, 
        views: data?.views || 0,
        plays: data?.plays || 0
      });
    } catch (err) {
      return NextResponse.json({ ok: true, views: 0, plays: 0 });
    }
  } catch (err) {
    console.error('Get stats error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to get statistics'
    }, { status: 500 });
  }
}
