import { exec } from "child_process";

export function fetchMedia(url) {
  return new Promise((resolve, reject) => {
    const cmd = `yt-dlp -J "${url}"`;

    exec(cmd, { maxBuffer: 1024 * 1024 * 20 }, (err, stdout) => {
      if (err) return reject(err);
      try {
        resolve(JSON.parse(stdout));
      } catch {
        reject("Parse error");
      }
    });
  });
}
