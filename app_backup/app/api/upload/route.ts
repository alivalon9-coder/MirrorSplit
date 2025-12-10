// app/api/upload/route.ts
import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export async function POST(req: Request) {
  // parse multipart form (using formidable)
  const form = new formidable.IncomingForm();
  const data: any = await new Promise((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });

  const { files } = data;
  const audio = files?.audio;
  const cover = files?.cover;

  if (!audio) return NextResponse.json({ error: "No audio" }, { status: 400 });

  // read audio buffer
  const buffer = fs.readFileSync(audio.filepath);

  // upload to Cloudinary (example using unsigned endpoint)
  const cloudName = process.env.CLOUDINARY_NAME!;
  const timestamp = Math.floor(Date.now() / 1000);
  // NOTE: this is a simple example using the upload API - use official SDK or sign requests server-side
  const formData = new FormData();
  formData.append("file", buffer as any, audio.originalFilename);
  formData.append("resource_type", "video"); // audio often uses video resource type on Cloudinary
  formData.append("timestamp", String(timestamp));
  // add api_key and signature if using signed upload
  // For demo: use unsigned upload preset instead:
  formData.append("upload_preset", process.env.CLOUDINARY_UNSIGNED_PRESET!);

  const resp = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData as any,
  });

  if (!resp.ok) {
    const txt = await resp.text();
    return NextResponse.json({ error: txt }, { status: 500 });
  }

  const json = await resp.json();
  return NextResponse.json({ url: json.secure_url, raw: json });
}
