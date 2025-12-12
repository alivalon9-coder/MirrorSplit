"use client";

import React, { useState } from 'react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (item: any) => void;
}

export default function UploadModal({ isOpen, onClose, onSuccess }: UploadModalProps) {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [price, setPrice] = useState('');
  const [section, setSection] = useState('music');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadedItem, setUploadedItem] = useState<any>(null);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const resetForm = () => {
    setTitle('');
    setArtist('');
    setPrice('');
    setSection('music');
    setFile(null);
    setStatus(null);
    setLoading(false);
    setUploadedItem(null);
    setShowShareOptions(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setStatus('Please choose a file to upload.');
      return;
    }

    setStatus('Uploading...');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('section', section);
      fd.append('title', title);
      fd.append('artist', artist);
      fd.append('price', price);
      fd.append('file', file);

      const res = await fetch('/api/upload-track', { method: 'POST', body: fd });
      const json = await res.json();
      console.log('Upload response:', json);
      if (res.ok && json?.item) {
        // Check if there's a warning (local fallback was used)
        if (json?.warning) {
          setStatus(`⚠️ ${json.warning} - ${json.suggestion || 'Please contact support if this persists.'}`);
        } else {
          setStatus('Upload successful! Your track is now live! 🎉');
        }
        
        setUploadedItem(json.item);
        setShowShareOptions(true);
        setLoading(false);
        
        // Notify other parts of the app to refresh upload lists
        try {
          console.log('Dispatching uploads:changed event with item:', json.item);
          window.dispatchEvent(new CustomEvent('uploads:changed', { detail: json.item }));
          // Also dispatch a generic refresh event
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('uploads:changed'));
          }, 500);
        } catch (e) {
          console.error('Error dispatching event:', e);
        }
        if (onSuccess) onSuccess(json.item);
        
        // Don't auto-close - let user see share options
      } else {
        // Enhanced error handling for metadata save failures
        let errorMsg = json?.error || 'Upload failed';
        if (json?.details) {
          errorMsg += `: ${json.details}`;
        }
        if (json?.hint) {
          errorMsg += ` (${json.hint})`;
        }
        if (json?.code) {
          errorMsg += ` [Code: ${json.code}]`;
        }
        setStatus(errorMsg);
        setLoading(false);
      }
    } catch (err) {
      setStatus('Upload error');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={handleClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '32px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Upload Track</h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              color: '#666',
              lineHeight: '1',
              padding: '0',
              width: '32px',
              height: '32px',
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Track title"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Artist
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              placeholder="Artist name"
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Section
            </label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            >
              <option value="music">Music</option>
              <option value="beats">Beats</option>
              <option value="vocal">Vocal</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              Price (optional)
            </label>
            <input
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g., $9.99 or leave empty"
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', fontSize: '14px' }}>
              File
            </label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              required
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {status && (
            <div
              style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '6px',
                backgroundColor: status.includes('success') 
                  ? '#d4edda' 
                  : status.startsWith('⚠️') 
                    ? '#fff3cd' 
                    : '#f8d7da',
                color: status.includes('success') 
                  ? '#155724' 
                  : status.startsWith('⚠️') 
                    ? '#856404' 
                    : '#721c24',
                fontSize: '14px',
                border: `1px solid ${
                  status.includes('success') 
                    ? '#c3e6cb' 
                    : status.startsWith('⚠️') 
                      ? '#ffeaa7' 
                      : '#f5c6cb'
                }`,
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: status.includes('Metadata') || status.startsWith('⚠️') ? '4px' : '0' }}>
                {status.includes('Metadata') 
                  ? '⚠️ Metadata Save Failed' 
                  : status.includes('success') 
                    ? '✓ Success' 
                    : status.startsWith('⚠️')
                      ? '⚠️ Warning'
                      : '✗ Error'}
              </div>
              <div style={{ fontSize: '13px' }}>{status}</div>
              {status.includes('Metadata') && (
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: 0.9 }}>
                  The file was uploaded but couldn't be saved to the database. This might be a temporary issue. Please try again.
                </div>
              )}
            </div>
          )}

          {showShareOptions && uploadedItem && (
            <div
              style={{
                padding: '16px',
                marginBottom: '16px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
                border: '1px solid #dee2e6',
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '12px', fontSize: '14px' }}>
                🚀 Your track is live! Share it now:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={async () => {
                    const url = `${window.location.origin}/track/${uploadedItem.id}`;
                    try {
                      await navigator.clipboard.writeText(url);
                      alert('Link copied to clipboard!');
                    } catch (err) {
                      console.error('Copy failed:', err);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#0f172a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  📋 Copy Link
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const text = `Check out "${uploadedItem.title}" by ${uploadedItem.artist}! ${window.location.origin}/track/${uploadedItem.id}`;
                    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#1DA1F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  🐦 Tweet
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const url = `${window.location.origin}/track/${uploadedItem.id}`;
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                  }}
                  style={{
                    padding: '8px 16px',
                    background: '#1877F2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                    fontWeight: '500',
                  }}
                >
                  📘 Facebook
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                backgroundColor: 'white',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              {showShareOptions ? 'Done' : 'Cancel'}
            </button>
            {!showShareOptions && (
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  backgroundColor: loading ? '#999' : '#0f172a',
                  color: 'white',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
