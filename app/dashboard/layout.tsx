"use client";

import React, { useState } from 'react';
import DashboardNav from '../components/DashboardNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <aside
        style={{
          width: open ? 240 : 64,
          borderRight: '1px solid #e6e6e6',
          padding: 12,
          boxSizing: 'border-box',
          transition: 'width 180ms ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>{open ? 'Dashboard' : 'DS'}</h2>
          <button
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-label={open ? 'Collapse sidebar' : 'Expand sidebar'}
            style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 18 }}
          >
            {open ? '◀' : '▶'}
          </button>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: open ? 'block' : 'none' }}>
            <DashboardNav />
          </div>
          {/* When collapsed, you could render icons here instead */}
        </div>
      </aside>

      <main style={{ flex: 1, padding: 24 }}>{children}</main>
    </div>
  );
}
