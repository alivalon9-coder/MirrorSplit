import "./globals.css";
import Image from "next/image";

export const metadata = {
  title: "MirrorSplit",
  description: "Fast audio uploads",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen relative overflow-x-hidden">
        
        {/* Background Image */}
        <Image
          src="/images/site_theme_background.png"
          alt="Background"
          fill
          priority
          style={{ objectFit: "cover" }}
          className="z-0"
        />

        {/* overlay (optional) */}
        <div className="absolute inset-0 bg-black/40 z-0" />

        <main className="relative z-10 min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
