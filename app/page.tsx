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

        {outputUrl && (
          <div className="mt-4">
            <a
              href={outputUrl}
              download="mastered.mp3"
              className="text-blue-600 underline"
            >
              Download mastered file
            </a>
            <audio
              controls
              src={outputUrl}
              className="mt-2 w-full"
            />
          </div>
        )}
      </div>
    );
  }
