// app/api/upload/route.ts
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: Request) {
  return NextResponse.json({ ok: true, info: "upload route active (GET)" });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file received", { status: 400 });
    }

    const filename = file.name ?? "unknown";
    const size = file.size ?? 0;

    // لو عايز ترفع على Cloudinary/S3 هنا تحط الكود بتاع الupload
    return NextResponse.json({ ok: true, filename, size });
  } catch (err: any) {
    return new NextResponse("Server error: " + (err?.message ?? err), { status: 500 });
  }
}
