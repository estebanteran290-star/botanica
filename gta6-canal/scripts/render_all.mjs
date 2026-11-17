// Renderiza los vídeos (MP4 1080p) y las miniaturas (JPG 1280x720) a out/.
// Uso: node scripts/render_all.mjs [v01 v02 ...]
import { bundle } from "@remotion/bundler";
import { renderMedia, renderStill, selectComposition } from "@remotion/renderer";
import fs from "node:fs";
import path from "node:path";

const browserExecutable = process.env.BROWSER ?? "/opt/pw-browsers/chromium";
const manifest = JSON.parse(fs.readFileSync("src/data/manifest.json", "utf8"));
const only = new Set(process.argv.slice(2));
fs.mkdirSync("out", { recursive: true });

const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });

for (const v of manifest.videos) {
  if (only.size && !only.has(v.id)) continue;
  const base = `out/${v.id}-${v.slug}`;
  const thumb = await selectComposition({ serveUrl, id: `thumb-${v.id}`, browserExecutable });
  await renderStill({ composition: thumb, serveUrl, browserExecutable, output: `${base}-miniatura.jpg`, imageFormat: "jpeg", jpegQuality: 92, scale: 2 / 3 });
  const comp = await selectComposition({ serveUrl, id: `video-${v.id}`, browserExecutable });
  const t0 = Date.now();
  let last = -1;
  await renderMedia({
    composition: comp,
    serveUrl,
    browserExecutable,
    codec: "h264",
    crf: 22,
    audioBitrate: "192k",
    concurrency: Number(process.env.CONCURRENCY ?? 4),
    outputLocation: `${base}.mp4`,
    onProgress: ({ progress }) => {
      const pct = Math.floor(progress * 10);
      if (pct !== last) {
        last = pct;
        console.log(`${v.id} ${pct * 10}%`);
      }
    },
  });
  console.log(`done ${v.id} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
