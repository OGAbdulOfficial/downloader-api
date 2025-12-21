export default function normalize(data) {
  const formats = [];
  const seen = new Set();

  for (const f of data.formats || []) {
    if (!f.url) continue;
    if (f.protocol?.includes("m3u8")) continue;
    if (f.format_note === "storyboard") continue;

    // Audio
    if (f.vcodec === "none" && f.acodec !== "none") {
      if (seen.has("audio")) continue;
      seen.add("audio");
      formats.push({
        type: "audio",
        quality: "MP3",
        url: f.url
      });
      continue;
    }

    // Video
    if (f.vcodec !== "none") {
      const q = f.height ? `${f.height}p` : "video";
      if (seen.has(q)) continue;
      seen.add(q);
      formats.push({
        type: "video",
        quality: q,
        url: f.url
      });
    }
  }

  return {
    title: data.title,
    thumbnail: data.thumbnail,
    duration: data.duration,
    formats
  };
}
