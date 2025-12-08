// app/layout.tsx
import "./globals.css";

export const metadata = {
  title: "MirrorSplit",
  description: "Upload and share your audio tracks easily.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
