import { getTranslations } from "next-intl/server";
import { getLabEntries, getProjects, getStackLayers, getStory, type Locale } from "@/lib/content/loader";
import { StackTraceClient, type TraceGroup, type TraceSource, type TraceUse } from "./StackTraceClient";

type Source = TraceSource & { key: string; stack: string[] };

const norm = (s: string) => s.toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
/** "2026-05" -> 2026.33, "2024" -> 2024 (start of the year). */
const startOf = (v: string) => Number(v.slice(0, 4)) + (v.length > 4 ? (Number(v.slice(5, 7)) - 1) / 12 : 0);
/** End of a period: end of the given year, or the given month. */
const endOf = (v: string) => (v.length > 4 ? startOf(v) + 1 / 12 : Number(v) + 1);

/**
 * The stack traced over time: one line per tool, one stroke per project that used it, on a shared year axis.
 * Everything is computed from the project, lab and story files; content/about/stack.json only lists the tools.
 */
export async function StackTrace({ locale }: { locale: Locale }) {
  const [data, projects, labs, story, t] = await Promise.all([getStackLayers(), getProjects(locale), getLabEntries(locale), getStory(), getTranslations("about")]);
  const now = new Date();
  const today = now.getFullYear() + now.getMonth() / 12;

  const sources: Source[] = [];
  const seen = new Set<string>();
  const push = (s: Source) => {
    if (seen.has(s.key)) return;
    seen.add(s.key);
    sources.push(s);
  };
  for (const p of projects) {
    push({ key: `/work/${p.slug}`, title: p.title, href: `/work/${p.slug}`, a: startOf(p.period.from), b: p.period.to ? endOf(p.period.to) : today, ongoing: !p.period.to, stack: p.stack });
  }
  for (const e of labs) {
    const [from, to = from] = e.year.split("-");
    const ongoing = e.status === "active" && Number(to) >= now.getFullYear();
    push({ key: `/lab#${e.slug}`, title: e.title.split(",")[0], href: `/lab#${e.slug}`, a: startOf(from), b: ongoing ? today : endOf(to), ongoing, stack: e.stack });
  }
  for (const s of story.steps) {
    if (s.kind === "founder") continue; // the products above already carry that period
    push({ key: s.href ?? `step:${s.id}`, title: s.org, href: s.href ?? null, a: startOf(s.from), b: s.to ? endOf(s.to) : today, ongoing: !s.to, stack: s.stack });
  }

  const start = Math.floor(Math.min(...sources.map((s) => s.a)));
  const end = today + 0.35;
  // Nothing is used in the future: a period declared until the end of the year stops at today.
  const frac = (v: number) => (Math.min(Math.max(v, start), today) - start) / (end - start);

  const groups: TraceGroup[] = data.layers.map((layer) => ({
    id: layer.id,
    label: layer.label[locale],
    tools: layer.items.map((item) => {
      const matchers = new Set((item.match ?? [item.name]).map(norm));
      const uses: TraceUse[] = sources
        .filter((src) => src.stack.some((x) => matchers.has(norm(x))))
        .sort((x, y) => x.a - y.a)
        .map((src) => ({ title: src.title, href: src.href, a: frac(src.a), b: Math.max(frac(src.b), frac(src.a) + 0.012), ongoing: src.ongoing }));
      return { id: `${layer.id}:${norm(item.name)}`, name: item.name, uses };
    }),
  }));

  // Ticks sit at their true position on the axis (not clamped to today) and stop at the current year.
  const years: { year: number; x: number }[] = [];
  for (let y = start; y <= Math.floor(today); y++) years.push({ year: y, x: (y - start) / (end - start) });

  return (
    <StackTraceClient
      groups={groups}
      years={years}
      start={start}
      end={end}
      todayX={frac(today)}
      sources={sources.map(({ title, href, a, b, ongoing }) => ({ title, href, a: frac(a), b: frac(b), ongoing }))}
      labels={{ hint: t("stackHint"), projects: t("stackProjects"), today: t("stackToday") }}
    />
  );
}
