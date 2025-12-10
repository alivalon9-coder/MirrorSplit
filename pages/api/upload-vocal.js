// pages/api/upload-vocal.js
import formidable from "formidable";
import fs from "fs";
import axios from "axios";
import FormData from "form-data";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const form = new formidable.IncomingForm({ maxFileSize: 50 * 1024 * 1024 }); // 50MB cap
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("formidable error:", err);
      return res.status(400).json({ error: "Invalid upload" });
    }

    if (!files?.audio) return res.status(400).json({ error: "No file uploaded (name should be 'audio')" });

    try {
      const file = files.audio;
      const buffer = fs.readFileSync(file.filepath);

      // build form-data for Suno "add-instrumental" endpoint
      const fd = new FormData();
      fd.append("file", buffer, { filename: file.originalFilename || "vocal.wav" });
      // optional params: style, tempo, key — depends on Suno docs
      if (fields.style) fd.append("style", fields.style);
      fd.append("mode", "add-instrumental"); // adjust param name per Suno docs

      const sunoRes = await axios.post(
        "https://api.suno.ai/api/v1/generate/add-instrumental",
        fd,
        {
          headers: {
            ...fd.getHeaders(),
            Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
          },
          timeout: 120000
        }
      );

      // suno likely returns taskId or job info
      const data = sunoRes.data;
      return res.status(200).json({ ok: true, data });
    } catch (e) {
      console.error("Suno error:", e.response?.data || e.message);
      return res.status(500).json({ ok: false, error: e.response?.data || e.message });
    }
  });
}
