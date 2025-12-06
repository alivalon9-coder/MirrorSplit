"use client";

import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setMsg("Please choose a file first.");
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        setMsg("Upload failed: " + (text || res.statusText));
      } else {
        const data = await res.json();
        setMsg("Upload OK. Server response: " + JSON.stringify(data));
      }
    } catch (err: any) {
      setMsg("Request error: " + (err?.message || err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column" }}>
      <h1>Upload</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <div style={{ marginTop: 12 }}>
          <button type="submit" disabled={loading}>{loading ? "Uploading..." : "Upload"}</button>
        </div>
      </form>
      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
    </main>
  );
}



   

 
