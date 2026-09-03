import { getTranslations } from "next-intl/server";
import type { LabEntry } from "@/lib/content/loader";

/** The index of the ledger: eight experiments, their status and year, each a jump to its entry. */
export async function LabIndex({ entries }: { entries: LabEntry[] }) {
  const t = await getTranslations("lab");
  return (
    <nav aria-label={t("indexLabel")} className="container-page pb-section">
      <ol className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {entries.map((entry, i) => {
          const live = entry.status === "active";
          return (
            <li key={entry.slug}>
              <a href={`#${entry.slug}`} className="group flex flex-col gap-1.5 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-signal">
                <span className="mono-label text-ink-3">LAB/{String(i + 1).padStart(2, "0")}</span>
                <span className="font-display text-lg font-medium text-ink transition-colors duration-(--dur-1) group-hover:text-signal">{entry.title}</span>
                <span className="mono-label text-ink-3">
                  <span className={live ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span> · {entry.year}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
