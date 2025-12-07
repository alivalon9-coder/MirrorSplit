// app/upload/page.tsx
"use client";

import React, { useCallback, useEffect, useState } from "react";

const CLOUD_NAME = "decklbi9r";       // جاهز
const UPLOAD_PRESET = "audio_upload"; // جاهز
const MAX_BYTES = 15 * 1024 * 1024;   // 15 MB

type RecentItem = { url: string; name: string; time: string };

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [error, setError] = useState("");
  const [recent, setRecent] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ms_recent_uploads");
      if (raw) setRecent(JSON.parse(raw));
    } catch {}
  }, []);

  const saveRecent = (item: RecentItem) => {
    const next = [item, ...recent].slice(0, 8);
    setRecent(next);
    localStorage.setItem("ms_recent_uploads", JSON.stringify(next));
  };

  const onSelectFile = useCallback((f: File | null) => {
    setError("");
    setUploadedUrl("");
    setProgress(0);

    if (!f) {
      setFile(null);
      return;
    }

    if (!f.type.startsWith("audio/")) {
      setError("Please choose an audio file (mp3, wav, etc.).");
      setFile(null);
      return;
    }

    if (f.size > MAX_BYTES) {
      setError("File is too large. Max is 15 MB.");
      setFile(null);
      return;
    }

    setFile(f);
  }, [setFile]);

  const handleUpload = async () => {
    setError("");
    if (!file) {
      setError("Choose a file first.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setUploadedUrl("");

    try {
      await new Promise<void>((resolve, reject) => {
        const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
        const xhr = new XMLHttpRequest();
        const fd = new FormData();
        fd.append("file", file);
        fd.append("upload_preset", UPLOAD_PRESET);

        xhr.open("POST", url);

        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            const p = Math.round((e.loaded / e.total) * 100);
            setProgress(p);
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const data = JSON.parse(xhr.responseText);
              if (data.secure_url) {
                setUploadedUrl(data.secure_url);
                saveRecent({
                  url: data.secure_url,
                  name: file.name,
                  time: new Date().toLocaleString(),
                });
                resolve();
              } else {
                reject(new Error("Upload did not return a secure_url."));
              }
            } catch (err) {
              reject(err);
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error("Network error during upload."));
        xhr.send(fd);
      });
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setUploading(false);
      setProgress((p) => (p > 100 ? 100 : p));
    }
  };

  const clearAllRecent = () => {
    localStorage.removeItem("ms_recent_uploads");
    setRecent([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Upload Card */}
      <div className="lg:col-span-2">
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Upload audio</h2>
              <p className="text-sm text-gray-500 mt-1">
                Drag & drop or choose a file. Supported: MP3 / WAV. Max 15 MB.
              </p>
            </div>
            <div className="text-sm text-gray-400">Cloudinary</div>
          </div>

          <div
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0] ?? null;
              onSelectFile(f);
            }}
            onDragOver={(e) => e.preventDefault()}
            className="mt-6 border-2 border-dashed border-gray-200 hover:border-indigo-300 transition rounded-xl p-6 flex flex-col md:flex-row gap-6 items-center"
          >
            <div className="flex-1 min-h-[120px] flex items-center">
              <label className="w-full cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-indigo-50 rounded-lg">
                    <svg className="w-8 h-8 text-indigo-600" viewBox="0 0 24 24" fill="none">
                      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-800 font-medium">Drop audio here</div>
                    <div className="text-sm text-gray-500">or click to select from your device</div>
                  </div>
                </div>
                <input
                  aria-label="Choose audio file"
                  type="file"
                  accept="audio/*"
                  className="sr-only"
                  onChange={(e) => onSelectFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>

            <div className="w-full md:w-56 text-right">
              <div className="text-sm text-gray-500">Selected</div>
              <div className="mt-2 text-sm text-gray-700 font-semibold break-words">
                {file ? file.name : "No file selected"}
              </div>

              <div className="mt-4 flex gap-2 justify-end">
                <button
                  onClick={() => onSelectFile(null)}
                  disabled={uploading}
                  className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700"
                >
                  Clear
                </button>

                <button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold disabled:opacity-50"
                >
                  {uploading ? `Uploading ${progress}%` : "Upload"}
                </button>
              </div>
            </div>
          </div>

          {uploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-indigo-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-2 text-sm text-gray-500">{progress}%</div>
            </div>
          )}

          {error && (
            <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          {uploadedUrl && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-100">
              <div className="font-semibold text-green-800">Uploaded successfully</div>
              <a
                href={uploadedUrl}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 underline text-sm block mt-2"
              >
                Open file
              </a>

              <div className="mt-3">
                <audio controls src={uploadedUrl} className="w-full" />
              </div>
            </div>
          )}

          <div className="mt-6 text-xs text-gray-400">
            Tip: you can drag & drop an audio file to the area above. Recent uploads are saved locally.
          </div>
        </div>
      </div>

      {/* Right: Recent uploads */}
      <aside>
        <div className="bg-white shadow-lg rounded-2xl p-4 sticky top-28">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">Recent uploads</h3>
            <button onClick={clearAllRecent} className="text-xs text-gray-400 hover:text-gray-600">Clear</button>
          </div>

          {recent.length === 0 ? (
            <div className="text-sm text-gray-500">No recent uploads yet.</div>
          ) : (
            <ul className="flex flex-col gap-3">
              {recent.map((r, i) => (
                <li key={i} className="p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-800 break-words">{r.name}</div>
                      <div className="text-xs text-gray-400">{r.time}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <a href={r.url} target="_blank" rel="noreferrer" className="text-indigo-600 text-xs underline">Open</a>
                      <button onClick={() => { navigator.clipboard?.writeText(r.url); }} className="text-xs text-gray-500">Copy</button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
