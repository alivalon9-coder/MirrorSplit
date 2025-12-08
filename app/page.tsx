// app/upload/page.tsx
"use client";
import React, { useRef, useState } from "react";

type UploadState = {
  progress: number;
  uploading: boolean;
  message?: string;
  url?: string;
};

export default function UploadPage() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [upload, setUpload] = useState<UploadState>({ progress: 0, uploading: false });
  const audioRef = useRef<HTMLAudioElement | null>(null);

  function handleAudioPick(f?: FileList | null) {
    const file = f?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("audio/")) return setUpload(s => ({ ...s, message: "Please select an audio file." }));
    setAudioFile(file);
    setUpload(s => ({ ...s, message: undefined }));
    setTitle(prev => prev || file.name.replace(/\.[^/.]+$/, ""));
  }

  function handleCoverPick(f?: FileList | null) {
    const file = f?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) return setUpload(s => ({ ...s, message: "Cover must be an image." }));
    setCoverFile(file);
  }

  function uploadToServer() {
    if (!audioFile) return setUpload(s => ({ ...s, message: "Choose an audio file first." }));
    const form = new FormData();
    form.append("audio", audioFile);
    if (coverFile) form.append("cover", coverFile);
    form.append("title", title);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100);
        setUpload({ progress: pct, uploading: true });
      }
    };
    xhr.onload = () => {
      setUpload({ progress: 100, uploading: false, message: "Upload finished" });
      try {
        const body = JSON.parse(xhr.responseText);
        if (body?.url) setUpload(s => ({ ...s, url: body.url, message: "Uploaded successfully" }));
      } catch (err) {
        setUpload(s => ({ ...s, message: "Upload completed but response was unexpected." }));
      }
    };
    xhr.onerror = () => setUpload({ progress: 0, uploading: false, message: "Upload failed. Try again." });
    xhr.send(form);
    setUpload({ progress: 0, uploading: true, message: "Uploading..." });
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Upload Audio</h1>
        <p className="text-sm text-gray-600">Add title, optional cover art, and upload. Share a link after upload.</p>
      </header>

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm">Title</span>
          <input value={title} onChange={e => setTitle(e.target.value)} className="mt-1 block w-full rounded-md border px-3 py-2" placeholder="Track title" />
        </label>

        <div
          onDrop={(e) => { e.preventDefault(); handleAudioPick(e.dataTransfer.files); }}
          onDragOver={(e) => e.preventDefault()}
          className="border-dashed border-2 p-6 rounded-md text-center"
        >
          <p className="mb-2">Drag & drop audio file here, or</p>
          <input type="file" accept="audio/*" onChange={(e) => handleAudioPick(e.target.files)} />
          <p className="text-xs text-gray-500 mt-2">Supported: mp3, wav, m4a. Max 20MB recommended.</p>
        </div>

        <div className="flex gap-4 items-center">
          <div>
            <label className="block text-sm">Cover image (optional)</label>
            <input type="file" accept="image/*" onChange={(e) => handleCoverPick(e.target.files)} />
          </div>
          {coverFile && (
            <img src={URL.createObjectURL(coverFile)} alt="cover preview" className="w-20 h-20 object-cover rounded" />
          )}
        </div>

        {audioFile && (
          <div>
            <strong>Preview:</strong>
            <div className="mt-2">
              <audio ref={audioRef} controls src={URL.createObjectURL(audioFile)} />
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button disabled={upload.uploading} onClick={uploadToServer} className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50">
            {upload.uploading ? "Uploading…" : "Start upload"}
          </button>
          <button onClick={() => { setAudioFile(null); setCoverFile(null); setTitle(""); }} className="px-4 py-2 rounded border">Clear</button>
        </div>

        {upload.uploading && (
          <div className="w-full bg-gray-200 rounded h-4 overflow-hidden mt-2">
            <div style={{ width: `${upload.progress}%` }} className="h-full bg-blue-600 transition-all" />
          </div>
        )}

        {upload.message && <p className="text-sm text-gray-700 mt-2">{upload.message}</p>}
        {upload.url && <p className="text-sm mt-2">Share link: <a className="text-blue-600" href={upload.url}>{upload.url}</a></p>}
      </div>
    </div>
  );
}

