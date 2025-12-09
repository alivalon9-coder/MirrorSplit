if (!files.audio) return NextResponse.json({ error: "No audio" }, { status: 400 });
const allowed = ["audio/mpeg","audio/mp3","audio/wav","audio/x-wav","audio/mp4"];
if (!allowed.includes(audio.mimetype)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
if (audio.size > 50 * 1024 * 1024) return NextResponse.json({ error: "File too large" }, { status: 400 });
