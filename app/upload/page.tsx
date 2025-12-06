// app/upload/page.tsx
"use client";
import React, { useRef, useState } from "react";
import Link from "next/link";

type Uploaded = {
  url: string;
  public_id?: string;
  resource_type?: string;
  original_filename?: string;
};

export default function UploadPage(): JSX.Element {
  const CLOUD_NAME = "declkbi9r";
  const UPLOAD_PRESET = "qvehbn1y";

  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<Uploaded[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const detectType = (url: string) => {
    if (url.match(/\.(mp3|wav|m4a|ogg)$/i)) return "audio";
    if (url.match(/\.(mp4|webm|ogg)$/i)) return "video";
    if (url.match(/\.(jpeg|jpg|png|gif|webp)$/i)) return "image";
    return "other";
  };

  const handleSelect = (f: File | null) => {
    setFile(f);
    setMessage(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    setUploading(true);
    setProgress(0);
    setMessage(null);

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("upload_preset", UPLOAD_PRESET);

    try {
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) {
            setProgress(Math.round((e.loaded / e.total) * 100));
          }
        };
        xhr.onload = () => {
          try {
            const res = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              const uploadedItem: Uploaded = {
                url: res.secure_url || res.url,
                public_id: res.public_id,
                resource_type: res.resource_type,
                original_filename: res.original_filename || res.public_id,
              };
              setUploaded((s) => [uploadedItem, ...s]);
              setMessage("Upload succeeded ✅");
              resolve();
            } else {
              setMessage("Upload failed: " + (res.error?.message || "unknown"));
              reject(new Error("Upload failed"));
            }
          } catch (err) {
            setMessage("Upload failed (invalid response)");
            reject(err);
          }
        };
        xhr.onerror = () => {
          setMessage("Network error");
          reject(new Error("Network error"));
        };
        xhr.send(fd);
      });
    } catch (err) {
    } finally {
      setUploading(false);
      setProgress(0);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setFile(null);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={styles.logo}>🎧</div>
          <div>
            <div style={{ fontWeight: 700 }}>CloudShare — Upload</div>
            <div style={{ fontSize: 12, color: "#666" }}>Direct upload to Cloudinary</div>
          </div>
        </div>

        <div>
          <Link href="/" style={styles.linkBtn}>Home</Link>
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h3 style={{ marginTop: 0 }}>Upload a file</h3>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              ref={inputRef}
              type="file"
              accept="audio/*,image/*,video/*"
              onChange={(e) => handleSelect(e.target.files?.[0] ?? null)}
            />
            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{ ...styles.primaryBtn, opacity: uploading ? 0.7 : 1 }}
            >
              {uploading ? `Uploading... ${progress}%` : "Upload"}
            </button>
          </div>

          {message && <p style={{ marginTop: 12 }}>{message}</p>}

          {uploading && (
            <div style={{ marginTop: 8 }}>
              <div style={{ height: 8, background: "#eee", borderRadius: 6 }}>
                <div style={{ width: `${progress}%`, height: "100%", background: "#0b5cff" }} />
              </div>
            </div>
          )}

          {uploaded.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <h4>Recently uploaded</h4>

              <div style={styles.grid}>
                {uploaded.map((u, idx) => {
                  const type = detectType(u.url);
                  return (
                    <div key={idx} style={styles.previewCard}>
                      <div>
                        {type === "image" && <img src={u.url} style={{ maxWidth: "100%", borderRadius: 6 }} />}
                        {type === "audio" && <audio controls src={u.url} style={{ width: "100%" }} />}
                        {type === "video" && <video controls src={u.url} style={{ width: "100%" }} />}
                        {type === "other" && <a href={u.url}>Open file</a>}
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontSize: 12, wordBreak: "break-all" }}>
                          <a href={u.url} target="_blank" style={{ color: "#0b5cff" }}>{u.url}</a>
                        </div>
                        <div style={{ marginTop: 6 }}>
                          <a href={u.url} download style={styles.downloadBtn}>Download</a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { fontFamily: "Inter, system-ui", color: "#111" },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    maxWidth: 900, margin: "20px auto", padding: "0 12px"
  },
  logo: {
    width: 40, height: 40, borderRadius: 10, background: "#eef6ff",
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  linkBtn: {
    padding: "8px 12px", background: "#eef1ff",
    color: "#0b5cff", borderRadius: 8, textDecoration: "none"
  },
  main: { maxWidth: 900, margin: "0 auto", padding: "12px" },
  card: { border: "1px solid #eee", padding: 18, borderRadius: 10, background: "#fff" },
  primaryBtn: { padding: "8px 12px", background: "#0b5cff", color: "#fff", borderRadius: 8, border: "none" },
  grid: { display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" },
  previewCard: { border: "1px solid #f0f0f0", padding: 12, borderRadius: 8, background: "#fafafa" },
  downloadBtn: { display: "inline-block", padding: "6px 10px", background: "#0b5cff", color: "#fff", borderRadius: 6, textDecoration: "none" }
};
