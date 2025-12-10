// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 880 }}>
      <section style={{ marginTop: 24 }}>
        <h1 style={{ marginBottom: 8 }}>Welcome to Mirrorsplit</h1>

        <p style={{ marginTop: 0, color: "#333", lineHeight: 1.6 }}>
          High-quality music production, custom beats, and real music streaming services — all designed to power your sound and help you grow as an artist.
        </p>

        <h2>🎧 Premium Instrumentals</h2>
        <p style={{ color: "#333" }}>
          Industry-ready beats in multiple styles:
          <br />
          Trap • Drill • Hip-Hop • R&B • EDM • Emotional • Dark
          <br />
          Instant download. Clear, professional sound. Commercial use included.
        </p>
        <p>
          <Link href="/products">→ Explore Instrumentals</Link>
        </p>

        <h2>🎛 Custom Beat Production</h2>
        <p style={{ color: "#333" }}>
          Need something unique? Get a beat made exactly for your vibe and direction. Custom sound design, revisions, and fast delivery.
        </p>
        <p>
          <Link href="/services">→ Order Your Custom Beat</Link>
        </p>

        <h2>📈 Music Streaming Services</h2>
        <p style={{ color: "#333" }}>
          Boost your track with real, safe, organic streams across major platforms. No bots. No fake numbers. Just steady growth.
        </p>
        <p>
          <Link href="/services">→ View Stream Services</Link>
        </p>

        <h3>🔥 Why Mirrorsplit?</h3>
        <ul style={{ color: "#333" }}>
          <li>Professional sound</li>
          <li>Fast turnaround</li>
          <li>Real streams, real results</li>
          <li>Clear communication</li>
          <li>Fair and simple pricing</li>
        </ul>

        <h3>🎵 Let’s Build Something Powerful</h3>
        <p style={{ color: "#333" }}>
          Whether you're looking for the perfect beat or want to grow your track, Mirrorsplit gives you the tools to move forward with confidence.
        </p>
        <p>
          <Link href="/contact">→ Get Started Today</Link>
        </p>
      </section>
    </main>
  );
}
