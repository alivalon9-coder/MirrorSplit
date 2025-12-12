"use client";

import React from 'react';
import UploadIconButton from './UploadIconButton';
import RecentUploads from './RecentUploads';

export interface StatItem {
  id: string;
  label: string;
  value: string | number;
}

interface Props {
  stats?: StatItem[];
}

export default function Dashboard({ stats = [] }: Props) {
  const handleUploadSuccess = (item: any) => {
    console.log('Upload successful:', item);
    // The RecentUploads component will automatically update via the event listener
    // Force a small delay to ensure the API has saved the data
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('uploads:changed', { detail: item }));
    }, 100);
  };

  return (
    <section>
      <h1 style={{ marginBottom: 8 }}>Dashboard</h1>
      <p style={{ color: '#444', marginTop: 0 }}>Quick overview of recent metrics and activity.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 16 }}>
        {stats.map((s) => (
          <div key={s.id} className="dashboard-card" style={{ padding: 12 }}>
            <div style={{ color: '#666', fontSize: 13 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Uploads Feed - Viral Section */}
      <div style={{ marginTop: 32 }}>
        <RecentUploads limit={10} showShareButton={true} />
      </div>

      <UploadIconButton onUploadSuccess={handleUploadSuccess} />
    </section>
  );
}
