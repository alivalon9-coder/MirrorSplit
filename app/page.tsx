"use client";
 //app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // يوجّه كل زيارة للـ root إلى /upload
  redirect("/upload");
}


  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const p = Math.round((e.loaded / e.total) * 100);
        setProgress(p);
      }
    };

    xhr.onload = () => {
      setUploading(false);
      alert("Upload completed!");
    };

    xhr.onerror = () => {
      setUploading(false);
      alert("Upload failed!");
    };

    xhr.send(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white/20 backdrop-blur-md shadow-xl rounded-2xl p-8 w-full max-w-md border border-white/30">
        <h1 className="text-3xl font-bold text-center mb-6 text-white">
          Upload Audio
        </h1>

        <label className="block mb-4">
          <span className="text-white font-medium">Choose file</span>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="mt-2 w-full text-white bg-white/10 border border-white/30 p-2 rounded-lg"
          />
        </label>

        {file && (
          <p className="text-sm text-white mb-4">
            Selected: <span className="font-semibold">{file.name}</span>
          </p>
        )}

        {uploading && (
          <div className="w-full bg-white/20 rounded-full h-3 mb-4">
            <div
              className="bg-green-400 h-3 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition-all"
        >
          {uploading ? "Uploading..." : "Start Upload"}
        </button>
      </div>
    </div>
  );
}
// fix
