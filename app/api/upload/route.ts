// app/api/upload/route.ts
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const getEnv = (key: string, fallback = "") => {
  const v = process.env[key];
  if (!v && !fallback) {
    console.warn(`Environment variable ${key} is not set.`);
  }
  return v || fallback;
};

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const uploadFile = formData.get("file") as File | null;

    if (!uploadFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // === اقرأ القيم من متغيرات البيئة ===
    // ضع هنا اسم الـ cloud والـ preset في ملف .env.local (انظر الأسفل)
    const cloudName = getEnv("CLOUDINARY_CLOUD_NAME", "");      // <-- ضع اسم الـ cloud هنا عبر .env.local
    const uploadPreset = getEnv("CLOUDINARY_UPLOAD_PRESET", ""); // <-- ضع اسم الـ preset هنا عبر .env.local

    if (!cloudName || !uploadPreset) {
      return NextResponse.json(
        { error: "Cloudinary config missing. Set CLOUDINARY_CLOUD_NAME and CLOUDINARY_UPLOAD_PRESET in .env.local" },
        { status: 500 }
      );
    }

    // اقرأ الملف كـ ArrayBuffer ثم حوّله لــ Buffer
    const arrayBuffer = await uploadFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // اسم الملف الآمن
    const safeFilename = uploadFile.name || `upload-${Date.now()}`;

    // نبني FormData لارسالها لـ Cloudinary
    const cloudForm = new FormData();
    const fileBlob = new Blob([buffer], { type: uploadFile.type || "application/octet-stream" });
    cloudForm.append("file", fileBlob, safeFilename);
    cloudForm.append("upload_preset", uploadPreset);

    // ارسل لـ Cloudinary
    const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
      method: "POST",
      body: cloudForm,
    });

    const data = await uploadRes.json();

    if (!uploadRes.ok) {
      console.error("Cloudinary error:", data);
      return NextResponse.json({ error: data.error?.message || "Cloudinary upload failed", raw: data }, { status: 500 });
    }

    // اعد الرابط الآمن وملفات الميتا
    return NextResponse.json({ url: data.secure_url, raw: data }, { status: 200 });
  } catch (err: any) {
    console.error("Upload route error:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
