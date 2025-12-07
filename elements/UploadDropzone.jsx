"use client";
import React, { useRef, useState } from "react";

export default function UploadIconFloating({ onUploaded }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadFile = async (file) => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", UPLOAD_PRESET || "");
      // use /auto/upload so Cloudinary auto-detects image/audio/video
      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`;
      const res = await fetch(url, { method: "POST", body: fd });

      // read response (debug-friendly)
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch (e) { data = { raw: text }; }

      if (!res.ok) {
        console.error("[UploadIconFloating] bad response", res.status, data);
        throw new Error(`Upload failed status=${res.status}`);
      }

      const uploadedUrl = data.secure_url || data.url;
      onUploaded && onUploaded(uploadedUrl);
      // small success feedback
      try { navigator.clipboard?.writeText(uploadedUrl); } catch(e) {}
      alert("Uploaded: " + uploadedUrl);
      return uploadedUrl;
    } catch (err) {
      console.error("[UploadIconFloating] upload error", err);
      alert("Upload failed: " + (err.message || err));
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onChange = (e) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
  };

  return (
    <>
      <button
        onClick={() => inputRef.current?.click()}
        aria-label="Upload"
        className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transform hover:scale-[1.05] transition
                   bg-gradient-to-br from-[rgba(255,255,255,0.06)] to-[rgba(255,255,255,0.03)]"
        style={{ border: "1px solid rgba(255,255,255,0.06)" }}
      >
        {loading ? (
          <svg className="animate-spin w-6 h-6" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 5 17 10"/>
            <line x1="12" y1="5" x2="12" y2="19"/>
          </svg>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,audio/*,video/*"
        className="hidden"
        onChange={onChange}
      />
    </>
  );
}
