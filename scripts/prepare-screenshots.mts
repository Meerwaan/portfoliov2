/**
 * Processes content/raw-screenshots/<slug>/<id>.(png|jpg|jpeg) into
 *   public/screens/<slug>/<id>-{800,1600,2400}.{webp,avif}   (DOM, next/image)
 *   public/screens/<slug>/<id>-texture.webp                   (1600px WebGL texture)
 * and writes content/screens.manifest.json with dimensions and blur placeholders.
 * Skips renditions whose output is newer than the source. The "legacy" folder is ignored.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const RAW = path.join(ROOT, "content", "raw-screenshots");
const OUT = path.join(ROOT, "public", "screens");
const MANIFEST = path.join(ROOT, "content", "screens.manifest.json");
const SIZES = [800, 1600, 2400];
const TEXTURE_WIDTH = 1600;
const IGNORED = new Set(["legacy"]);

type Entry = { width: number; height: number; blurDataURL: string; sizes: number[]; formats: ("webp" | "avif")[]; texture: string };

async function exists(p: string) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function isFresh(src: string, out: string) {
  if (!(await exists(out))) return false;
  const [a, b] = await Promise.all([fs.stat(src), fs.stat(out)]);
  return b.mtimeMs >= a.mtimeMs;
}

async function main() {
  const manifest: Record<string, Entry> = (await exists(MANIFEST)) ? JSON.parse(await fs.readFile(MANIFEST, "utf8")) : {};
  const slugs = (await exists(RAW)) ? (await fs.readdir(RAW, { withFileTypes: true })).filter((d) => d.isDirectory() && !IGNORED.has(d.name)).map((d) => d.name) : [];
  let processed = 0;

  for (const slug of slugs) {
    const dir = path.join(RAW, slug);
    const files = (await fs.readdir(dir)).filter((f) => /\.(png|jpe?g)$/i.test(f)).sort();
    for (const file of files) {
      const id = file.replace(/\.(png|jpe?g)$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const src = path.join(dir, file);
      const outDir = path.join(OUT, slug);
      await fs.mkdir(outDir, { recursive: true });
      const image = sharp(src, { limitInputPixels: false }).rotate();
      const meta = await image.metadata();
      if (!meta.width || !meta.height) throw new Error(`Unreadable image: ${src}`);
      const sizes: number[] = [];
      for (const w of SIZES) {
        if (w > meta.width && sizes.length > 0) break; // never upscale beyond the largest fitting size
        const width = Math.min(w, meta.width);
        for (const fmt of ["webp", "avif"] as const) {
          const out = path.join(outDir, `${id}-${w}.${fmt}`);
          if (!(await isFresh(src, out))) {
            const pipeline = sharp(src, { limitInputPixels: false }).rotate().resize({ width, withoutEnlargement: true });
            if (fmt === "webp") await pipeline.webp({ quality: 82, effort: 5 }).toFile(out);
            else await pipeline.avif({ quality: 60, effort: 5 }).toFile(out);
          }
        }
        sizes.push(w);
      }
      const texture = path.join(outDir, `${id}-texture.webp`);
      if (!(await isFresh(src, texture))) {
        await sharp(src, { limitInputPixels: false }).rotate().resize({ width: TEXTURE_WIDTH, withoutEnlargement: true }).webp({ quality: 78, effort: 5 }).toFile(texture);
      }
      const blur = await sharp(src, { limitInputPixels: false }).rotate().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
      manifest[`${slug}/${id}`] = {
        width: meta.width,
        height: meta.height,
        blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
        sizes,
        formats: ["webp", "avif"],
        texture: `/screens/${slug}/${id}-texture.webp`,
      };
      processed++;
      console.log(`screens: ${slug}/${id} ${meta.width}x${meta.height} → ${sizes.join("/")}`);
    }
  }

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(MANIFEST, JSON.stringify(sorted, null, 2));
  console.log(`screens: ${processed} image(s) processed, manifest has ${Object.keys(sorted).length} entries`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
