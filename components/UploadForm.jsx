// components/UploadForm.jsx
import { useState } from "react";

export default function UploadForm() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("");
  const [taskId, setTaskId] = useState(null);
  const [downloadUrl, setDownloadUrl] = useState(null);

  async function upload(e) {
    e.preventDefault();
    if (!file) return alert("Choose audio file first");

    setStatus("Uploading...");
    const fd = new FormData();
    fd.append("audio", file);
    fd.append("style", "pop"); // optional

    const r = await fetch("/api/upload-vocal", { method: "POST", body: fd });
    const j = await r.json();
    if (!j.ok) {
      setStatus("Upload failed: " + (j.error?.message || JSON.stringify(j.error)));
      return;
    }

    // suno response shape may vary; find taskId or job id
    const maybeTaskId = j.data?.taskId || j.data?.id || j.data?.jobId || j.data?.job?.id;
    if (!maybeTaskId) {
      // If Suno returns final URL immediately:
      const possibleUrl = j.data?.downloadUrl || j.data?.url || j.data?.result?.url;
      if (possibleUrl) {
        setDownloadUrl(possibleUrl);
        setStatus("Ready");
        return;
      }
      setStatus("Uploaded but no taskId returned. Check response in console.");
      console.log("upload response:", j);
      return;
    }

    setTaskId(maybeTaskId);
    setStatus("Processing...");
    poll(maybeTaskId);
  }

  async function poll(id) {
    for (let i = 0; i < 40; i++) { // try for ~40 times
      setStatus(`Processing... (${i+1})`);
      const r = await fetch(`/api/check-task?taskId=${encodeURIComponent(id)}`);
      const j = await r.json();
      if (j.ok && j.data) {
        // check if job done, shape depends on Suno response
        const done = j.data?.status === "finished" || j.data?.state === "done" || !!j.data?.result?.url;
        if (done) {
          const url = j.data?.result?.url || j.data?.downloadUrl || j.data?.url || j.data?.outputUrl || (j.data?.items && j.data.items[0]?.url);
          setDownloadUrl(url);
          setStatus("Ready");
          return;
        }
      }
      await new Promise(r => setTimeout(r, 3000));
    }
    setStatus("Processing took too long — try again later");
  }

  return (
    <div>
      <form onSubmit={upload}>
        <input type="file" accept="audio/*" onChange={e => setFile(e.target.files[0])} />
        <button type="submit">Upload & Generate</button>
      </form>
      <div>{status}</div>
      {downloadUrl && (
        <div>
          <a href={downloadUrl} target="_blank" rel="noreferrer">Download result</a>
        </div>
      )}
    </div>
  );
}
