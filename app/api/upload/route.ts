// app/api/upload/route.ts
import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Get the incoming form data
    const formData = await req.formData();

    // 'file' هو اسم الحقل في الفورم - لو انت بتبعته باسم تاني غيّره هنا
    const uploadFile = formData.get("file") as File | null;
    if (!uploadFile) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // اقرأ البينات وحوّلها لبايتس
    const arrayBuffer = await uploadFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // اسم الملف (fallback لو مفيش اسم)
    const safeFilename = uploadFile.name || `upload-${Date.now()}`;

    // مجلّد التخزين: /public/uploads
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    // المسار النهائي وحفظ الملف
    const finalPath = path.join(uploadsDir, safeFilename);
    await fs.promises.writeFile(finalPath, buffer);

    // URL للملف (قابل للاستخدام في الموقع)
    const url = `/uploads/${encodeURIComponent(safeFilename)}`;

    return NextResponse.json({ url }, { status: 200 });
  } catch (err: any) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err?.message || "Upload failed" }, { status: 500 });
  }
}
