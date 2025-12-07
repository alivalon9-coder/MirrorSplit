"use client";

import UploadIconFloating from "@/components/UploadIconFloating";

export default function UploadPage() {

  const handleUploaded = (url: string) => {
    console.log("Uploaded URL:", url);
    alert("Uploaded: " + url);
  };

  return (
    <>
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <h1 className="text-3xl font-bold mb-4">Upload Page</h1>
        <p className="text-gray-300">اختر ملف لرفعه على Cloudinary</p>
      </main>

      {/* زر الرفع العائم */}
      <UploadIconFloating onUploaded={handleUploaded} />
    </>
  );
}
import UploadDropzone from "@/components/UploadDropzone";
