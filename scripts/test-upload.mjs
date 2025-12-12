import { readFile } from 'fs/promises';

async function main() {
  const filePath = new URL('../sample.mp3', import.meta.url);
  const data = await readFile(filePath);

  const form = new FormData();
  form.append('title', 'CLI Test');
  form.append('artist', 'CLI');
  form.append('price', '0');
  form.append('section', 'for-sale');
  form.append('file', new Blob([data], { type: 'audio/mpeg' }), 'sample.mp3');

  const res = await fetch('http://localhost:3000/api/upload-track', {
    method: 'POST',
    body: form,
  });

  const text = await res.text();
  console.log('status:', res.status);
  console.log('body:', text);
}

main().catch((err) => {
  console.error('test upload failed', err);
  process.exit(1);
});
