import React from 'react';
import Dashboard from '../components/Dashboard';

export const metadata = {
  title: 'Dashboard',
};

// Server component: fetches from the internal API route and renders Dashboard
export default async function DashboardPage() {
  // Use an absolute URL when fetching from server-side to avoid Node's "Invalid URL" errors
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  let stats: any[] = [];
  try {
    const res = await fetch(`${base}/api/dashboard`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      stats = data?.stats ?? [];
    } else {
      // eslint-disable-next-line no-console
      console.error('Dashboard API returned', res.status, await res.text());
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to fetch dashboard API', err);
  }

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      {/* Dashboard component will render the header and stats */}
      <Dashboard stats={stats} />
    </main>
  );
}
