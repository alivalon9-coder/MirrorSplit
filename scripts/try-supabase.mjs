import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('missing supabase env');
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  const payload = {
    title: 'Test entry',
    artist: 'Tester',
    price: '0',
    section: 'for-sale',
    fileName: 'dummy.mp3',
    url: 'https://example.com/dummy.mp3',
    createdAt: new Date().toISOString()
  };

  const result = await supabase.from('uploads').insert(payload).select().single();
  console.log('result:', result);
}

main().catch((err) => {
  console.error('script failed', err);
  process.exit(1);
});
