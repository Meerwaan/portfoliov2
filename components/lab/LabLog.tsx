import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import type { LabEntry } from "@/lib/content/loader";
import { renderMdx } from "@/lib/content/mdx";

/** Reverse-chronological log. Each entry is anchored (/lab#slug) so the command palette can deep-link. */
export async function LabLog({ entries }: { entries: LabEntry[] }) {
  const t = await getTranslations("lab");
  const rendered = await Promise.all(entries.map((e) => renderMdx(e.body)));
  return (
    <section className="container-page pb-section">
      <ol className="divide-y divide-rule border-t border-rule">
        {entries.map((entry, i) => (
          <li key={entry.slug} id={entry.slug} className="scroll-mt-24 py-12 md:py-16">
            <article className="grid gap-8 lg:grid-cols-12">
              <div className="mono-label flex flex-col gap-3 text-ink-3 lg:col-span-3">
                <span className="text-ink">{entry.year}</span>
                <span className={entry.status === "active" ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
                <span className="normal-case tracking-normal text-ink-2">{entry.myRole}</span>
                {entry.stack.length > 0 && <span className="normal-case tracking-normal">{entry.stack.join(" · ")}</span>}
              </div>
              <div className="lg:col-span-7">
                <h2 className="font-display text-2xl font-medium text-ink">{entry.title}</h2>
                <p className="mt-3 text-lg text-ink-2">{entry.summary}</p>
                {entry.fallbackBody && <p className="mono-label mt-4 text-ink-3">{t("fallbackBody")}</p>}
                <div className="prose-lab mt-6">{rendered[i]}</div>
                {(entry.links.live || entry.links.repo) && (
                  <p className="mono-label mt-6 flex gap-6">
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
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
