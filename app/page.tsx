// app/upload/page.tsx
"use client";

import React, { useState } from "react";

export default function UploadEnhancePage() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);

  // Main enhance function
  async function handleEnhance() {
    if (!file) return alert("اختر ملف صوتي أولاً");

    setLoading(true);
    setProgressText("Loading FFmpeg...");
    setOutputUrl(null);

    // Lazy import ffmpeg ONLY when needed
    const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");

    const ffmpeg = createFFmpeg({
      log: true,
      corePath: "https://unpkg.com
