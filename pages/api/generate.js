import formidable from "formidable";
// ... بقية الـ imports

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const form = new formidable.IncomingForm({
    keepExtensions: true,
    maxFileSize: 50 * 1024 * 1024, // 50 MB limit (عدّل على حسب رغبتك)
    multiples: false,
    uploadDir: path.join(process.cwd(), "/tmp/uploads"),
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      // لو الـ err بسبب الحجم، formidable يرمزله غالباً بـ err.code === 'ETOOBIG' أو message يحوي 'maxFileSize'
      console.error("Formidable error:", err);
      if (err.code === "ETOOBIG" || (err.message && err.message.includes("maxFileSize"))) {
        return res.status(413).json({ error: "File too large. Max: 50MB" });
      }
      return res.status(500).json({ error: "Upload failed", details: err.message || err });
    }

    // ... باقي المعالجة
  });
}
