import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import type { LabEntry } from "@/lib/content/loader";
import { renderMdx } from "@/lib/content/mdx";
import { ActiveOnView } from "@/components/motion/ActiveOnView";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

/**
 * The log under the bench: the long-form entry of each experiment, with a timeline rail that fills as you read.
 */
export async function LabLog({ entries }: { entries: LabEntry[] }) {
  const t = await getTranslations("lab");
  const rendered = await Promise.all(entries.map((e) => renderMdx(e.body)));

  return (
    <section className="lab-bench container-page relative pb-section" data-track-root="lab">
      <ScrollProgress start="top 60%" end="bottom 70%" />
      <ActiveOnView selector="[data-track-root='lab'] [data-track]" />
      <div className="grid gap-10 lg:grid-cols-12">
        <div className="lab-rail hidden lg:col-span-1 lg:block" aria-hidden="true">
          <div className="lab-rail-line" />
        </div>
        <ol className="min-w-0 lg:col-span-8">
          {entries.map((entry, i) => (
            <li key={entry.slug} id={entry.slug} data-track={entry.slug} className="lab-entry scroll-mt-24 border-t border-rule py-12 md:py-16">
              <article className="flex min-w-0 flex-col gap-5">
                <p className="mono-label flex flex-wrap gap-x-4 text-ink-3">
                  <span className="lab-entry-index text-ink">LAB/{String(i + 1).padStart(2, "0")}</span>
                  <span>{entry.year}</span>
                  <span className={entry.status === "active" ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
                </p>
                <h2 className="font-display text-2xl font-medium text-ink">{entry.title}</h2>
                <p className="text-lg text-ink-2">{entry.summary}</p>
                <p className="mono-label text-ink-3">
                  {entry.myRole}
                  {entry.stack.length > 0 && <span className="normal-case tracking-normal"> · {entry.stack.join(" · ")}</span>}
                </p>
                {entry.fallbackBody && <p className="mono-label text-ink-3">{t("fallbackBody")}</p>}
                <div className="prose-lab min-w-0">{rendered[i]}</div>
                {(entry.links.live || entry.links.repo) && (
                  <p className="mono-label flex gap-6">
                    {entry.links.live && (
                      <a href={entry.links.live} target="_blank" rel="noopener" className="inline-flex items-center gap-1 border-b border-rule-strong text-ink hover:border-signal hover:text-signal">
                        {t("links.live")} <ArrowUpRight size={12} />
                      </a>
                    )}
                    {entry.links.repo && (
                      <a href={entry.links.repo} target="_blank" rel="noopener" className="inline-flex items-center gap-1 border-b border-rule-strong text-ink hover:border-signal hover:text-signal">
                        {t("links.repo")} <ArrowUpRight size={12} />
                      </a>
                    )}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
