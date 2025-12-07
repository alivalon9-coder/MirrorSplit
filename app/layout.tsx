// app/layout.tsx
import "./globals.css";
import React from "react";

export const metadata = {
  title: "MirrorSplit - Upload",
  description: "Upload your audio and get a public Cloudinary link",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-800">
        <header className="w-full border-b bg-white/60 backdrop-blur-sm sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white text-lg font-bold">
                MS
              </div>
              <div>
                <div className="font-extrabold text-lg">MirrorSplit</div>
                <div className="text-xs text-gray-500">Fast audio uploads</div>
              </div>
            </div>

            <nav className="flex items-center gap-4">
              <a href="/" className="text-sm hover:underline text-gray-700">Home</a>
              <a href="/upload" className="text-sm font-semibold px-3 py-1 rounded-md bg-indigo-600 text-white shadow-sm">Upload</a>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-8">{children}</main>

        <footer className="mt-12 border-t">
          <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-500 flex justify-between">
            <div>© {new Date().getFullYear()} MirrorSplit</div>
            <div>Built with ❤️ • Cloudinary</div>
          </div>
        </footer>
      </body>
    </html>
  );
}
