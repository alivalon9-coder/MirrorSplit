async function loadFFmpeg() {
  if (typeof window === "undefined") throw new Error("FFmpeg must run in browser");

  const { createFFmpeg, fetchFile } = await import("@ffmpeg/ffmpeg");

  const CORE_CANDIDATES = [
    // try jsdelivr first
    "https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.11.1/dist/ffmpeg-core.js",
    // then unpkg fallback
    "https://unpkg.com/@ffmpeg/core@0.11.1/dist/ffmpeg-core.js",
    // another fallback (if needed)
    "https://cdn.jsdelivr.net/gh/ffmpegwasm/ffmpeg-core@0.11.1/dist/ffmpeg-core.js"
  ];

  let ffmpeg;
  let lastErr: any = null;

  for (const corePath of CORE_CANDIDATES) {
    try {
      ffmpeg = createFFmpeg({
        corePath,
        log: true,
        progress: (p) => {
          if (p?.ratio) setProgressText(`Processing ${(p.ratio * 100).toFixed(0)}%`);
        },
      });
      await ffmpeg.load();
      // loaded successfully
      return { ffmpeg, fetchFile };
    } catch (err) {
      lastErr = err;
      console.warn("ffmpeg core load failed for", corePath, err);
      // try next
    }
  }

  // if we reach here, all candidates failed
  throw new Error("Failed to load ffmpeg core from CDN. Last error: " + (lastErr?.message || lastErr));
}
