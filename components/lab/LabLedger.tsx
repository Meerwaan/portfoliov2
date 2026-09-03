import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { getLabSpecimen, type LabEntry, type Locale } from "@/lib/content/loader";
import { highlightCode } from "@/lib/content/code";
import { renderMdx } from "@/lib/content/mdx";
import { LiveDot } from "@/components/system/LiveDot";
import { LabSpecimen, type Layer, type SpecimenProps } from "./LabSpecimen";

type Item = { entry: LabEntry; n: number; body: React.ReactNode; specimen: SpecimenProps };

/**
 * The ledger: every experiment as one entry, text on the left, the specimen opened in section on the right.
 * Grouped in two: the G2 family (same Telegram base) and the independent experiments.
 */
export async function LabLedger({ entries, locale }: { entries: LabEntry[]; locale: Locale }) {
  const t = await getTranslations("lab");
  const items: Item[] = await Promise.all(
    entries.map(async (entry, i) => {
      const [specimen, body] = await Promise.all([getLabSpecimen(entry.slug), renderMdx(entry.body)]);
      const shot = entry.screenshots.find((s) => s.frame !== "phone") ?? entry.screenshots[0] ?? null;
      const inset = entry.screenshots.find((s) => s.frame === "phone" && s !== shot) ?? null;
      const codeHtml = specimen ? await highlightCode(specimen.surface.code, specimen.surface.lang) : null;
      const layers: Layer[] = [];
      if (shot) layers.push({ id: "surface", label: t("layers.surface"), note: t("layerNotes.surface") });
      if (specimen) {
        layers.push({ id: "code", label: t("layers.code"), note: specimen.surface.title[locale] });
        layers.push({ id: "modules", label: t("layers.modules"), note: t("layerNotes.modules", { count: specimen.modules.length }) });
        layers.push({ id: "services", label: t("layers.services"), note: t("layerNotes.services", { count: specimen.services.length }) });
      }
      return { entry, n: i + 1, body, specimen: { locale, layers, shot, inset, specimen, codeHtml } };
    }),
  );
  const groups = [
    { key: "g2" as const, items: items.filter((i) => i.entry.slug.startsWith("g2")) },
    { key: "other" as const, items: items.filter((i) => !i.entry.slug.startsWith("g2")) },
  ].filter((g) => g.items.length > 0);

  return (
    <>
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`lab-group-${g.key}`} className="border-t border-rule-strong">
          <div className="container-page flex flex-col gap-4 py-12 md:py-16">
            <h2 id={`lab-group-${g.key}`} className="font-display text-2xl font-medium text-ink">
              {t(`groups.${g.key}.title`)}
            </h2>
            <p className="max-w-[56ch] text-lg text-ink-2">{t(`groups.${g.key}.intro`)}</p>
          </div>
          <ol>
            {g.items.map(({ entry, n, body, specimen }) => {
              const live = entry.status === "active";
              const id = `lab-${entry.slug}`;
              return (
                <li key={entry.slug} id={entry.slug} className="lab-entry scroll-mt-24 border-t border-rule">
                  <article aria-labelledby={id} className="container-page grid gap-y-8 py-14 md:py-20 lg:grid-cols-12 lg:gap-x-10">
                    <header className="flex min-w-0 flex-col gap-4 lg:col-span-4 lg:row-start-1">
                      <p className="mono-label flex flex-wrap gap-x-4 text-ink-3">
                        <span className="text-ink">LAB/{String(n).padStart(2, "0")}</span>
                        <span>{entry.year}</span>
                        <span className="inline-flex items-center gap-2">
                          {live && <LiveDot state="live" />}
                          <span className={live ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
                        </span>
                      </p>
                      <h3 id={id} className="font-display text-3xl font-medium text-ink">
                        {entry.title}
                      </h3>
                      <p className="text-lg text-ink-2">{entry.summary}</p>
                    </header>

                    <div className="min-w-0 lg:col-span-8 lg:col-start-5 lg:row-span-2 lg:row-start-1">
                      <LabSpecimen {...specimen} />
                    </div>

                    <div className="flex min-w-0 flex-col gap-6 lg:col-span-4 lg:col-start-1 lg:row-start-2">
                      {specimen.layers.length > 0 && (
                        <div className="flex flex-col gap-2">
                          <ol className="lab-legend flex flex-col gap-1">
                            {specimen.layers.map((l, k) => (
                              <li key={l.id} data-layer={l.id} className="group flex items-baseline gap-3 py-1">
                                <span className="mono-label w-7 shrink-0 text-ink-3">L{k}</span>
                                <span className="flex min-w-0 flex-col">
                                  <span className="text-sm text-ink transition-colors duration-(--dur-1) group-hover:text-signal">{l.label}</span>
                                  <span className="truncate text-xs text-ink-3">{l.note}</span>
                                </span>
                              </li>
                            ))}
                          </ol>
                          <p className="mono-label hidden text-ink-3 lg:block">{t("layerHint")}</p>
                        </div>
                      )}
                      <p className="mono-label text-ink-3">{entry.myRole}</p>
                      {entry.fallbackBody && <p className="mono-label text-ink-3">{t("fallbackBody")}</p>}
                      <div className="prose-lab min-w-0">{body}</div>
                      {entry.stack.length > 0 && <p className="font-mono text-mono text-ink-3">{entry.stack.join(", ")}</p>}
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
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </>
  );
}
