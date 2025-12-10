"use client";

import React, { useState } from 'react';

export default function UploadForm({ section, onSuccess }: { section: string; onSuccess?: (item: any) => void }) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      setStatus('Please choose a file to upload.');
      return;
    }

    setStatus('Uploading...');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('section', section);
      fd.append('title', title);
      fd.append('artist', artist);
      fd.append('price', price);
      fd.append('file', file);

      const res = await fetch('/api/upload-track', { method: 'POST', body: fd });
      const json = await res.json();
      if (res.ok && json?.item) {
        setStatus('Upload successful — ' + (json.item.id ?? 'ok'));
        setTitle('');
        setArtist('');
        setPrice('');
        setFile(null);
        // notify other parts of the app to refresh upload lists
        try {
          window.dispatchEvent(new CustomEvent('uploads:changed', { detail: json.item }));
        } catch (e) {
          // ignore
        }
        if (onSuccess) onSuccess(json.item);
      } else {
        setStatus(json?.error || 'Upload failed');
      }
    } catch (err) {
      setStatus('Upload error');
    }
    setLoading(false);
  }

  return (
    <form onSubmit={onSubmit} style={{ marginBottom: 16, padding: 12, border: '1px solid #eee', borderRadius: 8 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Artist" value={artist} onChange={(e) => setArtist(e.target.value)} style={{ padding: 8 }} />
        <input placeholder="Price (optional)" value={price} onChange={(e) => setPrice(e.target.value)} style={{ padding: 8 }} />
        <input type="file" accept="audio/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <button type="submit" disabled={loading} style={{ padding: '8px 12px', cursor: loading ? 'default' : 'pointer' }}>
          {loading ? 'Uploading…' : 'Upload'}
        </button>
      </div>
      {status && <div style={{ marginTop: 8, color: '#333' }}>{status}</div>}
    </form>
  );
}
