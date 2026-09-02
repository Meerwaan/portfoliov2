import { z } from "zod";

export const Status = z.enum(["production", "delivered", "building"]);
export type Status = z.infer<typeof Status>;

export const LabStatus = z.enum(["prototype", "active", "paused", "archived"]);
export type LabStatus = z.infer<typeof LabStatus>;

export const Role = z.enum(["founder", "freelance", "employee", "study"]);
export type Role = z.infer<typeof Role>;

export const Frame = z.enum(["browser", "phone", "desktop", "none"]);
export type Frame = z.infer<typeof Frame>;

/** Declared in meta.json; width/height/blurDataURL are hydrated from content/screens.manifest.json. */
export const ScreenshotMeta = z.object({
  /** File stem inside public/screens/<slug>/, without size suffix or extension (e.g. "dashboard"). */
  id: z.string().min(1),
  frame: Frame.default("browser"),
});
export type ScreenshotMeta = z.infer<typeof ScreenshotMeta>;

export const Screenshot = ScreenshotMeta.extend({
  /** Absolute public path of the largest rendition (e.g. /screens/reputap/dashboard-2400.webp). */
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  blurDataURL: z.string().optional(),
  /** Path of the 1600px WebP used as a WebGL texture. */
  texture: z.string(),
  alt: z.string().min(12),
});
export type Screenshot = z.infer<typeof Screenshot>;

const Period = z.object({
  from: z.string().regex(/^\d{4}(-\d{2})?$/),
  to: z.string().regex(/^\d{4}(-\d{2})?$/).nullable(),
});

export const ProjectMeta = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  /** Stable identifier shown in the 3D space captions and /work rows (NODE_01 ...). */
  node: z.string().regex(/^NODE_\d{2}$/),
  status: Status,
  role: Role,
  period: Period,
  stack: z.array(z.string()).min(1).max(12),
  links: z.object({ live: z.string().url().optional(), repo: z.string().url().optional() }).default({}),
  screenshots: z.array(ScreenshotMeta).default([]),
  heroScreenshot: z.number().int().nonnegative().default(0),
  diagram: z.boolean().default(false),
  order: z.number().int(),
  featured: z.boolean().default(false),
  space: z.object({ index: z.number().int(), tilt: z.number().min(-8).max(8).default(0) }).optional(),
});
export type ProjectMeta = z.infer<typeof ProjectMeta>;

export const Metric = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  /** Sentence or URL. A metric without a source does not ship. */
  source: z.string().min(8),
  asOf: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
});
export type Metric = z.infer<typeof Metric>;

/** Frontmatter of content/projects/<slug>/<locale>.mdx */
export const ProjectFrontmatter = z.object({
  title: z.string().min(1),
  summary: z.string().min(20).max(160),
  oneLiner: z.string().min(10).max(90),
  roleLabel: z.string().min(2),
  metrics: z.array(Metric).default([]),
  keywords: z.array(z.string()).default([]),
  /** Alt text per screenshot id, in this locale. */
  screenshotAlt: z.record(z.string(), z.string().min(12)).default({}),
});
export type ProjectFrontmatter = z.infer<typeof ProjectFrontmatter>;

export const LabMeta = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  status: LabStatus,
  year: z.string().regex(/^\d{4}(-\d{4})?$/),
  stack: z.array(z.string()).max(10).default([]),
  links: z.object({ live: z.string().url().optional(), repo: z.string().url().optional() }).default({}),
  screenshots: z.array(ScreenshotMeta).default([]),
  order: z.number().int(),
});
export type LabMeta = z.infer<typeof LabMeta>;

export const LabFrontmatter = z.object({
  title: z.string().min(1),
  summary: z.string().min(10).max(160),
  myRole: z.string().min(3),
  keywords: z.array(z.string()).default([]),
  screenshotAlt: z.record(z.string(), z.string().min(12)).default({}),
});
export type LabFrontmatter = z.infer<typeof LabFrontmatter>;

export const ScreensManifest = z.record(
  z.string(), // "<slug>/<id>"
  z.object({
    width: z.number().int(),
    height: z.number().int(),
    blurDataURL: z.string(),
    sizes: z.array(z.number().int()),
    formats: z.array(z.enum(["webp", "avif"])),
    texture: z.string(),
  }),
);
export type ScreensManifest = z.infer<typeof ScreensManifest>;

const Localized = z.object({ fr: z.string().min(1), en: z.string().min(1) });
const PathEntry = z.object({
  from: z.string().regex(/^\d{4}(-\d{2})?$/),
  to: z.string().regex(/^\d{4}(-\d{2})?$/).nullable(),
  org: z.string().min(1),
  place: z.string().optional(),
  role: Localized,
  line: Localized.optional(),
  href: z.string().optional(),
});
export type PathEntry = z.infer<typeof PathEntry>;

export const PathData = z.object({
  experience: z.array(PathEntry).min(1),
  education: z.array(PathEntry).min(1),
  stack: z.record(z.string(), z.array(z.string()).min(1)),
});
export type PathData = z.infer<typeof PathData>;

export const AboutFrontmatter = z.object({ title: z.string().min(1), statement: z.string().min(10).max(120) });
export type AboutFrontmatter = z.infer<typeof AboutFrontmatter>;
