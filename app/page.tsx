// app/upload/page.tsx
"use client";
import React, { useRef, useState } from "react";

type UploadState = {
  progress: number;
  uploading: boolean;
  message?: string;
  url?: string;
  error?: string;
};

const MAX_AUDIO_BYTES = 20 * 1024 * 1024; // 20 MB

export default function UploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [upload, setUpload] = useState<UploadState>({ progress: 0, uploading: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  function setError(msg: string) {
    setUpload(s => ({ ...s, error: msg, message: undefined, uploading: false }));
  }

  function handleAudioPick(files?: FileList | null) {
    const file = files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      setError("Please select a valid audio file.");
      return;
    }
    if (file.size > MAX_AUDIO_BYTES) {
      setError("File too large. Max recommended size is 20 MB.");
      return;
    }
    setAudioFile(file);
    setUpload(s => ({ ...s, message: undefined, error: undefined }));
    setTitle(prev => prev || file.name.replace(/\.[^/.]+$/, ""));
  }

  function handleCoverPick(files?: FileList | null) {
    const file = files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Cover must be an image.");
      return;
    }
    setCoverFile(file);
    setUpload(s => ({ ...s, error: undefined }));
  }

  function clearAll() {
    setAudioFile(null);
    setCoverFile(null);
    setTitle("");
    setUpload({ progress: 0, uploading: false });
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (coverInputRef.current) coverInputRef.current.value = "";
  }

  function uploadToServer() {
    if (!audioFile) return setError("Choose an audio file first.");
    setUpload({ progress: 0, uploading: true });

    const form = new FormData();
    form.append("audio", audioFile);
    if (coverFile) form.append("cover", coverFile);
    form.append("title", title);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUpload(s => ({ ...s, progress: pct, uploading: true }));
      }
    };
    xhr.onload = () => {
      try {
        const body = JSON.parse(xhr.responseText || "{}");
        if (xhr.status >= 200 && xhr.status < 300) {
          setUpload({
            progress: 100,
            uploading: false,
            message: body?.message ?? "Upload finished",
            url: body?.url ?? undefined,
            error: undefined,
          });
        } else {
          setError(body?.error ?? "Upload failed. Server returned an error.");
        }
      } catch (err) {
        setError("Upload completed but response was unexpected.");
      }
    };
    xhr.onerror = () => setError("Upload failed. Please try again.");
    xhr.send(form);
  }

  async function copyLink() {
    if (!upload.url) return;
    try {
      await navigator.clipboard.writeText(upload.url);
      setUpload(s => ({ ...s, message: "Link copied to clipboard" }));
    } catch {
      setUpload(s => ({ ...s, message: "Failed to copy. Select and copy manually." }));
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <section className="bg-white/90 border rounded-lg shadow p-6">
        <header className="mb-4">
          <h1 className="text-2xl md:text-3xl font-semibold">Upload Audio</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a title, optional cover art, then upload your track. After upload you'll get a shareable link.
          </p>
        </header>

        <div className="space-y-5">
          {/* Title */}
          <label className="block">
            <span className="text-sm font-medium">Title</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              aria-label="Track title"
              className="mt-2 block w-full rounded-md border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
          </label>

          {/* Audio drop / select */}
          <div
            onDrop={(e) => { e.preventDefault(); handleAudioPick(e.dataTransfer.files); }}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-md p-4 text-center"
            role="button"
            aria-label="Drop audio file here"
          >
            <p className="text-sm text-gray-600 mb-3">Drag & drop audio file here (mp3, wav, m4a) — or</p>

            <div className="flex items-center justify-center gap-3">
              <label
                htmlFor="audioInput"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md cursor-pointer"
                aria-hidden
              >
                Choose audio
              </label>
              <input
                id="audioInput"
                ref={audioInputRef}
                type="file"
                accept="audio/*"
                onChange={(e) => handleAudioPick(e.target.files)}
                className="hidden"
              />

              <span className="text-sm text-gray-500">Max recommended 20MB</span>
            </div>
          </div>

          {/* Cover & preview */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm font-medium block">Cover image (optional)</label>
                <label
                  htmlFor="coverInput"
                  className="inline-flex items-center gap-2 px-3 py-2 mt-2 border rounded-md cursor-pointer"
                >
                  Select image
                </label>
                <input
                  id="coverInput"
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleCoverPick(e.target.files)}
                  className="hidden"
                />
              </div>

              {coverFile && (
                <div className="w-20 h-20 rounded overflow-hidden border">
                  <img
                    src={URL.createObjectURL(coverFile)}
                    alt="cover preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>

            {audioFile && (
              <div className="flex-1">
                <div className="text-sm text-gray-600">Preview</div>
                <div className="mt-2">
                  <audio ref={audioRef} controls src={URL.createObjectURL(audioFile)} className="w-full" />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={uploadToServer}
              disabled={upload.uploading || !audioFile}
              aria-disabled={upload.uploading || !audioFile}
              className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-60"
            >
              {upload.uploading ? "Uploading…" : "Start upload"}
            </button>

            <button onClick={clearAll} className="px-4 py-2 rounded border">
              Clear
            </button>

            <div className="ml-auto text-sm text-gray-500">
              {audioFile ? `${audioFile.name} (${Math.round((audioFile.size/1024)/1024*10)/10} MB)` : "No file selected"}
            </div>
          </div>

          {/* Progress & messages */}
          <div>
            <div className="h-2 bg-gray-200 rounded overflow-hidden">
              <div
                aria-hidden
                className="h-full bg-blue-600 transition-all"
                style={{ width: `${upload.progress}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="text-gray-600">{upload.message ?? ""}</div>
              <div className="text-gray-500">{upload.progress ? `${upload.progress}%` : ""}</div>
            </div>

            {upload.error && (
              <div className="mt-3 text-sm text-red-600 font-medium">
                {upload.error}
              </div>
            )}
          </div>

          {/* Result */}
          {upload.url && (
            <div className="mt-3 text-sm flex items-start gap-3">
              <div className="flex-1">
                <div className="font-medium">Share link</div>
                <a className="text-blue-600 break-words" href={upload.url} target="_blank" rel="noreferrer">
                  {upload.url}
                </a>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={copyLink} className="px-3 py-2 rounded bg-gray-100 border text-sm">Copy</button>
                <a className="px-3 py-2 rounded bg-green-600 text-white text-sm" href={upload.url} target="_blank" rel="noreferrer">
                  Open
                </a>
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
