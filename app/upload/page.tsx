// app/upload/page.tsx
"use client";

import React, { useState } from "react";

export default function UploadPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // استخدم متغيرات بيئية على Vercel بدل الحفظ المباشر
  // في محلي ممكن تعمل .env.local وتضع NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME و NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
  const CLOUD_NAME =
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "declkbi9r";
  const PRESET =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "audio_upload";

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // تحقق سريع من نوع الملف وحجم بسيط
    const allowedTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/x-m4a", "audio/mp4", "audio/aac"];
    if (!allowedTypes.includes(file.type)) {
      setError("الملف مش نوع صوتي مدعوم. استخدم mp3/wav/m4a.");
      return;
    }
    if (file.size > 20 * 1024 * 1024) { // 20MB حد نموذجي
      setError("حجم الملف كبير جداً (أكبر من 20MB).");
      return;
    }

    setFileName(file.name);
    setUploading(true);
    setUrl(null);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", PRESET);
      // optional: force resource_type 'auto' (Cloudinary عادة يتعرف تلقائياً)
      // formData.append("resource_type", "auto");

      // نستخدم XMLHttpRequest علشان نقدر نعرض % التقدم
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(
          "POST",
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`
        );

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            setProgress(percent);
          }
        };

        xhr.onload = () => {
          try {
            const resText = xhr.responseText;
            const data = resText ? JSON.parse(resText) : null;

            if (xhr.status >= 200 && xhr.status < 300) {
              setUrl((data && (data.secure_url || data.url)) || null);
              setProgress(100);
              resolve();
            } else {
              const msg =
                (data && data.error && data.error.message) ||
                data?.message ||
                `Upload failed: ${xhr.status}`;
              setError(msg);
              reject(new Error(msg));
            }
          } catch (err: any) {
            const text = xhr.responseText || "Unknown error";
            setError(String(text));
            reject(err);
          }
        };

        xhr.onerror = () => {
          setError("Upload failed (network).");
          reject(new Error("Network error"));
        };

        xhr.send(formData);
      });
    } catch (err: any) {
      console.error(err);
      if (!error) setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
      // لو فشل ممكن نرجع progress إلى null أو 0
      if (!url) setProgress(null);
    }
  }

  return (
    <main style={{ padding: 24, fontFamily: "Arial, sans-serif", maxWidth: 680 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Upload</h1>

      <input
        type="file"
        accept="audio/*"
        onChange={handleFile}
        style={{ display: "block", margin: "12px 0" }}
      />

      {fileName && <div>Selected: <strong>{fileName}</strong></div>}
      {uploading && <div style={{ marginTop: 8 }}>Uploading… please wait</div>}

      {progress !== null && (
        <div style={{ marginTop: 8 }}>
          <div style={{ width: "100%", background: "#eee", height: 10, borderRadius: 6 }}>
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "#4caf50",
                borderRadius: 6,
                transition: "width 200ms",
              }}
            />
          </div>
          <div style={{ marginTop: 6 }}>{progress}%</div>
        </div>
      )}

      {error && (
        <div style={{ marginTop: 12, color: "crimson" }}>
          Error: {error}
        </div>
      )}

      {url && (
        <div style={{ marginTop: 12 }}>
          <div>Uploaded!</div>
          <a href={url} target="_blank" rel="noreferrer">
            Open file
          </a>
          <audio controls src={url} style={{ display: "block", marginTop: 8, width: "100%" }} />
        </div>
      )}
    </main>
  );
}
