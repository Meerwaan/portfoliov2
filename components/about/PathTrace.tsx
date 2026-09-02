import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import type { PathEntry } from "@/lib/content/schema";
import { ActiveOnView } from "@/components/motion/ActiveOnView";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

function year(v: string) {
  return v.slice(0, 4);
}

/**
 * The path as a trace: one vertical line that fills as you scroll, a node per step that lights when in view.
 * Experience and education share the line, newest first, so the reader descends into the past.
 */
export async function PathTrace({ experience, education, locale }: { experience: PathEntry[]; education: PathEntry[]; locale: "fr" | "en" }) {
  const t = await getTranslations("about");
  const steps = [
    ...experience.map((e) => ({ ...e, kind: "experience" as const })),
    ...education.map((e) => ({ ...e, kind: "education" as const })),
  ].sort((a, b) => (a.from < b.from ? 1 : -1));

  return (
    <div className="path-trace relative" data-track-root="path">
      <ScrollProgress start="top 65%" end="bottom 75%" />
      <ActiveOnView selector="[data-track-root='path'] [data-track]" />
      <div className="path-line" aria-hidden="true" />
      <ol className="flex flex-col">
        {steps.map((e, i) => {
          const range = e.to === null ? `${year(e.from)} · ${t("today")}` : year(e.from) === year(e.to) ? year(e.from) : `${year(e.from)}-${year(e.to)}`;
          return (
            <li key={`${e.org}-${e.from}`} data-track={`${i}`} className="path-step relative grid gap-2 py-8 pl-10 md:grid-cols-[9rem_1fr] md:pl-12">
              <span className="path-node" aria-hidden="true" />
              <span className="mono-label text-ink-3 tabular">
                {range}
                <span className="mt-1 block text-ink-3">{t(e.kind)}</span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-xl font-medium text-ink">{e.role[locale]}</span>
                <span className="text-ink-2">
                  {e.org}
                  {e.place ? `, ${e.place}` : ""}
                </span>
                {e.line && <span className="mt-1 text-sm text-ink-2">{e.line[locale]}</span>}
                {e.href && (
                  <Link href={e.href} className="mono-label mt-2 inline-flex w-fit items-center gap-1 border-b border-rule-strong text-ink-2 hover:border-signal hover:text-signal">
                    {t("readCase")} <ArrowUpRight size={12} />
                  </Link>
                )}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
