import express from "express";
import rateLimit from "express-rate-limit";
import detectPlatform from "./utils/detectPlatform.js";
import normalize from "./utils/normalizeYTDLP.js";
import { fetchMedia } from "./services/ytDlpService.js";

const app = express();

/* ===============================
   BASIC SECURITY & STABILITY
================================ */

// Rate limit (abuse protection)
app.use(
  rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 20, // 20 requests per IP
  })
);

// JSON response safety
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
      error: "URL required",
      example: "/api/download?url=https://youtube.com/..."
    });
  }

  const platform = detectPlatform(url);

  if (platform === "unsupported") {
    return res.status(400).json({
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
    const raw = await fetchMedia(url); // yt-dlp call
    const clean = normalize(raw);

    clean.platform = platform;
    clean.success = true;

    res.json(clean);
  } catch (err) {
    console.error("DOWNLOAD ERROR:", err.message);

    res.status(500).json({
      success: false,
      error: "Failed to fetch media",
      detail: err.message
    });
  }
});

/* ===============================
   PORT (Railway compatible)
================================ */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Downloader API running on port ${PORT}`);
});
