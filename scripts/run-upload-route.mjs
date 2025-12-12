import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { POST } from '../app/api/upload-track/route';

async function main() {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const samplePath = path.join(__dirname, '..', 'sample.mp3');
  const data = await readFile(samplePath);

  const form = new FormData();
  form.append('title', 'Direct Test');
  form.append('artist', 'Direct');
  form.append('price', '0');
  form.append('section', 'for-sale');
  form.append('file', new File([data], 'sample.mp3', { type: 'audio/mpeg' }));

  const request = new Request('http://localhost/api/upload-track', {
    method: 'POST',
    body: form,
  });

  const response = await POST(request);
  console.log('status:', response.status);
  console.log('body:', await response.json());
}

main().catch((err) => {
  console.error('direct test failed', err);
  process.exit(1);
});
