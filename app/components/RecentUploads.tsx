"use client";

import React, { useEffect, useState } from 'react';

interface UploadedFile {
  id: string;
  title: string;
  artist: string;
  url: string | null;
  section: string;
  created_at: string;
  justUploaded?: boolean;
}

interface RecentUploadsProps {
  limit?: number;
  showShareButton?: boolean;
}

export default function RecentUploads({ limit = 5, showShareButton = true }: RecentUploadsProps) {
  const [uploads, setUploads] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ title: '', artist: '', price: '' });
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const fetchRecentUploads = async () => {
    try {
      const res = await fetch('/api/uploads/recent');
      const json = await res.json();
      console.log('Fetched recent uploads:', json);
      if (json?.items) {
        setUploads(json.items.slice(0, limit));
      }
    } catch (err) {
      console.error('Failed to fetch recent uploads:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    console.log('RecentUploads component mounted');
    fetchRecentUploads();

    // Listen for new uploads
    const handleNewUpload = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newItem = customEvent.detail;
      console.log('New upload event received:', newItem);
      
      if (newItem) {
        // Map the uploaded item to the correct structure
        const mappedItem: UploadedFile = {
          id: newItem.id,
          title: newItem.title || 'Untitled',
          artist: newItem.artist || 'Unknown',
          url: newItem.url || null,
          section: newItem.section || 'unknown',
          created_at: newItem.created_at || new Date().toISOString(),
          justUploaded: true,
        };
        
        console.log('Adding new upload to list:', mappedItem);
        // Add the new upload to the top with animation flag
        setUploads(prev => [
          mappedItem,
          ...prev.slice(0, limit - 1)
        ]);

        // Remove animation flag after 3 seconds
        setTimeout(() => {
          setUploads(prev => prev.map(item => 
            item.id === newItem.id ? { ...item, justUploaded: false } : item
          ));
        }, 3000);
      } else {
        // If no detail, just refetch
        console.log('No detail in event, refetching...');
        fetchRecentUploads();
      }
    };

    window.addEventListener('uploads:changed', handleNewUpload);
    return () => {
      console.log('RecentUploads component unmounting');
      window.removeEventListener('uploads:changed', handleNewUpload);
    };
  }, [limit]);

  const shareUpload = async (upload: UploadedFile) => {
    const shareUrl = `${window.location.origin}/track/${upload.id}`;
    const shareText = `Check out "${upload.title}" by ${upload.artist}!`;

    // Try native share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: upload.title,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // Fall through to clipboard
      }
    }

    // Fallback to clipboard
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedId(upload.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const playAudio = (upload: UploadedFile) => {
    if (!upload.url) {
      alert('No audio file available');
      return;
    }

    if (playingId === upload.id) {
      // Pause if already playing
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      // Stop current and play new
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = upload.url;
        audioRef.current.play().catch(err => {
          console.error('Play error:', err);
          alert('Failed to play audio');
        });
      }
      setPlayingId(upload.id);
    }
  };

  const startEdit = (upload: UploadedFile) => {
    setEditingId(upload.id);
    setEditForm({
      title: upload.title,
      artist: upload.artist,
      price: '',
    });
  };

  const saveEdit = async (uploadId: string) => {
    try {
      const res = await fetch(`/api/uploads/${uploadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });
      
      const json = await res.json();
      if (res.ok) {
        setUploads(prev => prev.map(item => 
          item.id === uploadId 
            ? { ...item, title: json.item.title || editForm.title, artist: json.item.artist || editForm.artist }
            : item
        ));
        setEditingId(null);
        window.dispatchEvent(new CustomEvent('uploads:changed'));
      } else {
        alert(json?.error || 'Update failed');
      }
    } catch (err) {
      console.error('Edit error:', err);
      alert('Update failed');
    }
  };

  const deleteUpload = async (uploadId: string, title: string) => {
    if (!confirm(`Delete "${title}"? This will remove the file and metadata permanently.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/uploads/${uploadId}`, {
        method: 'DELETE',
      });
      
      const json = await res.json();
      if (res.ok) {
        setUploads(prev => prev.filter(item => item.id !== uploadId));
        if (playingId === uploadId) {
          audioRef.current?.pause();
          setPlayingId(null);
        }
        window.dispatchEvent(new CustomEvent('uploads:changed'));
      } else {
        alert(json?.error || 'Delete failed');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Delete failed');
    }
  };

  React.useEffect(() => {
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

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#666' }}>
        Loading recent uploads...
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#666', background: 'white', borderRadius: '8px', border: '1px solid #e0e0e0' }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎵</div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No uploads yet</div>
        <div style={{ fontSize: '14px', color: '#999' }}>Click the upload button to add your first track!</div>
        <button
          onClick={() => {
            console.log('Manual refresh triggered');
            fetchRecentUploads();
          }}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            background: '#0f172a',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: '100%' }}>
      <audio ref={audioRef} />
      
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
          🔥 Recent Uploads
        </h3>
        <div style={{ fontSize: '12px', color: '#666' }}>
          Live Feed
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {uploads.map((upload) => (
          <div
            key={upload.id}
            style={{
              padding: '16px',
              background: upload.justUploaded 
                ? 'linear-gradient(135deg, #fff9c4 0%, #fff 100%)' 
                : 'white',
              border: upload.justUploaded 
                ? '2px solid #ffd700' 
                : '1px solid #e0e0e0',
              borderRadius: '8px',
              transition: 'all 0.5s ease',
              boxShadow: upload.justUploaded 
                ? '0 4px 12px rgba(255, 215, 0, 0.3)' 
                : '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                {editingId === upload.id ? (
                  <div style={{ marginBottom: '12px' }}>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      placeholder="Title"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        marginBottom: '6px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <input
                      type="text"
                      value={editForm.artist}
                      onChange={(e) => setEditForm({ ...editForm, artist: e.target.value })}
                      placeholder="Artist"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => saveEdit(upload.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#10b981',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        ✓ Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        style={{
                          padding: '6px 12px',
                          background: '#6b7280',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '500',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      {upload.justUploaded && (
                        <span style={{ 
                          fontSize: '10px', 
                          background: '#ffd700', 
                          color: '#000', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontWeight: '600',
                          animation: 'pulse 1.5s infinite'
                        }}>
                          NEW
                        </span>
                      )}
                      {playingId === upload.id && (
                        <span style={{ 
                          fontSize: '10px', 
                          background: '#10b981', 
                          color: '#fff', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontWeight: '600',
                        }}>
                          ♪ PLAYING
                        </span>
                      )}
                      <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                        {upload.title}
                      </h4>
                    </div>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                      by {upload.artist}
                    </div>
                    <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#999' }}>
                      <span>
                        📁 {upload.section}
                      </span>
                      <span>
                        ⏰ {new Date(upload.created_at).toLocaleString()}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexShrink: 0 }}>
                {upload.url && (
                  <button
                    onClick={() => playAudio(upload)}
                    style={{
                      padding: '10px 16px',
                      background: playingId === upload.id 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                        : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minWidth: '100px',
                    }}
                  >
                    {playingId === upload.id ? '⏸ Pause' : '▶ Play'}
                  </button>
                )}
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => startEdit(upload)}
                    disabled={editingId === upload.id}
                    style={{
                      padding: '8px 12px',
                      background: 'white',
                      color: '#0f172a',
                      border: '1px solid #ddd',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: editingId === upload.id ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: editingId === upload.id ? 0.5 : 1,
                    }}
                  >
                    ✏️ Edit
                  </button>
                  
                  {showShareButton && (
                    <button
                      onClick={() => shareUpload(upload)}
                      style={{
                        padding: '8px 12px',
                        background: copiedId === upload.id ? '#10b981' : 'white',
                        color: copiedId === upload.id ? 'white' : '#0f172a',
                        border: '1px solid #ddd',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {copiedId === upload.id ? '✓' : '🔗'}
                    </button>
                  )}
                  
                  <button
                    onClick={() => deleteUpload(upload.id, upload.title)}
                    style={{
                      padding: '8px 12px',
                      background: 'white',
                      color: '#ef4444',
                      border: '1px solid #fecaca',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#ef4444';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.color = '#ef4444';
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}} />
    </div>
  );
}
