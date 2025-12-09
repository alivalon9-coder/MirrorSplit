import { NextResponse } from 'next/server';
import * as fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

const DATA_FILE = path.join(process.cwd(), 'data', 'uploads.json');

export async function GET(request: Request) {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({ ok: true, items: [] });
    }

    const q = new URL(request.url).searchParams;
    const section = q.get('section');

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const items = JSON.parse(raw || '[]');

    const filtered = section ? items.filter((i: any) => i.section === section) : items;

    return NextResponse.json({ ok: true, items: filtered });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('read uploads error', err);
    return NextResponse.json({ ok: false, items: [], error: 'Could not read uploads' }, { status: 500 });
  }
}
