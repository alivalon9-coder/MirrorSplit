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
 * POST /api/recover-metadata
 * Attempts to recover metadata for files that were uploaded but failed to save to the database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, title, artist, price, section, file_path, url } = body;

    if (!id) {
      return NextResponse.json({ ok: false, error: 'Missing upload ID' }, { status: 400 });
    }

    if (!HAS_SUPABASE || !supabase) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
    }

    const payload = {
      id,
      title: title || 'Untitled',
      artist: artist || 'Unknown',
      price: price || '',
      section: section || 'unknown',
      file_path: file_path || null,
      url: url || null,
      created_at: new Date().toISOString(),
    };

    // Attempt to save metadata with retry logic
    let attempt;
    let lastError = null;
    
    for (let retry = 0; retry < 3; retry++) {
      attempt = await supabase
        .from('uploads')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();

      if (!attempt.error) break;
      
      lastError = attempt.error;
      console.error(`Metadata recovery attempt ${retry + 1} failed:`, attempt.error);
      
      if (retry < 2) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 500));
      }
    }

    if (attempt?.error) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Metadata recovery failed',
        details: lastError?.message,
        code: lastError?.code,
      }, { status: 500 });
    }

    return NextResponse.json({ 
      ok: true, 
      item: attempt?.data || null,
      message: 'Metadata recovered successfully' 
    });
  } catch (err) {
    console.error('Metadata recovery error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Recovery failed', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}

/**
 * GET /api/recover-metadata
 * Lists orphaned files (files without metadata) that might need recovery
 */
export async function GET() {
  try {
    if (!HAS_SUPABASE || !supabase) {
      return NextResponse.json({ ok: false, error: 'Database not configured' }, { status: 503 });
    }

    const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || 'uploads';

    // Get all files from storage
    const { data: files, error: listError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .list();

    if (listError) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to list files',
        details: listError.message 
      }, { status: 500 });
    }

    // Get all metadata records
    const { data: records, error: queryError } = await supabase
      .from('uploads')
      .select('file_path');

    if (queryError) {
      return NextResponse.json({ 
        ok: false, 
        error: 'Failed to query metadata',
        details: queryError.message 
      }, { status: 500 });
    }

    const recordedFiles = new Set(records?.map(r => r.file_path) || []);
    const orphanedFiles = files?.filter(f => !recordedFiles.has(f.name)) || [];

    return NextResponse.json({ 
      ok: true, 
      orphanedFiles: orphanedFiles.map(f => ({
        name: f.name,
        size: f.metadata?.size,
        created_at: f.created_at,
      })),
      count: orphanedFiles.length
    });
  } catch (err) {
    console.error('Orphan detection error:', err);
    return NextResponse.json({ 
      ok: false, 
      error: 'Detection failed', 
      details: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}
