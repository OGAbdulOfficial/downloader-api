import express from "express";
import detectPlatform from "./utils/detectPlatform.js";
import normalize from "./utils/normalizeYTDLP.js";
import { fetchMedia } from "./services/ytDlpService.js";

const app = express();

app.get("/api/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL required" });

  const platform = detectPlatform(url);
  if (platform === "unsupported")
    return res.status(400).json({ error: "Unsupported platform" });

  try {
    const raw = await fetchMedia(url);
    const clean = normalize(raw);
    clean.platform = platform;
    res.json(clean);
  } catch (e) {
    res.status(500).json({ error: "Failed to fetch media" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`All-in-One Downloader API running on :${PORT}`);
});
