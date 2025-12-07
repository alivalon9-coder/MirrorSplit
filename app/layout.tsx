import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "MirrorSplit",
  description: "Fast audio uploads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen relative overflow-hidden">
        
        {/* Background Image */}
        <Image
          src="/images/site_theme_background.png"
          alt="bg"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        {/* Page content */}
        <main className="relative z-10 min-h-screen flex items-center justify-center">
          {children}
        </main>

      </body>
    </html>
  );
}
