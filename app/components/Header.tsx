import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header style={{ padding: 24, display: 'flex', alignItems: 'center', gap: 16 }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none', color: 'inherit' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="10" stroke="#111" strokeWidth="1.2" />
          <path d="M7 15l5-6 5 6" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 700, fontSize: 18 }}>MirrorSplit</span>
      </Link>

      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/services">Services</Link>
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/products">Products</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
