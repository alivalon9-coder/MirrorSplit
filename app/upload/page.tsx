"use client";

import React, { useState } from 'react';
import UploadForm from '../../components/UploadForm';
import UploadedList from '../../components/UploadedList';

const SECTIONS = [
  { id: 'for-sale', label: 'For Sale' },
  { id: 'streams', label: 'Streams' },
  { id: 'instrumentals', label: 'Instrumentals' },
];

export default function UploadPage() {
  const [section, setSection] = useState('for-sale');

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <h1>Upload Music</h1>

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => setSection(s.id)}
            style={{
              padding: '8px 12px',
              borderRadius: 6,
              border: section === s.id ? '2px solid #111' : '1px solid #ccc',
              background: section === s.id ? '#eef' : '#fff',
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      <UploadForm section={section} />

      <h2 style={{ marginTop: 18 }}>{SECTIONS.find((s) => s.id === section)?.label}</h2>
      <UploadedList section={section} />
    </main>
  );
}
