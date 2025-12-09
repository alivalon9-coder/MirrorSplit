"use client";

import React from 'react';
import { useState } from 'react';

export interface MusicItem {
  id: string;
  title: string;
  artist?: string;
  price?: string;
  info?: string;
  previewUrl?: string;
}

interface Props {
  item: MusicItem;
}

export default function MusicCard({ item }: Props) {
  const [playing, setPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const [editing, setEditing] = useState(false);
  const [formTitle, setFormTitle] = useState(item.title || '');
  const [formArtist, setFormArtist] = useState(item.artist || '');
  const [formPrice, setFormPrice] = useState(item.price ? String(item.price) : '');

  React.useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => setPlaying(false);
    a.addEventListener('ended', onEnded);
    a.addEventListener('pause', onEnded);
    return () => {
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('pause', onEnded);
    };
  }, []);


  function startEdit() {
    setFormTitle(item.title || '');
    setFormArtist(item.artist || '');
    setFormPrice(item.price ? String(item.price) : '');
    setEditing(true);
  }

  async function saveEdit() {
    try {
      const body = { title: formTitle, artist: formArtist, price: formPrice };
      const res = await fetch(`/api/uploads/${encodeURIComponent(item.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {
        const txt = await res.text();
        // eslint-disable-next-line no-console
        console.error('Non-JSON response from PATCH', res.status, txt);
        alert(`Update failed: ${res.status} - ${txt}`);
        return;
      }
      if (res.ok) {
        // update local display values
        // Note: item is a prop; updating UI locally for immediate feedback
        (item as any).title = json.item.title ?? formTitle;
        (item as any).artist = json.item.artist ?? formArtist;
        (item as any).price = json.item.price ?? formPrice;
        window.dispatchEvent(new CustomEvent('uploads:changed', { detail: json.item }));
        setEditing(false);
      } else {
        alert(json?.error || `Update failed: ${res.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('edit error', err);
      alert('Update failed');
    }
  }

  async function onDelete() {
    if (!confirm('Delete this upload? This will remove the file and metadata.')) return;
    try {
      const res = await fetch(`/api/uploads/${encodeURIComponent(item.id)}`, { method: 'DELETE' });
      let json: any = null;
      try {
        json = await res.json();
      } catch (e) {
        const txt = await res.text();
        // eslint-disable-next-line no-console
        console.error('Non-JSON response from DELETE', res.status, txt);
        alert(`Delete failed: ${res.status} - ${txt}`);
        return;
      }
      if (res.ok) {
        window.dispatchEvent(new CustomEvent('uploads:changed'));
        alert('Deleted');
      } else {
        alert(json?.error || `Delete failed: ${res.status}`);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('delete error', err);
      alert('Delete failed');
    }
  }

  function onBuy() {
    // placeholder action
    // eslint-disable-next-line no-console
    console.log('Buy', item.id);
  }

  // playback handled inline in render using the internal audioRef

  return (
    <article style={{ border: '1px solid #e1e1e1', borderRadius: 8, padding: 12, width: '100%', boxSizing: 'border-box' }}>
      <h3 style={{ margin: '0 0 6px 0', fontSize: 16 }}>{item.title}</h3>
      {item.artist && <div style={{ color: '#555', marginBottom: 6 }}>{item.artist}</div>}
      {item.info && <div style={{ color: '#333', marginBottom: 8 }}>{item.info}</div>}
      {item.price && <div style={{ marginTop: 6, fontWeight: 600 }}>{item.price}</div>}
      <div style={{ display: 'flex', gap: 8, marginTop: 10, alignItems: 'center' }}>
        {/* Play / Pause */}
        {((item as any).previewUrl) ? (
          <>
            <button
              onClick={() => {
                const a = audioRef.current;
                if (!a) return;
                if (a.paused) {
                  setLoading(true);
                  a.play().then(() => {
                    setPlaying(true);
                    setLoading(false);
                  }).catch(() => {
                    setPlaying(true);
                    setLoading(false);
                  });
                } else {
                  a.pause();
                  setPlaying(false);
                }
              }}
              style={{ padding: '6px 8px', cursor: 'pointer' }}
            >
              {loading ? 'Loading…' : playing ? 'Pause' : 'Play'}
            </button>
            <audio ref={audioRef} src={(item as any).previewUrl} style={{ display: 'none' }} />
          </>
        ) : (
          <span style={{ color: '#888' }}>No preview</span>
        )}

        {!editing ? (
          <button onClick={startEdit} title="Edit" style={{ padding: '6px 8px', cursor: 'pointer' }} aria-label="Edit">
            {/* pencil icon */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 21l3-1 11-11 1-3-3 1-11 11-1 3z" stroke="#111" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} style={{ padding: 6 }} />
            <input value={formArtist} onChange={(e) => setFormArtist(e.target.value)} style={{ padding: 6 }} />
            <input value={formPrice} onChange={(e) => setFormPrice(e.target.value)} style={{ padding: 6, width: 80 }} />
            <button onClick={saveEdit} style={{ padding: '6px 8px', cursor: 'pointer' }}>Save</button>
            <button onClick={() => setEditing(false)} style={{ padding: '6px 8px' }}>Cancel</button>
          </div>
        )}
        <button onClick={onDelete} title="Delete" style={{ padding: '6px 8px', cursor: 'pointer' }} aria-label="Delete">
          {/* trash icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 6h18" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M8 6v14c0 1.1.9 2 2 2h4c1.1 0 2-.9 2-2V6" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M10 11v6" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11v6" stroke="#111" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        {/* Save / Download button: uses anchor with download so browser will save file locally */}
        {item.previewUrl ? (
          <a href={item.previewUrl} download style={{ padding: '6px 8px', display: 'inline-block', textDecoration: 'none', color: 'inherit', border: '1px solid #ccc', borderRadius: 4 }} rel="noopener noreferrer">
            Save
          </a>
        ) : (
          <button disabled style={{ padding: '6px 8px', cursor: 'not-allowed' }}>Save</button>
        )}
        <button onClick={onBuy} style={{ padding: '6px 8px', cursor: 'pointer', fontWeight: 700 }}>Buy</button>
      </div>
    </article>
  );
}
