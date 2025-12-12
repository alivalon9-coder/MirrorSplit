// pages/api/upload-vocal.js
import fs from 'fs';
import formidable from 'formidable';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketName = 'music'; // <-- change this if your bucket has a different name

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing SUPABASE env vars');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'GET,POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fields, files } = await parseForm(req);

    // Expecting the file input name to be "file" (adjust if your client uses a different name)
    const file = files.file || files.audio || files.upload;
    if (!file) {
      return res.status(400).json({ error: 'No file provided (expected field name "file")' });
    }

    // read the file into a buffer
    const data = fs.readFileSync(file.path);

    // choose a path (timestamp + original name) to avoid collisions
    const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
    const filePath = `${fileName}`;

    // upload to Supabase storage
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, data, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ error: 'Upload failed', details: uploadError });
    }

    // get public URL (or use createSignedUrl if private)
    const { data: publicUrlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    const publicUrl = publicUrlData?.publicUrl || null;

    return res.status(200).json({
      message: 'Upload successful',
      url: publicUrl,
      filePath,
      fields,
    });
  } catch (err) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ error: 'Server error', details: err?.message || err });
  }
}

