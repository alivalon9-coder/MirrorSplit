import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'nodejs';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const title = formData.get('title')?.toString() || 'Untitled';
    const artist = formData.get('artist')?.toString() || 'Unknown';
    const price = formData.get('price')?.toString() || '';
    const section = formData.get('section')?.toString() || 'unknown';
    const file = formData.get('file') as File | null;

    const id = `upload_${Date.now()}`;
    let url: string | null = null;
    let fileName: string | null = null;

    if (file) {
      const originalName = (file as any).name || 'file.bin';
      const ext = originalName.includes('.') ? originalName.substring(originalName.lastIndexOf('.')) : '';
      const safeName = `${id}${ext}`;
      fileName = safeName;

      const buffer = Buffer.from(await file.arrayBuffer());

      // upload to Supabase Storage (bucket: uploads)
      const uploadRes = await supabase.storage.from('uploads').upload(safeName, buffer, {
        contentType: (file as any).type || 'application/octet-stream',
        cacheControl: '3600',
        upsert: false,
      });

      if (uploadRes.error) {
        console.error('Supabase upload error', uploadRes.error);
        return NextResponse.json({ ok: false, error: 'Upload failed' }, { status: 500 });
      }

      // get public url
      const { data: publicData } = supabase.storage.from('uploads').getPublicUrl(safeName);
      url = publicData?.publicUrl || null;
    }

    const item = {
      id,
      title,
      artist,
      price,
      section,
      fileName,
      url,
      createdAt: new Date().toISOString(),
    };

    // insert metadata into Supabase table `uploads`
    const dbRes = await supabase.from('uploads').insert(item).select();
    if (dbRes.error) {
      console.error('Supabase insert error', dbRes.error);
      // still return item but warn
      return NextResponse.json({ ok: false, error: 'Metadata save failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true, item: dbRes.data?.[0] ?? item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('upload error', err);
    return NextResponse.json({ ok: false, error: 'Invalid upload' }, { status: 400 });
  }
}
