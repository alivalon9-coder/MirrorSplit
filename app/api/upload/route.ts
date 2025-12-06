// app/api/upload/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge"; // or remove if you prefer serverless

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file received", { status: 400 });
    }

    // read file name + size (you can change to upload to cloud here)
    const filename = file.name ?? "unknown";
    const size = file.size ?? 0;

    // *Temporary* — we are NOT storing the file permanently, only reading
    // If you want to upload to Cloudinary / S3 here, do it and return the URL.
    // For now return basic info:
    return NextResponse.json({ ok: true, filename, size });
  } catch (err: any) {
    return new NextResponse("Server error: " + (err?.message ?? err), { status: 500 });
  }
}
