// app/upload/page.tsx
"use client";

import React, { useMemo, useRef, useState } from "react";
import Link from "next/link";

type AudioItem = {
  id: string;
  title: string;
  author: string;
  duration: string;
  price: number;
  tags: string[];
  previewUrl?: string;
};

const SAMPLE_ITEMS: AudioItem[] = [
  {
    id: "a1",
    title: "Ambient Corporate Mood",
    author: "Sound Studio",
    duration: "1:20",
    price: 9,
    tags: ["ambient", "corporate", "calm"],
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  },
  {
    id: "a2",
    title: "Upbeat Tech Loop",
    author: "Loop Masters",
    duration: "0:45",
    price: 14,
    tags: ["upbeat", "electronic", "loop"],
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  },
  {
    id: "a3",
    title: "Warm Acoustic Piano",
    author: "Acoustic Lab",
    duration: "1:05",
    price: 12,
    tags: ["piano", "warm", "emotional"],
    previewUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  },
];

function UploadInline() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [pickedName, setPickedName] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    console.log("picked file (home inline):", f);
    if (!f) {
      setPickedName(null);
      setStatus("");
      return;
    }
    setPickedName(f.name);
    setStatus("Ready to play locally");

    if (audioRef.current) {
      audioRef.current.src = URL.createObjectURL(f);
    }
  }

  return (
    <div style={{ marginTop: 18, padding: 12, border: "1px dashed #ccc", borderRadius: 8 }}>
      <strong>Quick Upload (from Home)</strong>
      <div style={{ marginTop: 8 }}>
        <input type="file" accept="audio/*" onChange={handleFile} />
      </div>
      <div style={{ marginTop: 8 }}>
        <div>Status: {status}</div>
        {pickedName && <div>Selected: {pickedName}</div>}
      </div>

      <div style={{ marginTop: 10 }}>
        <audio ref={audioRef} controls style={{ width: "100%" }} />
      </div>
    </div>
  );
}

export default function UploadPage() {
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const tags = useMemo(() => {
    const set = new Set<string>();
    SAMPLE_ITEMS.forEach((it) => it.tags.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SAMPLE_ITEMS.filter((it) => {
      if (selectedTag && !it.tags.includes(selectedTag)) return false;
      if (!q) return true;
      return (
        it.title.toLowerCase().includes(q) ||
        it.author.toLowerCase().includes(q) ||
        it.tags.join(" ").toLowerCase().includes(q)
      );
    });
  }, [query, selectedTag]);

  function handlePlay(item: AudioItem) {
    if (!item.previewUrl || !audioRef.current) return;

    if (playingId === item.id) {
      audioRef.current.pause();
      setPlayingId(null);
      return;
    }

    audioRef.current.src = item.previewUrl;
    audioRef.current.currentTime = 0;
    audioRef.current
      .play()
      .then(() => setPlayingId(item.id))
      .catch((err) => {
        console.warn("Playback prevented or failed:", err);
        setPlayingId(item.id);
      });
  }

  return (
    <main style={{ fontFamily: "system-ui, Arial, sans-serif", padding: 24 }}>
      {/* Header with Home icon + site title + nav */}
      <header style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Home icon + label (click opens home page) */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", color: "inherit" }}>
          {/* simple home SVG icon */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 11.5L12 4l9 7.5" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 21V11h14v10" stroke="#111" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontWeight: 600 }}>Home</span>
        </Link>

        {/* keep site title */}
        <h1 style={{ margin: 0, marginLeft: 8 }}>AudioMarket</h1>

        {/* navigation */}
        <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
          <Link href="/upload">Upload</Link>
          <Link href="/audio">Browse</Link>
          <Link href="/dashboard">Dashboard</Link>
        </nav>
      </header>

      {/* Inline upload area */}
      <UploadInline />

      <section style={{ marginTop: 20 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            aria-label="Search audio"
            placeholder="Search by title, author or tag..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              padding: "8px 10px",
              width: 360,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={() => {
              setQuery("");
              setSelectedTag(null);
            }}
            style={{
              padding: "8px 10px",
              borderRadius: 6,
              border: "1px solid #ccc",
              background: "#f5f5f5",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          <strong style={{ alignSelf: "center" }}>Filter by tag:</strong>
          <button
            onClick={() => setSelectedTag(null)}
            style={{
              padding: "6px 8px",
              borderRadius: 6,
              border: selectedTag === null ? "2px solid #111" : "1px solid #ccc",
              background: selectedTag === null ? "#eef" : "#fff",
            }}
          >
            All
          </button>
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTag((s) => (s === t ? null : t))}
              style={{
                padding: "6px 8px",
                borderRadius: 6,
                border: selectedTag === t ? "2px solid #111" : "1px solid #ccc",
                background: selectedTag === t ? "#eef" : "#fff",
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      <section style={{ marginTop: 28 }}>
        <h2 style={{ marginBottom: 12 }}>Featured Audio</h2>

        {filtered.length === 0 ? (
          <p>No results. Try a different search or clear filters.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: 12,
            }}
          >
            {filtered.map((item) => (
              <article
                key={item.id}
                style={{
                  border: "1px solid #ddd",
                  padding: 12,
                  borderRadius: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: "0 0 6px 0" }}>{item.title}</h3>
                    <div style={{ fontSize: 13, color: "#555" }}>
                      {item.author} • {item.duration}
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>${item.price}</div>
                    <Link href={`/audio/${item.id}`} style={{ fontSize: 13 }}>
                      Details
                    </Link>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <button
                    onClick={() => handlePlay(item)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #111",
                      background: playingId === item.id ? "#111" : "#fff",
                      color: playingId === item.id ? "#fff" : "#111",
                    }}
                  >
                    {playingId === item.id ? "Pause" : "Play Preview"}
                  </button>

                  <button
                    onClick={() => (window.location.href = `/audio/${item.id}`)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 6,
                      border: "1px solid #ccc",
                      background: "#fff",
                    }}
                  >
                    View
                  </button>

                  <div style={{ marginLeft: "auto", fontSize: 13, color: "#666" }}>
                    {item.tags.join(", ")}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <audio
        ref={audioRef}
        onPause={() => setPlayingId(null)}
        onEnded={() => setPlayingId(null)}
        style={{ display: "none" }}
        controls={false}
      />

      <footer style={{ marginTop: 36, color: "#666", fontSize: 13 }}>
        <div>© {new Date().getFullYear()} AudioMarket · Built as MVP</div>
      </footer>
    </main>
  );
}
