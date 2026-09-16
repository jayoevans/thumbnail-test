// Resizes every image in raw-images/ to 480x270 WebP in public/thumbs/ and
// writes public/thumbs/manifest.json.
//
// raw-images/<anything>.png|jpg|webp -> id is the filename stem, e.g. "07"
// or "harbour-wide". Existing outputs are overwritten. Re-run whenever you
// add or replace images.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const WIDTH = 480;
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const OK = new Set([".png", ".jpg", ".jpeg", ".webp"]);

const src = path.join(ROOT, "raw-images");
const out = path.join(ROOT, "public", "thumbs");
await fs.mkdir(src, { recursive: true });
await fs.mkdir(out, { recursive: true });

const files = (await fs.readdir(src)).filter((f) => OK.has(path.extname(f).toLowerCase())).sort();
const manifest = [];
for (const f of files) {
  const stem = path.basename(f, path.extname(f));
  const id = stem.replace(/[^A-Za-z0-9_-]+/g, "-").toLowerCase();
  const file = `${id}.webp`;
  await sharp(path.join(src, f))
    .resize({ width: WIDTH, height: Math.round((WIDTH * 9) / 16), fit: "cover" })
    .webp({ quality: 82 })
    .toFile(path.join(out, file));
  manifest.push({ id, file });
  console.log(`${f} -> ${file}`);
}
await fs.writeFile(path.join(out, "manifest.json"), JSON.stringify(manifest, null, 2));
console.log(`${manifest.length} images`);
