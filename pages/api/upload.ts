import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable Next.js body parsing for multipart/form-data
export const config = {
  api: {
    bodyParser: false,
  },
};

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const form = formidable({
    multiples: false,
    // Keep files in temp dir; formidable provides a filepath to read
    maxFileSize: 1024 * 1024 * 100, // 100MB limit (adjust as needed)
  });

  try {
    const { fields, files } = await new Promise<{ fields: formidable.Fields; files: formidable.Files }>((resolve, reject) => {
      form.parse(req, (err, _fields, _files) => {
        if (err) reject(err);
        else resolve({ fields: _fields, files: _files });
      });
    });

    const file = files.file as formidable.File | undefined;
    if (!file) {
      res.status(400).json({ error: 'No file provided. Use form-data key "file"' });
      return;
    }

    // Read buffer from temp filepath
    const buffer = await fs.promises.readFile(file.filepath);

    const bucket = process.env.MUSIC_BUCKET || 'music'; // use your bucket name
    const filename = file.originalFilename || `upload-${Date.now()}`;
    const ext = path.extname(filename) || (file.mimetype ? `.${file.mimetype.split('/')[1]}` : '');
    const base = path.basename(filename, ext);
    const objectPath = `uploads/${base}-${Date.now()}${ext}`;

    const { error: uploadError } = await supabase.storage.from(bucket).upload(objectPath, buffer, {
      contentType: file.mimetype || 'application/octet-stream',
      upsert: false,
    });

    if (uploadError) {
      res.status(500).json({ error: 'Upload failed', details: uploadError.message });
      return;
    }

    const { data: publicUrlData } = supabase.storage.from(bucket).getPublicUrl(objectPath);
    const url = publicUrlData.publicUrl;

    res.status(200).json({ url, path: objectPath, bucket });
  } catch (err: any) {
    res.status(500).json({ error: 'Server error', details: err?.message || 'Unknown error' });
  }
}
