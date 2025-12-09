import { NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'uploads.json');

function ensureDirs() {
  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify([]));
}

export async function POST(request: Request) {
  try {
    ensureDirs();

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
      const ext = path.extname(originalName) || '.bin';
      const safeName = `${id}${ext}`;
      const filePath = path.join(UPLOAD_DIR, safeName);
      fileName = safeName;

      // Read file stream and write to disk
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filePath, buffer);
      url = `/uploads/${safeName}`;
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

    // append metadata to data/uploads.json
    const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8') || '[]');
    existing.unshift(item);
    fs.writeFileSync(DATA_FILE, JSON.stringify(existing, null, 2));

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('upload error', err);
    return NextResponse.json({ ok: false, error: 'Invalid upload' }, { status: 400 });
  }
}
