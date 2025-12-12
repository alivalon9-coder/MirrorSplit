"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import MusicCard, { MusicItem } from './MusicCard';

export default function UploadedList({ section }: { section: string }) {
  const [items, setItems] = useState<MusicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/uploads?section=${encodeURIComponent(section)}`);
      const json = await res.json();
      if (json?.items) {
        // Map server items to MusicItem shape
        const mapped = json.items.map((it: any) => ({
          id: it.id,
          title: it.title,
          artist: it.artist,
          // price can be string, number, null; normalize to "$<value>" if numeric
          price:
            it.price === null || it.price === undefined || it.price === ''
              ? undefined
              : typeof it.price === 'number'
                ? `$${it.price}`
                : (typeof it.price === 'string' && it.price.trim().startsWith('$'))
                  ? it.price
                  : `$${it.price}`,
          info: it.created_at || it.createdAt
            ? `Uploaded ${new Date(it.created_at || it.createdAt).toLocaleString()}`
            : undefined,
          previewUrl: it.url,
        }));
        setItems(mapped);
      } else {
        setItems([]);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('fetch uploads failed', err);
      setItems([]);
    }
    setLoading(false);
  }, [section]);

  useEffect(() => {
    fetchItems();
    const handler = () => fetchItems();
    window.addEventListener('uploads:changed', handler as EventListener);
    return () => window.removeEventListener('uploads:changed', handler as EventListener);
  }, [fetchItems]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => setPlayingId(null);
    const onPause = () => setPlayingId(null);

    audio.addEventListener('ended', onEnded);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  if (loading) return <div>Loading uploaded tracks…</div>;
  if (items.length === 0) return <div>No uploads yet for this section.</div>;

  return (
    <>
      <audio ref={audioRef} />
      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {items.map((it) => (
          <MusicCard key={it.id} item={it} previewUrl={(it as any).previewUrl} />
        ))}
      </section>
    </>
  );
}
