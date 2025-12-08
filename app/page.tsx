<h1 style={{color: "red"}}>TEST DEPLOY</h1>

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
    <div className="relative min-h-screen bg-slate-900 text-slate-100 py-12">
      {/* decorative background layer: behind content, doesn't capture pointer events */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        {/* gradient background */}
        <div className="w-full h-full bg-gradient-to-b from-indigo-900 via-violet-800 to-rose-700 opacity-95" />
        {/* optional subtle pattern overlay (pointer-events-none so it won't block clicks) */}
        <div className="absolute inset-0 -z-10 pointer-events-none" aria-hidden>
          {/* you can put svg or image here if you want */}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        {/* Hero (kept decorative) */}
        <div className="mb-8 rounded-2xl bg-white/6 backdrop-blur-sm border border-white/6 p-6 md:p-8 shadow-lg relative z-0">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">MirrorSplit — Upload & Share</h1>
              <p className="mt-2 text-sm text-white/80 max-w-xl">
                Upload your track, add cover art and get a shareable link. Mobile friendly and fast.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-lg bg-white/6 flex items-center justify-center border border-white/8">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" className="text-white/90">
                  <path d="M12 2v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M18.4 4.6L15 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M4 12a8 8 0 1 0 16 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main card (raised above background with z-10) */}
        <section className="relative z-10 bg-white/6 border border-white/8 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Left column: form */}
            <div className="md:col-span-2">
              <label className="block mb-3">
                <span className="text-sm font-medium text-white/90">Title</span>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Track title"
                  className="mt-2 block w-full rounded-md border border-white/12 bg-white/4 px-3 py-2 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/20"
                />
              </label>

              <div
                onDrop={(e) => { e.preventDefault(); handleAudioPick(e.dataTransfer.files); }}
                onDragOver={(e) => e.preventDefault()}
                className="rounded-lg border-2 border-dashed border-white/12 p-6 text-center bg-white/3"
              >
                <p className="text-sm text-white/85 mb-3">Drag & drop audio here (mp3, wav, m4a) — or</p>

                <div className="flex items-center justify-center gap-3">
                  <label
                    htmlFor="audioInput"
                    className="inline-flex items-center gap-2 px-5 py-3 bg-indigo-600 rounded-lg text-sm font-semibold cursor-pointer hover:bg-indigo-500 transition pointer-events-auto"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12" stroke="white" strokeWidth="1.5" strokeLinecap="round"/><path d="M8 7l4-4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
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
                  <span className="text-sm text-white/70">Max: 20MB</span>
                </div>

                {audioFile && (
                  <div className="mt-4 text-left">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm font-medium text-white/90">{audioFile.name}</div>
                        <div className="text-xs text-white/70 mt-1">{Math.round((audioFile.size/1024)/1024*10)/10} MB</div>
                      </div>
                      <div className="text-sm text-white/70">{upload.progress ? `${upload.progress}%` : ""}</div>
                    </div>

                    <div className="mt-3">
                      <audio ref={audioRef} controls src={URL.createObjectURL(audioFile)} className="w-full" />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div>
                  <label className="text-sm font-medium text-white/90 block">Cover (optional)</label>
                  <label htmlFor="coverInput" className="inline-flex items-center gap-2 px-3 py-2 mt-2 border rounded-md cursor-pointer bg-white/4 pointer-events-auto">
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
                  <div className="w-24 h-24 rounded overflow-hidden border border-white/12">
                    <img src={URL.createObjectURL(coverFile)} alt="cover" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="mt-6 flex items-center gap-3">
                <button
                  onClick={uploadToServer}
                  disabled={upload.uploading || !audioFile}
                  className="px-5 py-3 rounded-lg bg-rose-500 text-white font-semibold disabled:opacity-60 pointer-events-auto"
                >
                  {upload.uploading ? "Uploading…" : "Start upload"}
                </button>

                <button onClick={clearAll} className="px-4 py-3 rounded-lg border border-white/12 text-white/90 bg-white/4 pointer-events-auto">
                  Clear
                </button>

                <div className="ml-auto text-sm text-white/70">
                  {audioFile ? "Ready to upload" : "No file selected"}
                </div>
              </div>

              {/* progress */}
              <div className="mt-4">
                <div className="h-2 bg-white/10 rounded overflow-hidden">
                  <div className="h-full bg-rose-500 transition-all" style={{ width: `${upload.progress}%` }} />
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <div className="text-white/80">{upload.message ?? upload.error ?? ""}</div>
                  <div className="text-white/60">{upload.progress ? `${upload.progress}%` : ""}</div>
                </div>
              </div>

              {/* result */}
              {upload.url && (
                <div className="mt-4 flex items-start gap-3 bg-white/6 p-3 rounded">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white/90">Share link</div>
                    <a className="text-amber-200 break-words" href={upload.url} target="_blank" rel="noreferrer">{upload.url}</a>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={copyLink} className="px-3 py-2 rounded bg-white/10 text-white text-sm pointer-events-auto">Copy</button>
                    <a className="px-3 py-2 rounded bg-amber-500 text-white text-sm" href={upload.url} target="_blank" rel="noreferrer">Open</a>
                  </div>
                </div>
              )}
            </div>

            {/* Right column: info */}
            <aside className="p-4 rounded-lg border border-white/6 bg-white/3">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-white/90">Upload tips</h3>
                <ul className="mt-2 text-xs text-white/80 space-y-2">
                  <li>Use MP3 or WAV for best compatibility.</li>
                  <li>Keep file under 20MB for faster uploads.</li>
                  <li>Add a clear title so listeners can find your track.</li>
                </ul>
              </div>

              <div className="mb-4">
                <h4 className="text-xs font-medium text-white/90">Account</h4>
                <p className="text-xs text-white/80 mt-1">Sign in with GitHub to manage your uploads (coming soon).</p>
              </div>

              <div className="mt-4 text-xs text-white/70">
                <strong>Status:</strong>
                <div className="mt-2">
                  {upload.uploading ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-amber-500 text-black text-sm">Uploading…</div>
                  ) : upload.url ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-emerald-500 text-black text-sm">Uploaded</div>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-white/6 text-white text-sm">Idle</div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </section>

        <footer className="mt-8 text-center text-sm text-white/60">
          © {new Date().getFullYear()} MirrorSplit — Built with ♥
        </footer>
      </div>
    </div>
  );
}
