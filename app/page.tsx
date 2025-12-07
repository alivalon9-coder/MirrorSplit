// app/page.tsx
"use client";

import React, { useState } from "react";

export default function Page() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setMessage(null);
    // اوقف شريط التقدّم اذا كان شغّال من قبل
    setProgress(null);
  }

  // هذه دالة محاكاة لرفع الملف (لو عندك API/Cloudinary ضع هنا المنطق الحقيقي)
  async function handleUpload() {
    const input = document.querySelector<HTMLInputElement>('input[type="file"]');
    const file = input?.files?.[0];
    if (!file) {
      setMessage("Please choose a file first.");
      return;
    }

    try {
      setUploading(true);
      setProgress(0);

      // --- مثال محاكاة تقدم الرفع ---
      await new Promise<void>((resolve) => {
        const id = setInterval(() => {
          setProgress((p) => {
            const next = (p ?? 0) + 10;
            if (next >= 100) {
              clearInterval(id);
              resolve();
              return 100;
            }
            return next;
          });
