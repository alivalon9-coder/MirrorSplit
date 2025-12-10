// pages/api/check-task.js
import axios from "axios";

export default async function handler(req, res) {
  const { taskId } = req.query;
  if (!taskId) return res.status(400).json({ error: "taskId is required" });

  try {
    // endpoint might be like /api/v1/get?ids=...
    const r = await axios.get(`https://api.suno.ai/api/v1/get?ids=${encodeURIComponent(taskId)}`, {
      headers: {
        Authorization: `Bearer ${process.env.SUNO_API_KEY}`,
      },
      timeout: 10000
    });

    return res.status(200).json({ ok: true, data: r.data });
  } catch (e) {
    console.error("check-task error:", e.response?.data || e.message);
    return res.status(500).json({ ok: false, error: e.response?.data || e.message });
  }
}
