// app/page.tsx
"use client";

import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24, maxWidth: 880 }}>
      <section style={{ marginTop: 24 }}>
        <h2 style={{ marginBottom: 8 }}>Welcome to MirrorSplit</h2>
        <p style={{ marginTop: 0, color: "#333" }}>
          MirrorSplit delivers focused audio and visual solutions for artists, creators and brands. We combine technical precision with creative direction to produce polished, release-ready work.
        </p>

        <p style={{ color: "#333" }}>
          Services include production, mixing & mastering, visual content, and distribution support. Explore our Services and Products pages or <Link href="/contact">get in touch</Link> to start a project.
        </p>
      </section>
    </main>
  );
}
