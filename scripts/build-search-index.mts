/**
 * Builds public/search-index.{locale}.json for the command palette from pages, projects, lab entries and
 * their ## sections. Runs in `prebuild`; import paths are relative because tsx does not resolve "@/".
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { getLabEntries, getProjects } from "../lib/content/loader";
import { extractHeadings, stripMdx } from "../lib/content/text";

const ROOT = process.cwd();
const LOCALES = ["fr", "en"] as const;

type Entry = {
  id: string;
  type: "project" | "lab" | "page" | "section";
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
  body?: string;
  status?: string;
  stack?: string[];
  order: number;
};

async function main() {
  await mkdir(path.join(ROOT, "public"), { recursive: true });
  for (const locale of LOCALES) {
    const messages = JSON.parse(await readFile(path.join(ROOT, "messages", `${locale}.json`), "utf8"));
    const nav = messages.nav as Record<string, string>;
    const entries: Entry[] = [
      { id: "page:home", type: "page", title: messages.site.name, subtitle: messages.site.tagline, href: "/", keywords: ["home", "entry", "accueil"], order: 0 },
      { id: "page:work", type: "page", title: nav.work, href: "/work", keywords: ["work", "projects", "projets", "travaux", "systems"], order: 1 },
      { id: "page:lab", type: "page", title: nav.lab, href: "/lab", keywords: ["lab", "atelier", "experiments", "prototypes"], order: 2 },
      { id: "page:about", type: "page", title: nav.about, href: "/about", keywords: ["about", "parcours", "cv", "resume"], order: 3 },
      { id: "page:contact", type: "page", title: nav.contact, href: "/contact", keywords: ["contact", "email", "hire", "freelance"], order: 4 },
    ];

    for (const p of await getProjects(locale)) {
      entries.push({
        id: `project:${p.slug}`,
        type: "project",
        title: p.title,
        subtitle: p.oneLiner,
        href: `/work/${p.slug}`,
        keywords: [...p.keywords, p.node.toLowerCase(), p.role],
        body: stripMdx(p.body),
        status: p.status,
        stack: p.stack,
        order: p.order,
      });
      for (const h of extractHeadings(p.body).filter((h) => h.depth === 2)) {
        entries.push({
          id: `section:${p.slug}:${h.id}`,
          type: "section",
          title: h.text,
          subtitle: p.title,
          href: `/work/${p.slug}#${h.id}`,
          keywords: p.keywords,
          order: p.order,
        });
      }
    }

    for (const e of await getLabEntries(locale)) {
      entries.push({
        id: `lab:${e.slug}`,
        type: "lab",
        title: e.title,
        subtitle: e.summary,
        href: `/lab#${e.slug}`,
        keywords: e.keywords,
        body: stripMdx(e.body),
        status: e.status,
        stack: e.stack,
        order: 100 + e.order,
      });
    }

    const out = path.join(ROOT, "public", `search-index.${locale}.json`);
    await writeFile(out, JSON.stringify({ locale, generatedAt: new Date().toISOString(), entries }));
    console.log(`search-index: ${locale} → ${entries.length} entries`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
