import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowDown } from "@phosphor-icons/react/ssr";
import type { LabEntry } from "@/lib/content/loader";
import { ActiveOnView } from "@/components/motion/ActiveOnView";

/**
 * The bench: every experiment as a small exploded object, the same CSS-3D language as the home.
 * Three layers per card: the capture (or a typographic plate), the real pipeline steps, the stack.
 * A card explodes on hover, focus, or when it is the one nearest the viewport centre (touch and keyboard).
 */
export async function LabBench({ entries, locale }: { entries: LabEntry[]; locale: "fr" | "en" }) {
  const t = await getTranslations("lab");
  return (
    <section className="lab-bench-grid container-page pb-section" data-track-root="bench" aria-label={t("benchLabel")}>
      <ActiveOnView selector="[data-track-root='bench'] [data-track]" />
      <ol className="grid gap-x-10 gap-y-16 md:grid-cols-2">
        {entries.map((entry, i) => {
          const shot = entry.screenshots[0];
          const steps = entry.steps?.[locale] ?? [];
          const n = String(i + 1).padStart(2, "0");
          return (
            <li key={entry.slug} data-track={entry.slug} className="bench-card">
              <a href={`#${entry.slug}`} className="bench-link group block" aria-label={`${entry.title}: ${t("readEntry")}`}>
                <div className="bench-stage">
                  <div className="bench-stack">
                    <div className="bench-layer bench-layer-shot" style={{ "--n": 0 } as React.CSSProperties}>
                      {shot ? (
                        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 48rem) 40vw, 90vw" placeholder={shot.blurDataURL ? "blur" : "empty"} blurDataURL={shot.blurDataURL} className="h-full w-full object-cover object-top" />
                      ) : (
                        <div className="bench-plate">
                          <span className="mono-label text-ink-3">LAB/{n}</span>
                          <span className="font-display text-2xl font-medium text-ink">{entry.title}</span>
                        </div>
                      )}
                    </div>
                    <div className="bench-layer" style={{ "--n": 1 } as React.CSSProperties}>
                      <span className="bench-tag">L1 · {t("steps")}</span>
                      <ol className="bench-steps">
                        {steps.map((s, k) => (
                          <li key={k}>
                            <span className="text-ink-3">{String(k + 1).padStart(2, "0")}</span> {s}
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="bench-layer" style={{ "--n": 2 } as React.CSSProperties}>
                      <span className="bench-tag">L2 · {t("stackLabel")}</span>
                      <ul className="bench-chips">
                        {entry.stack.map((s) => (
                          <li key={s}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex flex-col gap-2">
                  <p className="mono-label flex flex-wrap gap-x-4 text-ink-3">
                    <span className="bench-index text-ink">LAB/{n}</span>
                    <span>{entry.year}</span>
                    <span className={entry.status === "active" ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
                  </p>
                  <h2 className="font-display text-2xl font-medium text-ink group-hover:text-signal">{entry.title}</h2>
                  <p className="max-w-[46ch] text-ink-2">{entry.summary}</p>
                  <span className="mono-label mt-1 inline-flex items-center gap-1 text-ink-3 group-hover:text-signal">
                    {t("readEntry")} <ArrowDown size={12} />
                  </span>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
