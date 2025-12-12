import path from 'path';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
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

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_FILE = path.join(process.cwd(), 'data', 'uploads.json');
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || process.env.SUPABASE_UPLOAD_BUCKET || 'uploads';

type UploadItem = {
  id: string;
  title: string;
  artist: string;
  price: string;
  section: string;
  file_name: string | null;
  url: string | null;
  file_path: string | null;
  created_at: string;
};

function fromDbRow(row: any): UploadItem {
  return {
    id: (row.id ?? '').toString(),
    title: row.title ?? '',
    artist: row.artist ?? '',
    price: row.price ?? '',
    section: row.section ?? 'unknown',
    file_name: row.file_path ?? row.file_name ?? row.filename ?? row.fileName ?? null,
    file_path: row.file_path ?? row.file_name ?? row.filename ?? row.fileName ?? null,
    url: row.url ?? null,
    created_at: row.created_at ?? row.createdat ?? row.createdAt ?? new Date().toISOString(),
  };
}

async function ensureUploadsDir() {
  await mkdir(UPLOAD_DIR, { recursive: true });
}

async function appendLocalUpload(item: Record<string, unknown>) {
  try {
    const contents = await readFile(DATA_FILE, 'utf8');
    const parsed = contents ? JSON.parse(contents) : [];
    const items = Array.isArray(parsed) ? parsed : [];
    items.unshift(item);
    await writeFile(DATA_FILE, JSON.stringify(items, null, 2));
  } catch (err: any) {
    if (err?.code === 'ENOENT') {
      await writeFile(DATA_FILE, JSON.stringify([item], null, 2));
      return;
    }
    throw err;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || 'Untitled';
    const artist = formData.get('artist')?.toString() || 'Unknown';
    const priceInput = formData.get('price')?.toString() || '';
    const priceNumeric = (() => {
      const cleaned = priceInput.trim();
      if (!cleaned) return null;
      const num = Number(cleaned.replace(/[^0-9.]/g, ''));
      return Number.isFinite(num) ? num : null;
    })();
    const section = formData.get('section')?.toString() || 'unknown';
    const file = formData.get('file') as File | null;

    const id = randomUUID();
    let url: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const originalName = (file as any).name || 'file.bin';
      const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
      const safeName = `${id}${ext}`;
      fileName = safeName;

      const buffer = Buffer.from(await file.arrayBuffer());

      if (HAS_SUPABASE && supabase) {
        // upload to Supabase Storage
        const uploadRes = await supabase.storage.from(SUPABASE_BUCKET).upload(safeName, buffer, {
          contentType: (file as any).type || 'application/octet-stream',
          cacheControl: '3600',
          upsert: false,
        });

        if (uploadRes.error) {
          console.error('Supabase upload error', uploadRes.error);
          return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
        }

        // get public url
        const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(safeName);
        url = publicData?.publicUrl || null;
      } else {
        // fallback: store file locally for dev usage when Supabase is missing
        await ensureUploadsDir();
        await writeFile(path.join(UPLOAD_DIR, safeName), buffer);
        url = `/uploads/${safeName}`;
      }
    }

    const item: UploadItem = {
      id,
      title,
      artist,
      price: priceInput,
      section,
      file_name: fileName,
      url,
      file_path: fileName,
      created_at: new Date().toISOString(),
    };

    if (HAS_SUPABASE && supabase) {
      const payload = {
        id: item.id,
        title: item.title,
        artist: item.artist,
        price: priceNumeric,
        section: item.section,
        file_path: item.file_path ?? item.file_name,
        url: item.url,
        created_at: item.created_at,
      };

      // Retry metadata save up to 3 times
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
        console.error(`Metadata save attempt ${retry + 1} failed:`, attempt.error);
        
        // Wait before retry (exponential backoff)
        if (retry < 2) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, retry) * 500));
        }
      }

      if (attempt?.error) {
        console.error('All metadata save attempts failed:', lastError);
        
        // Fallback: try to save locally as backup
        try {
          await appendLocalUpload(item);
          console.log(`Saved metadata locally as fallback for ${id}`);
          
          return NextResponse.json({ 
            ok: true, 
            item,
            warning: 'File uploaded successfully, but saved to local backup only',
            metadataError: lastError?.message,
            suggestion: 'Database may be temporarily unavailable. Metadata saved locally.'
          }, { status: 200 });
        } catch (localErr) {
          console.error('Local fallback also failed:', localErr);
        }
        
        // Clean up uploaded file on metadata save failure
        if (fileName) {
          try {
            await supabase.storage.from(SUPABASE_BUCKET).remove([fileName]);
            console.log(`Cleaned up file ${fileName} after metadata save failure`);
          } catch (cleanupErr) {
            console.error('Cleanup failed:', cleanupErr);
          }
        }
        
        return NextResponse.json({ 
          ok: false, 
          error: 'Metadata save failed', 
          details: lastError?.message || 'Unknown error',
          code: lastError?.code,
          hint: lastError?.hint || 'Please check database connection and table schema'
        }, { status: 500 });
      }

      const stored = attempt.data ? fromDbRow(attempt.data) : item;
      return NextResponse.json({ ok: true, item: stored });
    }

    await appendLocalUpload(item);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('upload error', err);
    return NextResponse.json({ ok: false, error: 'Invalid upload' }, { status: 400 });
  }
}
