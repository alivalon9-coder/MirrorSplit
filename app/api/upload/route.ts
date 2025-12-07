import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "mirrorsplit_uploads" },
      (error, result) => {
        if (error || !result) {
          console.error("Upload error:", error);
          return NextResponse.json({ ok: false, error: "Cloudinary error" }, { status: 500 });
        }
        return NextResponse.json({ ok: true, url: result.secure_url });
      }
    );

    uploaded.end(buffer);

    return new Promise((resolve) => {
      uploaded.on("finish", () => {
        resolve(
          NextResponse.json({ ok: true, msg: "upload finished" })
        );
      });
    });

  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

     
