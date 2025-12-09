import React from 'react';
import Link from 'next/link';

export default function DashboardNav() {
  return (
    <nav style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
      <Link href="/dashboard">Overview</Link>
      <Link href="/dashboard/music/for-sale">Music for Sale</Link>
      <Link href="/dashboard/music/streams">Streams</Link>
      <Link href="/dashboard/music/instrumentals">Instrumentals</Link>
    </nav>
  );
}
