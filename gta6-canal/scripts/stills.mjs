// Uso: node scripts/stills.mjs <outDir> <compId>:<frame> ...
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import path from "node:path";
const [outDir, ...specs] = process.argv.slice(2);
const browserExecutable = process.env.BROWSER ?? "/opt/pw-browsers/chromium";
const serveUrl = await bundle({ entryPoint: path.resolve("src/index.ts") });
for (const spec of specs) {
  const [id, frame] = spec.split(":");
  const composition = await selectComposition({ serveUrl, id, browserExecutable });
  const f = Number(frame ?? 0);
  await renderStill({ composition, serveUrl, browserExecutable, output: path.join(outDir, `${id}-${f}.png`), frame: f, scale: f < 0 ? 1 : 0.5 });
  console.log("ok", spec);
}
