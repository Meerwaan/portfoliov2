import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LabEntry } from "@/lib/content/loader";
import { LiveDot } from "@/components/system/LiveDot";

/**
 * Cards laid flat on the desk in a light perspective; hover, focus or tap lifts a card to face the reader.
 * One real capture per experiment (or a typographic plate), one mono status line. Nothing else.
 */
export async function LabCards({ entries }: { entries: LabEntry[] }) {
  const t = await getTranslations("lab");
  return (
    <section className="container-page pb-section" aria-label={t("benchLabel")}>
      <ol className="lab-cards grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {entries.map((entry, i) => {
          const shot = entry.screenshots[0];
          const n = String(i + 1).padStart(2, "0");
          const live = entry.status === "active";
          return (
            <li key={entry.slug} className="lab-card">
              <a href={`#${entry.slug}`} className="group block outline-none" aria-label={`${entry.title}: ${t("readEntry")}`}>
                <div className="lab-card-stage">
                  <div className="lab-card-stack">
                    <div className="lab-card-shadow" aria-hidden="true" />
                    <div className="lab-card-face">
                      {shot ? (
                        <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 64rem) 28vw, (min-width: 40rem) 45vw, 90vw" placeholder={shot.blurDataURL ? "blur" : "empty"} blurDataURL={shot.blurDataURL} className="h-full w-full object-cover object-top" />
                      ) : (
                        <div className="lab-card-plate">
                          <span className="mono-label text-ink-3">LAB/{n}</span>
                          <span className="font-display text-xl font-medium text-ink">{entry.title}</span>
                          <span className="mono-label text-ink-3">{entry.stack.slice(0, 3).join(" · ")}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-5 flex flex-col gap-1.5">
                  <p className="mono-label flex items-center gap-3 text-ink-3">
                    <span className="text-ink">LAB/{n}</span>
                    <span className="inline-flex items-center gap-2">
                      {live && <LiveDot state="live" />}
                      <span className={live ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
                    </span>
                    <span>{entry.year}</span>
                  </p>
                  <h2 className="font-display text-xl font-medium text-ink transition-colors duration-(--dur-1) group-hover:text-signal">{entry.title}</h2>
                  <p className="text-sm text-ink-2">{entry.summary}</p>
                </div>
              </a>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
