import { NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const DATA_FILE = path.join(process.cwd(), 'data', 'uploads.json');
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

function readItems() {
  if (!fs.existsSync(DATA_FILE)) return [];
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw || '[]');
}

function writeItems(items: any[]) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

export async function DELETE(request: Request, ctx: { params: any }) {
  try {
    const params = await ctx.params;
    const id = params.id as string;
    const items = readItems();
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const item = items[idx];
    // remove file if exists
    if (item.fileName) {
      const filePath = path.join(UPLOAD_DIR, item.fileName);
      try {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      } catch (e) {
        // ignore
      }
    }

    items.splice(idx, 1);
    writeItems(items);

    return NextResponse.json({ ok: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('delete upload error', err);
    return NextResponse.json({ ok: false, error: 'Delete failed' }, { status: 500 });
  }
}

export async function PATCH(request: Request, ctx: { params: any }) {
  try {
    const params = await ctx.params;
    const id = params.id as string;
    const body = await request.json();
    const items = readItems();
    const idx = items.findIndex((i: any) => i.id === id);
    if (idx === -1) return NextResponse.json({ ok: false, error: 'Not found' }, { status: 404 });

    const item = items[idx];
    const allowed = ['title', 'artist', 'price', 'section'];
    for (const k of allowed) {
      if (body[k] !== undefined) item[k] = body[k];
    }
    items[idx] = item;
    writeItems(items);

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('patch upload error', err);
    return NextResponse.json({ ok: false, error: 'Update failed' }, { status: 500 });
  }
}
