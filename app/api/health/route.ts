import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const storage = process.env.USE_SUPABASE_STORAGE ? 'supabase' : 'local'
  const supabaseUrl = process.env.SUPABASE_URL ? 'present' : 'missing'
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'present' : 'missing'

  return NextResponse.json({ storage, supabaseUrl, anonKey })
}
