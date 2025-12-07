"use client";

import UploadDropzone from "@/components/UploadDropzone";

export default function UploadPage() {
  const handleUploaded = (url: string) => {
    console.log("Uploaded URL:", url);
    alert("Uploaded: " + url);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <UploadDropzone onUploaded={handleUploaded} />
    </main>
  );
}
