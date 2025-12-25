import ytdlp from "yt-dlp-exec";

export async function fetchMedia(url) {
  const output = await ytdlp(url, {
    dumpSingleJson: true,
    noWarnings: true,
    noCheckCertificates: true,
    preferFreeFormats: true,
    youtubeSkipDashManifest: true
  });

  return output;
}
