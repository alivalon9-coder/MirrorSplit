import './globals.css';
import React from 'react';
import Header from './components/Header';
import UploadToast from './components/UploadToast';

export const metadata = {
  title: 'MirrorSplit',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, Arial, sans-serif' }}>
        <Header />
        <div>{children}</div>
        <UploadToast />
      </body>
    </html>
  );
}
