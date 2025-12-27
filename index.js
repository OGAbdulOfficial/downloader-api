import express from "express";
import detectPlatform from "./utils/detectPlatform.js";
import normalize from "./utils/normalizeYTDLP.js";
import { fetchMedia } from "./services/ytDlpService.js";

const app = express();

/* ===============================
   BASIC SECURITY & STABILITY
================================ */

// IMPORTANT: reverse proxy / Cloudflare / Nginx ke liye
app.set("trust proxy", 1);

// JSON parsing
app.use(express.json());

/* ===============================
   HEALTH CHECK (IMPORTANT)
================================ */

app.get("/", (req, res) => {
  res.json({
    status: "ok",
    message: "Downloader API running",
    supported: [
      "YouTube",
      "Instagram",
      "Facebook",
      "Twitter / X",
      "TikTok"
    ]
  });
});

/* ===============================
   MAIN DOWNLOAD API
================================ */

app.get("/api/download", async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({
      success: false,
      error: "URL required",
      example: "/api/download?url=https://youtube.com/..."
    });
  }

  const platform = detectPlatform(url);

  if (platform === "unsupported") {
    return res.status(400).json({
      success: false,
      error: "Unsupported platform",
      supported: [
        "YouTube",
        "Instagram",
        "Facebook",
        "Twitter / X",
        "TikTok"
      ]
    });
  }

  try {
    const raw = await fetchMedia(url);   // yt-dlp call
    const clean = normalize(raw);

    res.json({
      success: true,
      platform,
      ...clean
    });
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err);

    res.status(500).json({
      success: false,
      error: "Failed to fetch media",
      detail: err.message
    });
  }
});

/* ===============================
   PORT + PUBLIC BIND
================================ */

const PORT = process.env.PORT || 3000;

// 🔥 MOST IMPORTANT LINE (public access)
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Downloader API running publicly on port ${PORT}`);
});
