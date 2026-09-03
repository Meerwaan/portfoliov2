/**
 * Filesystem content loader. Node-only (fs): import from Server Components, route handlers and scripts.
 * Every read is validated with zod; a bad file fails the build with its path in the message.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  AboutFrontmatter,
  StoryData,
  StackData,
  LabFrontmatter,
  LabMeta,
  LabSpecimen,
  ProjectFrontmatter,
  ProjectMeta,
  ScreensManifest,
  type Screenshot,
  type ScreenshotMeta,
} from "./schema";

export type Locale = "fr" | "en";
const DEFAULT_LOCALE: Locale = "fr";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");

export type Project = Omit<ProjectMeta, "screenshots"> &
  ProjectFrontmatter & {
    locale: Locale;
    /** True when this locale had no MDX file and the default locale body is shown instead. */
    fallbackBody: boolean;
    body: string;
    screenshots: Screenshot[];
    hero: Screenshot | null;
  };

export type LabEntry = Omit<LabMeta, "screenshots"> &
  LabFrontmatter & { locale: Locale; fallbackBody: boolean; body: string; screenshots: Screenshot[] };

function fail(file: string, error: unknown): never {
  const detail = error instanceof Error ? error.message : String(error);
  throw new Error(`[content] ${path.relative(ROOT, file)}: ${detail}`);
}

async function readJson<T>(file: string, schema: { parse: (v: unknown) => T }): Promise<T> {
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (e) {
    fail(file, e);
  }
  try {
    return schema.parse(JSON.parse(raw));
  } catch (e) {
    fail(file, e);
  }
}

async function exists(file: string) {
  try {
    await fs.access(file);
    return true;
  } catch {
    return false;
  }
}

let manifestCache: Promise<ScreensManifest> | null = null;
function getScreensManifest(): Promise<ScreensManifest> {
  manifestCache ??= (async () => {
    const file = path.join(CONTENT, "screens.manifest.json");
    if (!(await exists(file))) return {};
    return readJson(file, ScreensManifest);
  })();
  return manifestCache;
}

async function hydrateScreenshots(
  slug: string,
  metas: ScreenshotMeta[],
  alts: Record<string, string>,
  file: string,
): Promise<Screenshot[]> {
  const manifest = await getScreensManifest();
  const out: Screenshot[] = [];
  for (const meta of metas) {
    const key = `${slug}/${meta.id}`;
    const entry = manifest[key];
    // The manifest is committed with public/screens: a declared capture that is not in it is a content error,
    // not a pending one, otherwise a fresh clone (Vercel) would silently build without a single capture.
    if (!entry) fail(file, `screenshot "${meta.id}" is not in content/screens.manifest.json (run pnpm screens)`);
    const alt = alts[meta.id];
    if (!alt) fail(file, `missing screenshotAlt for "${meta.id}"`);
    const largest = Math.max(...entry.sizes);
    out.push({
      ...meta,
      src: `/screens/${slug}/${meta.id}-${largest}.webp`,
      width: entry.width,
      height: entry.height,
      blurDataURL: entry.blurDataURL,
      texture: entry.texture,
      alt,
    });
  }
  return out;
}

async function readMdx<T>(
  dir: string,
  locale: Locale,
  schema: { parse: (v: unknown) => T },
): Promise<{ data: T; body: string; fallbackBody: boolean }> {
  let file = path.join(dir, `${locale}.mdx`);
  let fallbackBody = false;
  if (!(await exists(file))) {
    file = path.join(dir, `${DEFAULT_LOCALE}.mdx`);
    fallbackBody = true;
  }
  let raw: string;
  try {
    raw = await fs.readFile(file, "utf8");
  } catch (e) {
    fail(file, e);
  }
  const parsed = matter(raw);
  try {
    return { data: schema.parse(parsed.data), body: parsed.content.trim(), fallbackBody };
  } catch (e) {
    fail(file, e);
  }
}

async function listDirs(base: string): Promise<string[]> {
  if (!(await exists(base))) return [];
  const entries = await fs.readdir(base, { withFileTypes: true });
  return entries.filter((e) => e.isDirectory()).map((e) => e.name).sort();
}

