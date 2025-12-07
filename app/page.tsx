<<<<<<< HEAD
// app/upload/page.tsx
"use client";

import React, { useState } from "react";

export default function UploadEnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // loadFFmpeg: tries multiple CDN candidates and returns { ffmpeg, fetchFile }
  async function loadFFmpeg() {
    if (typeof window === "undefined") throw new Error("FFmpeg must run in browser");

    const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");

    const CORE_CANDIDATES = [
      // try jsdelivr first
      "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.1/dist/ffmpeg-core.js",
      // then unpkg fallback
      "https://unpkg.com/@ffmpeg/core@0.11.1/dist/ffmpeg-core.js",
      // another fallback (gh)
      "https://cdn.jsdelivr.net/gh/ffmpegwasm/ffmpeg-core@0.11.1/dist/ffmpeg-core.js",
    ];

    let ffmpeg: any = null;
    let lastErr: any = null;

    for (const corePath of CORE_CANDIDATES) {
      try {
        setProgressText(`Loading ffmpeg core from CDN...`);
        ffmpeg = createFFmpeg({
          corePath,
          log: true,
          progress: (p) => {
            if (p?.ratio) setProgressText(`Processing ${(p.ratio * 100).toFixed(0)}%`);
          },
        });
        await ffmpeg.load();
        // loaded successfully
        return { ffmpeg, fetchFile };
      } catch (err) {
        lastErr = err;
        // warning to console for debugging (won't crash UI)
        // eslint-disable-next-line no-console
        console.warn("ffmpeg core load failed for", corePath, err);
        // try next candidate
      }
    }

    // if we reach here, all candidates failed
    throw new Error("Failed to load ffmpeg core from CDN. Last error: " + (lastErr?.message || lastErr));
  }

  async function handleEnhance() {
    if (!file) return alert("اختر ملف صوتي أولاً");

    setLoading(true);
    setProgressText("Initializing... please wait");
    setOutputUrl(null);

    try {
      const { ffmpeg, fetchFile } = await loadFFmpeg();

      const inputName = "input_audio";
      const outputName = "mastered.mp3";

      // write file to ffmpeg FS
      ffmpeg.FS("writeFile", inputName, await fetchFile(file));
      setProgressText("Applying mastering (loudness normalization)...");

      await ffmpeg.run(
        "-i",
        inputName,
        "-af",
        "loudnorm=I=-16:TP=-1.5:LRA=11",
        "-ar",
        "44100",
        "-ac",
        "2",
        "-b:a",
        "192k",
        outputName
      );

      const data = ffmpeg.FS("readFile", outputName);
      const blob = new Blob([data.buffer], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      setOutputUrl(url);
      setProgressText("Done — ready to download");

      // cleanup FS
      try {
        ffmpeg.FS("unlink", inputName);
        ffmpeg.FS("unlink", outputName);
      } catch (e) {
        // ignore
      }
    } catch (err: any) {
      console.error("Enhance error:", err);
      const msg = err?.message || String(err);
      setProgressText("Error: " + msg);
      // helpful hint in UI if core couldn't load
      if (msg.includes("Failed to load ffmpeg core") || msg.includes("404") || msg.includes("network")) {
        setProgressText("Failed to load ffmpeg core from CDN. Try redeploy or check network/CDN. If continues I'll switch to server-side mastering.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enhance (Mastering) — Mirrorsplit</h1>

      <label className="block mb-3">
        <span className="text-sm text-gray-700">اختر ملف صوتي (mp3, wav)</span>
        <input
          type="file"
          accept="audio/*"
          className="mt-2"
          onChange={(e) => {
            setFile(e.target.files?.[0] ?? null);
            setOutputUrl(null);
            setProgressText("");
          }}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          onClick={handleEnhance}
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Enhance"}
        </button>

        <button
          onClick={() => {
            setFile(null);
            setOutputUrl(null);
            setProgressText("");
          }}
          className="px-3 py-1 bg-gray-200 rounded"
        >
          Clear
        </button>
      </div>

      {progressText && <div className="mt-3 text-gray-600 text-sm">{progressText}</div>}

      {





ChatGPT can make mistakes. Che
=======
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
    // مؤقت: محاكاة رفع
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
import UploadIconFloating from "@/components/UploadIconFloating";

export default function UploadPage() {
  const handleUploaded = (url) => {
    console.log("Uploaded URL:", url);
    // ممكن تعرضه في صفحة، تخزنه في DB، أو تعمل أي حاجة
  };

  return (
    <>
      <main className="min-h-screen">
        {/* هنا يجي كل محتوى صفحتك و الtheme */}
      </main>

      {/* أي مكان بعد الـ main تقدر تضيف المكون، لأنه ثابت (fixed) */}
      <UploadIconFloating onUploaded={handleUploaded} />
    </>
  );
}
>>>>>>> 83d3972 (Deploy: update upload UI)
