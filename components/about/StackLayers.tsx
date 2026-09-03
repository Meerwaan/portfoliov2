import { getTranslations } from "next-intl/server";
import { getLabEntries, getProjects, getStackLayers, getStory, type Locale } from "@/lib/content/loader";
import { StackLayersClient, type StackLayer, type StackUse } from "./StackLayersClient";

type Source = { key: string; title: string; href: string | null; from: number; to: number | null; stack: string[] };

const norm = (s: string) => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
const years = (v: string) => v.split("-").map((y) => Number(y.slice(0, 4)));

/**
 * The stack as a real pile: four layers of tools, and for each tool the projects of this site where it was used,
 * computed from the project, lab and story files rather than declared. Server side: data and matching only.
 */
export async function StackLayers({ locale }: { locale: Locale }) {
  const [data, projects, labs, story, t] = await Promise.all([getStackLayers(), getProjects(locale), getLabEntries(locale), getStory(), getTranslations("about")]);

  const sources: Source[] = [];
  const seen = new Set<string>();
  const push = (s: Source) => {
    if (seen.has(s.key)) return;
    seen.add(s.key);
    sources.push(s);
  };
  for (const p of projects) {
    push({ key: `/work/${p.slug}`, title: p.title, href: `/work/${p.slug}`, from: years(p.period.from)[0], to: p.period.to ? years(p.period.to)[0] : null, stack: p.stack });
  }
  for (const e of labs) {
    const [from, to] = years(e.year);
    push({ key: `/lab#${e.slug}`, title: e.title.split(",")[0], href: `/lab#${e.slug}`, from, to: to ?? from, stack: e.stack });
  }
  for (const s of story.steps) {
    if (s.kind === "founder") continue; // the products above already carry that period
    push({ key: s.href ?? `step:${s.id}`, title: s.org, href: s.href ?? null, from: Number(s.from), to: s.to ? Number(s.to) : null, stack: s.stack });
  }

  const layers: StackLayer[] = data.layers.map((layer) => ({
    id: layer.id,
    label: layer.label[locale],
    items: layer.items.map((item) => {
      const matchers = new Set((item.match ?? [item.name]).map(norm));
      const uses: StackUse[] = sources
        .filter((src) => src.stack.some((x) => matchers.has(norm(x))))
        .sort((a, b) => a.from - b.from)
        .map(({ title, href, from, to }) => ({ title, href, from, to }));
      return { id: `${layer.id}:${norm(item.name)}`, name: item.name, since: uses[0]?.from ?? null, uses };
    }),
  }));

  return <StackLayersClient layers={layers} hint={t("stackHint")} today={t("stackToday")} />;
}
