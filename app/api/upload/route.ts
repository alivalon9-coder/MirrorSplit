import { NextResponse } from "next/server";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: Request) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      uploadDir: "public/uploads",
      keepExtensions: true,
      multiples: false,
    });

    form.parse(req as any, (err, fields, files) => {
      if (err) {
        reject(NextResponse.json({ success: false, error: err.message }));
        return;
      }

      const file = files.file;
      const filename = Array.isArray(file) ? file[0].newFilename : file.newFilename;
      const url = /uploads/${encodeURIComponent(filename)};

      resolve(
        NextResponse.json({
          success: true,
          name: filename,
          url,
        })
      );
    });
  });

      const file = files.file;