import { NextResponse } from 'next/server'

export async function POST(request: Request) {
	try {
		const body = await request.json().catch(() => ({} as any))
		return NextResponse.json({ ok: true, received: body }, { status: 200 })
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Unexpected error' }, { status: 500 })
	}
}

export async function GET() {
	return NextResponse.json({ ok: true })
}
