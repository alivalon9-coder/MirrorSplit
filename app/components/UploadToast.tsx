"use client";

import React, { useEffect, useState } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
}

export default function UploadToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handleUploadChanged = (event: Event) => {
      const customEvent = event as CustomEvent;
      const item = customEvent.detail;
      
      if (item) {
        const toast: Toast = {
          id: Date.now().toString(),
          message: `🎉 "${item.title}" by ${item.artist} is now live!`,
          type: 'success',
        };

        setToasts(prev => [...prev, toast]);

        // Auto-remove after 5 seconds
        setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
        }, 5000);
      }
    };

    window.addEventListener('uploads:changed', handleUploadChanged);
    return () => window.removeEventListener('uploads:changed', handleUploadChanged);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          style={{
            background: toast.type === 'success' 
              ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
              : '#0f172a',
            color: 'white',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '24px' }}>
            {toast.type === 'success' && '✓'}
            {toast.type === 'info' && 'ℹ'}
            {toast.type === 'warning' && '⚠'}
            {toast.type === 'error' && '✗'}
          </div>
          <div style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>
            {toast.message}
          </div>
          <button
            onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              cursor: 'pointer',
              fontSize: '16px',
              lineHeight: '1',
              padding: 0,
            }}
          >
            ×
          </button>
        </div>
      ))}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}} />
    </div>
  );
}
