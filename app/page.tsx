"use client";

import React, { useState } from "react";
import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";

export default function UploadEnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  const ffmpeg = createFFmpeg({
    log: true,
    progress: (p) => {
      if (p?.ratio) {
        setProgressText(`Processing ${(p.ratio * 100).toFixed(0)}%`);
      }
    },
  });

  async function handleEnhance() {
    if (!file) return alert("اختر ملف صوتي أولاً");
    setOutputUrl(null);
    setLoading(true);
    setProgressText("Loading FFmpeg...");

    if (!ffmpeg.isLoaded()) {
      await ffmpeg.load();
    }

    const inName = "input_audio";
    const outName = "output_mastered.mp3";

    // اقرأ الملف وابعته للـ ffmpeg FS
    ffmpeg.FS("writeFile", inName, await fetchFile(file));

    setProgressText("Applying mastering (normalization)...");
    /**
     * هذا الأمر بسيط ويطبق:
     * 1) تحويل للصيغة wav
     * 2) تطبيق loudnorm (loudness normalization) للحصول على مستوى صوت ثابت
     * 3) تحويل مرة أخرى ل mp3 مع معدل بت متوسط
     *
     * يمكنك تعديل خيارات ffmpeg حسب الرغبة.
     */
    await ffmpeg.run(
      "-i",
      inName,
      "-af",
      "loudnorm=I=-16:TP=-1.5:LRA=11",
      "-ar",
      "44100",
      "-ac",
      "2",
      "-b:a",
      "192k",
      outName
    );

    setProgressText("Finishing...");

    // اقرا الملف الناتج وانشأ رابط تنزيل
    const data = ffmpeg.FS("readFile", outName);
    const blob = new Blob([data.buffer], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    setOutputUrl(url);

    // نظّف الـ FS
    try {
      ffmpeg.FS("unlink", inName);
      ffmpeg.FS("unlink", outName);
    } catch (e) {}

    setLoading(false);
    setProgressText("Done — ready to download");
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Enhance (Mastering) — Mirrorsplit</h1>

      <label className="block mb-2">
        <span className="text-sm">اختر ملف صوتي (mp3, wav)</span>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => {
            setFile(e.target.files ? e.target.files[0] : null);
            setOutputUrl(null);
            setProgressText("");
          }}
          className="mt-2"
        />
      </label>

      <div className="flex gap-2 items-center mt-4">
        <button
          onClick={handleEnhance}
          disabled={loading || !file}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {loading ? "Processing..." : "Enhance"}
        </button>

        {progressText && <div className="text-sm text-gray-600">{progressText}</div>}
      </div>

      {outputUrl && (
        <div className="mt-6">
          <h3 className="font-semibold">Download / Preview</h3>
          <audio controls src={outputUrl} className="mt-2 w-full" />
          <div className="mt-2">
            <a
              href={outputUrl}
              download="mirrorsplit_mastered.mp3"
              className="text-sm text-blue-600 underline"
            >
              Download mastered mp3
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
