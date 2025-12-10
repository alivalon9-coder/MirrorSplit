"use client";
import { useRef, useState } from "react";

export default function ProUploadCard({ onUpload }) {
  const inputRef = useRef(null);
  const [hover, setHover] = useState(false);

  return (
    <div
      className="w-full max-w-md p-10 rounded-3xl backdrop-blur-xl border border-white/10 bg-white/5 shadow-[0_0_40px_rgba(0,0,0,0.3)] relative flex flex-col items-center"
      style={{
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
      }}
    >
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 blur-2xl -z-10"></div>

      <h2 className="text-3xl font-semibold mb-3 text-white">
        Upload your audio
      </h2>

      <p className="text-gray-300 text-sm mb-6 text-center">
        MP3 / WAV supported — up to 15MB
      </p>

      <div
        onClick={() => inputRef.current.click()}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className={`w-40 h-40 flex items-center justify-center rounded-2xl cursor-pointer transition-all ${
          hover ? "bg-white/20 scale-105" : "bg-white/10"
        }`}
        style={{
          border: "2px dashed rgba(255,255,255,0.4)",
        }}
      >
        <span className="text-6xl opacity-80">⬆</span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files[0];
          if (!file) return;
          onUpload(file);
        }}
      />
    </div>
  );
}
