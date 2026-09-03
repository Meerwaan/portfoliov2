import { getTranslations } from "next-intl/server";
import { getStackDiagram, getStackMap, type Locale } from "@/lib/content/loader";
import { Diagram } from "@/components/work/Diagram";
import { StackMapFocus } from "./StackMapFocus";

/**
 * The stack drawn as an architecture diagram, one step per year: each tool appears at the year it was adopted,
 * in its layer, linked to the tools it extends. Same renderer and scroll drawing as the case-study diagrams.
 */
export async function StackMap({ locale }: { locale: Locale }) {
  const [map, svg, t] = await Promise.all([getStackMap(), getStackDiagram(locale), getTranslations("about")]);
  const count = map.nodes.length;
  const [, w, h] = /viewBox="0 0 (\d+) (\d+)"/.exec(svg) ?? [];
  const aspect = w && h ? Number(w) / Number(h) : 1.9;
  return (
    <div className="stack-map container-page pb-section">
      {/* Pinned on desktop while the drawing plays. The frame is as wide as the viewport height allows. */}
      <div className="stack-map-stage">
        <div className="stack-map-frame" style={{ "--aspect": aspect } as React.CSSProperties}>
          <Diagram svg={svg} label={t("stackDiagramLabel", { count })} pin={{ selector: ".stack-map-stage", length: "150%" }} className="stack-map-diagram" />
          <StackMapFocus />
          {/* Intertitle over the empty top-right of the plan: the year being drawn and its line of the story. */}
          <div className="stack-map-intertitle" aria-live="polite">
            {map.years.map((y, i) => (
              <p key={y.year} data-i={i + 1} className="stack-map-line">
                <span className="font-display text-3xl font-medium text-ink tabular">{y.year}</span>
                <span className="mono-label text-signal">{y.where[locale]}</span>
                <span className="text-base text-ink-2">{y.caption[locale]}</span>
              </p>
            ))}
          </div>
        </div>
        <p className="mono-label mt-1 text-ink-3">{t("stackLegend", { count })}</p>
      </div>
    </div>
  );
}
