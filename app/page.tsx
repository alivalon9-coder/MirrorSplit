"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "audio_upload"); // ← اسم الـ preset
    formData.append("cloud_name", "decklbi9r"); // ← cloud name بتاعك

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/decklbi9r/upload",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    console.log(data);

    if (data.secure_url) setUploadedUrl(data.secure_url);
    else alert("Upload failed");
  };

  return (
    <div>
      <h1>Upload</h1>

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <button onClick={handleUpload}>Upload</button>

      {uploadedUrl && (
        <div>
          <p>Uploaded!</p>
          <a href={uploadedUrl} target="_blank">
            Open file
          </a>
        </div>
      )}
    </div>
  );
}
