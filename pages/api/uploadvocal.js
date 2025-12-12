import formidable from "formidable";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const config = {
  api: {
    bodyParser: false,
  },
};

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
} = process.env;

if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
  throw new Error("Missing Cloudinary configuration environment variables.");
}

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase configuration environment variables.");
}

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req, (err, fields, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve({ fields, files });
    });
  });
}

function fieldToString(value, fallback = "") {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }
  if (value === undefined || value === null) {
    return fallback;
  }
  return String(value);
}

function pickFile(files) {
  const candidates = [files?.file, files?.upload, files?.audio];
  for (const candidate of candidates) {
    if (!candidate) continue;
    if (Array.isArray(candidate)) {
      if (candidate.length) return candidate[0];
      continue;
    }
    return candidate;
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  let parsed;
  try {
    parsed = await parseForm(req);
  } catch (err) {
    console.error("[uploadvocal] Form parse error", err);
    return res.status(400).json({ error: "Invalid form data", details: err?.message || String(err) });
  }

  const { fields, files } = parsed;
  const file = pickFile(files);

  if (!file) {
    return res.status(400).json({ error: "No file provided" });
  }

  const filePath = file.filepath || file.path;
  const fileName = file.originalFilename || file.name || "upload.bin";
  const fileSize = file.size ?? 0;
  const fileType = file.mimetype || file.type || "application/octet-stream";

  console.log("[uploadvocal] Incoming file", {
    path: filePath,
    name: fileName,
    size: fileSize,
    type: fileType,
  });

  if (!filePath) {
    return res.status(400).json({ error: "Unable to access uploaded file path" });
  }

  let uploadResult;
  try {
    uploadResult = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
      folder: "uploads",
      use_filename: true,
      unique_filename: true,
    });
    console.log("[uploadvocal] Cloudinary response", uploadResult);
  } catch (err) {
    console.error("[uploadvocal] Cloudinary upload error", err);
    return res.status(500).json({ error: "Cloudinary upload failed", details: err?.message || String(err) });
  }

  const title = fieldToString(fields.title, fileName);
  const artist = fieldToString(fields.artist, "Unknown");
  const price = fieldToString(fields.price, "");
  const section = fieldToString(fields.section, "for-sale");

  const createdAt = new Date().toISOString();
  const filePathOrId = uploadResult.public_id || uploadResult.secure_url;

  const payloadVariants = [
    {
      title,
      artist,
      price,
      section,
      fileName: filePathOrId,
      url: uploadResult.secure_url,
      createdAt,
    },
    {
      title,
      artist,
      price,
      section,
      filename: filePathOrId,
      url: uploadResult.secure_url,
      createdat: createdAt,
    },
    {
      title,
      artist,
      price,
      section,
      file_path: filePathOrId,
      url: uploadResult.secure_url,
      created_at: createdAt,
    },
  ];

  let saved = null;
  let lastError = null;

  for (const payload of payloadVariants) {
    try {
      const attempt = await supabase.from("uploads").insert(payload).select().single();
      if (!attempt.error) {
        saved = attempt.data;
        lastError = null;
        break;
      }
      lastError = attempt.error;
      console.warn("[uploadvocal] Supabase insert attempt failed", attempt.error?.message || attempt.error);
    } catch (err) {
      lastError = err;
      console.warn("[uploadvocal] Supabase insert exception", err?.message || err);
    }
  }

  if (!saved) {
    console.error("[uploadvocal] Supabase insert error", lastError);
    return res.status(500).json({ error: "Metadata save failed", details: lastError?.message || String(lastError) });
  }

  return res.status(200).json({
    message: "Upload OK",
    url: uploadResult.secure_url,
    meta: saved,
  });
}

