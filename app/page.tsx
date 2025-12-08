"use client";

import React, { useState } from "react";

export default function UploadEnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // helper: load ffmpeg only in browser
  async function loadFFmpeg() {
    if (typeof window === "undefined") throw new Error("FFmpeg must run in browser");

    const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");

    const ffmpeg = createFFmpeg({
      corePath:
        // try official CDN first; you can switch version if needed
        "https://unpkg.com/@ffmpeg/core@0.11.1/dist/ffmpeg-core.js",
      log: true,
      progress: (p) => {
        if (p?.ratio) setProgressText(`Processing ${(p.ratio * 100).toFixed(0)}%`);
      },
    });

    await ffmpeg.load();
    return { ffmpeg, fetchFile };
  }

  async function handleEnhance() {
    if (!file) return alert("اختر ملف صوتي أولاً");
    setLoading(true);
    setProgressText("Initializing...");

    try {
      const { ffmpeg, fetchFile } = await loadFFmpeg();

      const inputName = "input.mp3";
      const outputName = "mastered.mp3";

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

      // cleanup
      try {
        ffmpeg.FS("unlink", inputName);
        ffmpeg.FS("unlink", outputName);
      } catch (e) {}
      setProgressText("Done — ready to download");
    } catch (err: any) {
      console.error("Enhance error:", err);
      setProgressText("Error: " + (err?.message ?? "unknown"));
      // helpful tip: if core couldn't load, let user know
      if ((err?.message || "").includes("404") || (err?.message || "").includes("core")) {
        setProgressText(
          "Failed to load ffmpeg core. Try again or check network/CDN. (If continues, I'll switch to server-side master.)"
        );
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

      <button
        onClick={handleEnhance}
        disabled={loading || !file}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? "Processing..." : "Enhance"}
      </button>

      {progressText && <div className="mt-3 text-gray-600 text-sm">{progressText}</div>}

      {outputUrl && (
        <div className="mt-6">
          <h3 className="font-semibold">Preview & Download</h3>
          <audio controls src={outputUrl} className="mt-2 w-full" />
          <a href={outputUrl} download="mirrorsplit_mastered.mp3" className="mt-2 block text-blue-600 underline">
            Download mastered audio
          </a>
        </div>
      )}
    </div>
  );
}

