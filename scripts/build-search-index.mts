/**
 * Builds public/search-index.{locale}.json for the command palette.
 * M0: pages only. M1 adds projects, lab entries and MDX sections from the content loader.
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";

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
    const pages: Entry[] = [
      { id: "page:home", type: "page", title: messages.site.name, subtitle: messages.site.tagline, href: "/", keywords: ["home", "entry", "accueil"], order: 0 },
      { id: "page:work", type: "page", title: nav.work, href: "/work", keywords: ["work", "projects", "projets", "travaux", "systems"], order: 1 },
      { id: "page:lab", type: "page", title: nav.lab, href: "/lab", keywords: ["lab", "atelier", "experiments", "prototypes"], order: 2 },
      { id: "page:about", type: "page", title: nav.about, href: "/about", keywords: ["about", "parcours", "cv", "resume"], order: 3 },
      { id: "page:contact", type: "page", title: nav.contact, href: "/contact", keywords: ["contact", "email", "hire", "freelance"], order: 4 },
    ];
    const out = path.join(ROOT, "public", `search-index.${locale}.json`);
    await writeFile(out, JSON.stringify({ locale, generatedAt: new Date().toISOString(), entries: pages }));
    console.log(`search-index: ${locale} → ${pages.length} entries`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
