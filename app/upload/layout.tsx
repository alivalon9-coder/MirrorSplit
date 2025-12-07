import "./globals.css";
// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "MirrorSplit",
  description: "Fast audio uploads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* ضع bg-white هنا أو أزل أي gradient أو image */}
      <body className="bg-white text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
