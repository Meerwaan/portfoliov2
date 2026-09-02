import { getTranslations } from "next-intl/server";
import type { Metric } from "@/lib/content/schema";

/** Outcomes with their source. The schema refuses a metric without a source, so nothing here is decorative. */
export async function MetricsTable({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;
  const t = await getTranslations("work");
  return (
    <section className="container-page py-section">
      <h2 className="font-display text-2xl font-medium text-ink">{t("outcomes")}</h2>
      <dl className="mt-8 grid gap-x-8 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="border-t border-rule pt-4">
            <dt className="text-sm text-ink-2">{m.label}</dt>
            <dd className="mt-1 font-display text-3xl font-medium text-signal tabular">{m.value}</dd>
            <dd className="mono-label mt-3 text-ink-3">
              {t("source")} · {m.asOf}
            </dd>
            <dd className="mt-1 text-sm text-ink-3">{m.source}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
