"use client";
import React, { useRef, useState } from "react";

export default function UploadIconFloating({ onUploaded }) {
  const inputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const clickOpen = () => inputRef.current?.click();

  const onChange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setLoading(true);
    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      if (!cloudName || !uploadPreset) throw new Error("Missing Cloudinary env vars");

      const form = new FormData();
      form.append("file", f);
      form.append("upload_preset", uploadPreset);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.message || "Upload failed");
      const url = json.secure_url || json.url;
      if (onUploaded) onUploaded(url);
      alert("Upload success");
    } catch (err) {
      console.error(err);
      alert("Upload error: " + (err.message || err));
    } finally {
      setLoading(false);
      e.target.value = ""; // reset file input
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        style={{ display: "none" }}
        onChange={onChange}
      />
      <button
        onClick={clickOpen}
        disabled={loading}
        title="Upload"
        style={{
          position: "fixed",
          right: 20,
          bottom: 20,
          width: 64,
          height: 64,
          borderRadius: 32,
          background: "#0f172a",
          color: "#fff",
          fontSize: 26,
          border: "none",
          boxShadow: "0 6px 18px rgba(2,6,23,0.4)",
          cursor: "pointer",
        }}
      >
        {loading ? "..." : "▲"}
      </button>
    </>
  );
}
