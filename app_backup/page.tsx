"use client";
import React, { useEffect, useState } from "react";

export default function UploadPreviewPage() {
  const [file, setFile] = useState<File | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    // تنظيف الـ URL القديم لما الملف يتغير أو الكومبوننت يتفكك
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [objectUrl]);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      setObjectUrl(null);
      return;
    }
    // تأكد انه ملف صوتي
    if (!f.type.startsWith("audio/")) {
      alert("Please choose an audio file (mp3, wav, etc).");
      setFile(null);
      setObjectUrl(null);
      return;
    }

    // إذا كان في URL قديم نلغيّه
    if (objectUrl) URL.revokeObjectURL(objectUrl);

    const u = URL.createObjectURL(f);
    setFile(f);
    setObjectUrl(u);
  };

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>Upload & Preview (local)</h1>

      <input type="file" accept="audio/*" onChange={handleFile} />

      {file && (
        <div style={{ marginTop: 18 }}>
          <div><strong>File:</strong> {file.name} — {Math.round(file.size/1024)} KB</div>

          {/* Audio player — controls allow play/pause */}
          {objectUrl ? (
            <div style={{ marginTop: 12 }}>
              <audio controls src={objectUrl} style={{ width: "100%" }} />
              <div style={{ marginTop: 8 }}>
                <a href={objectUrl} download={file.name}>Download preview file</a>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 12 }}>Preparing preview...</div>
          )}
        </div>
      )}
    </div>
  );
}
