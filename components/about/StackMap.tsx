import { getTranslations } from "next-intl/server";
import { getStackDiagram, getStackMap, type Locale } from "@/lib/content/loader";
import { Diagram } from "@/components/work/Diagram";

/**
 * The stack drawn as an architecture diagram, one step per year: each tool appears at the year it was adopted,
 * in its layer, linked to the tools it extends. Same renderer and scroll drawing as the case-study diagrams.
 * Below, one line per year says what that year added and why.
 */
export async function StackMap({ locale }: { locale: Locale }) {
  const [map, svg, t] = await Promise.all([getStackMap(), getStackDiagram(locale), getTranslations("about")]);
  const count = map.nodes.length;
  return (
    <div className="container-page pb-section">
      <Diagram svg={svg} label={t("stackDiagramLabel", { count })} end="bottom 92%" />
      <p className="mono-label mt-2 text-ink-3">{t("stackLegend", { count })}</p>
      <ol className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
        {map.years.map((y) => (
          <li key={y.year} className="flex flex-col gap-1.5 border-t border-rule pt-3">
            <span className="mono-label text-ink">{y.year}</span>
            <span className="text-sm text-ink-2">{y.caption[locale]}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
