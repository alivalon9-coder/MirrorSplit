'use client';

import React, { useRef, useState } from 'react';

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);

  // يفتح نافذة اختيار الملف
  const openFilePicker = () => {
    inputRef.current?.click();
  };

  // بعد اختيار الملف — نرسله للـ backend ثم نعيد التوجيه
  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      // غيّر المسار لو عندك endpoint مختلف
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!res.ok) {
        // حاول نقرأ رسالة الخطأ من السيرفر
        const text = await res.text();
        throw new Error(text || 'Upload failed');
      }

      // لو نجاح — روح لصفحة الملفات أو أي صفحة تحبها
      window.location.href = '/files';
    } catch (err: any) {
      // أبدي للمستخدم الخطأ
      alert('Upload error: ' + (err?.message || err));
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <h1>Upload</h1>

      {/* مخفي input file */}
      <input
        ref={inputRef}
        type="file"
        name="file"
        accept="audio/*"
        style={{ display: 'none' }}
        onChange={onFileChange}
      />

      {/* زرار يفتح file picker */}
      <button
        onClick={openFilePicker}
        disabled={loading}
        style={{
          padding: '12px 20px',
          background: 'dodgerblue',
          color: 'white',
          border: 'none',
          borderRadius: 6,
          cursor: loading ? 'not-allowed' : 'pointer',
        }}
      >
        {loading ? 'Uploading...' : 'Upload Now'}
      </button>
    </main>
  );
}
