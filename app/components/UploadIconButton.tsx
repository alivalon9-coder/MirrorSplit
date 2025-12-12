"use client";

import React, { useState } from 'react';
import UploadModal from './UploadModal';

interface UploadIconButtonProps {
  onUploadSuccess?: (item: any) => void;
}

export default function UploadIconButton({ onUploadSuccess }: UploadIconButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSuccess = (item: any) => {
    if (onUploadSuccess) {
      onUploadSuccess(item);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        title="Upload Track"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          width: 64,
          height: 64,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          fontSize: '28px',
          border: 'none',
          boxShadow: '0 8px 24px rgba(15, 23, 42, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s ease',
          zIndex: 999,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(15, 23, 42, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(15, 23, 42, 0.4)';
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      </button>

      <UploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </>
  );
}
