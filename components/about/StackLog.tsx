import { getTranslations } from "next-intl/server";
import { getLabEntries, getProjects, getStackLog, getStory, type Locale } from "@/lib/content/loader";
import { StackLogClient, type LogRelease, type LogTool } from "./StackLogClient";

type Source = { key: string; title: string; href: string | null; from: number; to: number | null; stack: string[] };
const norm = (s: string) => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
const year = (v: string) => Number(v.slice(0, 4));

/**
 * The stack as a changelog: one release per year, the tools that arrived that year grouped by layer, and for each
 * tool the projects of this site where it served (computed from the project, lab and story files). Server side:
 * data only; the client follows the scroll and answers hover.
 */
export async function StackLog({ locale }: { locale: Locale }) {
  const [data, projects, labs, story, t] = await Promise.all([getStackLog(), getProjects(locale), getLabEntries(locale), getStory(), getTranslations("about")]);
  const sources: Source[] = [];
  const seen = new Set<string>();
  const push = (s: Source) => {
    if (!seen.has(s.key)) {
      seen.add(s.key);
      sources.push(s);
    }
  };
  for (const p of projects) push({ key: `/work/${p.slug}`, title: p.title, href: `/work/${p.slug}`, from: year(p.period.from), to: p.period.to ? year(p.period.to) : null, stack: p.stack });
  for (const e of labs) {
    const [a, b = a] = e.year.split("-");
    push({ key: `/lab#${e.slug}`, title: e.title.split(",")[0], href: `/lab#${e.slug}`, from: Number(a), to: Number(b), stack: e.stack });
  }
  for (const s of story.steps) {
    if (s.kind === "founder") continue;
    push({ key: s.href ?? `step:${s.id}`, title: s.org, href: s.href ?? null, from: Number(s.from), to: s.to ? Number(s.to) : null, stack: s.stack });
  }
  const layerLabel = Object.fromEntries(data.layers.map((l) => [l.id, l.label[locale]]));
  const tools: LogTool[] = data.tools.map((tool) => {
    const matchers = new Set((tool.match ?? [tool.name]).map(norm));
    const uses = sources
      .filter((src) => src.stack.some((x) => matchers.has(norm(x))))
      .sort((a, b) => a.from - b.from)
      .map(({ title, href, from, to }) => ({ title, href, from, to }));
    return { name: tool.name, layer: tool.layer, layerLabel: layerLabel[tool.layer] ?? tool.layer, year: tool.year, core: tool.core, uses };
  });
  const releases: LogRelease[] = data.releases
    .slice()
    .sort((a, b) => a.year - b.year)
    .map((r) => ({
      year: r.year,
      where: r.where[locale],
      caption: r.caption[locale],
      groups: data.layers.map((l) => ({ id: l.id, label: l.label[locale], tools: tools.filter((tool) => tool.year === r.year && tool.layer === l.id).map((tool) => tool.name) })).filter((g) => g.tools.length > 0),
    }));
  return <StackLogClient releases={releases} tools={tools} labels={{ version: t("stackVersion"), installed: t("stackInstalled"), inService: t("stackInService"), hint: t("stackHint"), since: t("stackSince"), today: t("stackToday"), latest: t("stackLatest") }} />;
}
