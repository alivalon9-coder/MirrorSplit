import formidable from "formidable";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import cloudinary from "cloudinary";

export const config = {
  api: { bodyParser: false }
};

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function parseForm(req) {
  const form = new formidable.IncomingForm();
  form.keepExtensions = true;
  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

function uploadToCloudinary(stream, folder = "audio_uploads") {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.v2.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.pipe(uploadStream);
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Only POST allowed" });

  try {
    const { fields, files } = await parseForm(req);
    const file = files.file || files.audio || Object.values(files)[0];
    if (!file) return res.status(400).json({ error: "No file provided" });

    const readStream = fs.createReadStream(file.path);
    const cloudResp = await uploadToCloudinary(readStream, "audio_uploads");
    console.log("Cloudinary response:", cloudResp);

    const cloud_file_path = cloudResp.public_id || null;
    const secure_url = cloudResp.secure_url || cloudResp.url || null;

    const insertPayload = {
      title: fields.title || "",
      artist: fields.artist || "",
      price: fields.price ? Number(fields.price) : 0,
      file_path: cloud_file_path,
      url: secure_url,
      section: fields.section || "music",
      created_at: new Date(),
    };

    console.log("Inserting metadata to Supabase:", insertPayload);

    const { data, error } = await supabase.from("uploads").insert(insertPayload).select();

    if (error) {
      console.error("[upload-vocal] Supabase insert error:", error);
      return res.status(500).json({ error: "Metadata save failed", details: error.message });
    }

    return res.status(200).json({ message: "Upload OK", cloudResp, db: data });
  } catch (err) {
    console.error("[upload-vocal] handler error:", err);
    return res.status(500).json({ error: err.message || "Upload failed" });
  }
}