export async function getProjectSlugs(): Promise<string[]> {
  return listDirs(path.join(CONTENT, "projects"));
}

export async function getProject(slug: string, locale: Locale): Promise<Project> {
  const dir = path.join(CONTENT, "projects", slug);
  const metaFile = path.join(dir, "meta.json");
  const meta = await readJson(metaFile, ProjectMeta);
  if (meta.slug !== slug) fail(metaFile, `slug "${meta.slug}" does not match folder "${slug}"`);
  const { data, body, fallbackBody } = await readMdx(dir, locale, ProjectFrontmatter);
  const screenshots = await hydrateScreenshots(slug, meta.screenshots, data.screenshotAlt, metaFile);
  const hero = screenshots[meta.heroScreenshot] ?? screenshots[0] ?? null;
  return { ...meta, ...data, locale, fallbackBody, body, screenshots, hero };
}

export async function getProjects(locale: Locale): Promise<Project[]> {
  const slugs = await getProjectSlugs();
  const projects = await Promise.all(slugs.map((slug) => getProject(slug, locale)));
  return projects.sort((a, b) => a.order - b.order);
}

async function getLabSlugs(): Promise<string[]> {
  return listDirs(path.join(CONTENT, "lab"));
}

async function getLabEntry(slug: string, locale: Locale): Promise<LabEntry> {
  const dir = path.join(CONTENT, "lab", slug);
  const metaFile = path.join(dir, "meta.json");
  const meta = await readJson(metaFile, LabMeta);
  if (meta.slug !== slug) fail(metaFile, `slug "${meta.slug}" does not match folder "${slug}"`);
  const { data, body, fallbackBody } = await readMdx(dir, locale, LabFrontmatter);
  const screenshots = await hydrateScreenshots(slug, meta.screenshots, data.screenshotAlt, metaFile);
  return { ...meta, ...data, locale, fallbackBody, body, screenshots };
}

/** The real layers of a lab entry (code excerpt, modules, services), or null when not documented yet. */
export async function getLabSpecimen(slug: string): Promise<LabSpecimen | null> {
  const file = path.join(CONTENT, "lab", slug, "specimen.json");
  if (!(await exists(file))) return null;
  return readJson(file, LabSpecimen);
}

export async function getLabEntries(locale: Locale): Promise<LabEntry[]> {
  const slugs = await getLabSlugs();
  const entries = await Promise.all(slugs.map((slug) => getLabEntry(slug, locale)));
  return entries.sort((a, b) => a.order - b.order);
}

/** Exploded-stack data (content/projects/<slug>/stack.json), or null when the project has none. */
export async function getProjectStack(slug: string): Promise<StackData | null> {
  const file = path.join(CONTENT, "projects", slug, "stack.json");
  if (!(await exists(file))) return null;
  const data = await readJson(file, StackData);
  const known = new Set(data.models.flatMap((m) => m.fields.map((f) => `${m.name}.${f}`)));
  const routes = new Set(data.routes.map((r) => r.id));
  for (const h of data.hotspots) {
    for (const f of h.fields) if (!known.has(f)) fail(file, `hotspot "${h.id}" references unknown field "${f}"`);
    for (const r of h.routes) if (!routes.has(r)) fail(file, `hotspot "${h.id}" references unknown route "${r}"`);
  }
  return data;
}

export async function getProjectDiagram(slug: string): Promise<string | null> {
  const file = path.join(CONTENT, "projects", slug, "diagram.svg");
  if (!(await exists(file))) return null;
  return fs.readFile(file, "utf8");
}

export type About = AboutFrontmatter & { locale: Locale; fallbackBody: boolean; body: string };

export async function getAbout(locale: Locale): Promise<About> {
  const { data, body, fallbackBody } = await readMdx(path.join(CONTENT, "about"), locale, AboutFrontmatter);
  return { ...data, locale, fallbackBody, body };
}

/** Steps of the path page (content/about/story.json). */
export async function getStory(): Promise<StoryData> {
  return readJson(path.join(CONTENT, "about", "story.json"), StoryData);
}

