// app/page.tsx
"use client";
import React, { useState } from "react";

export default function Page() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);

    // محاكاة رفع مؤقتة (لو عندك لوجيك رفع حقيقي خلييه هنا)
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p === null) return 10;
        if (p >= 100) { clearInterval(id); return 100; }
        return p + 10;
      });
    }, 250);
  }

  return (
    <div className="min-h-screen p-8 bg-white text-gray-900">
      <a href="/" className="mb-6 block text-sm">HomeUpload</a>
      <h1 className="text-3xl font-bold mb-4">Upload</h1>

      <div className="mb-4">
        <input type="file" onChange={onFile} />
      </div>

      {fileName && <div className="mb-2 font-semibold">Selected: {fileName}</div>}

      {progress !== null && (
        <div className="w-full max-w-lg mt-3">
          <div className="h-3 bg-gray-200 rounded">
            <div style={{ width: `${progress}%` }} className="h-3 rounded bg-green-400 transition-all" />
          </div>
          <div className="mt-1 text-sm">{progress}%</div>
        </div>
      )}

      <footer className="mt-8 text-xs text-gray-500">© 2025 MirrorSplit • Built with ❤️ • Cloudinary</footer>
    </div>
  );
}
