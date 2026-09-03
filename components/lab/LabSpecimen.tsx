import Image from "next/image";
import type { LabSpecimen as Specimen, Screenshot } from "@/lib/content/schema";
import type { Locale } from "@/lib/content/loader";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

export type LayerId = "surface" | "code" | "modules" | "services";
export type Layer = { id: LayerId; label: string; note: string };

export type SpecimenProps = {
  locale: Locale;
  layers: Layer[];
  shot: Screenshot | null;
  inset: Screenshot | null;
  specimen: Specimen | null;
  codeHtml: string | null;
};

/**
 * One experiment opened in section: the real capture (when there is one), a real code excerpt, the modules of the
 * repository and the services it calls, as CSS-3D planes that separate as the stage reaches the viewport centre.
 * Same language as the home's exploded stacks (.stack* classes); only --explode is driven here, by ScrollProgress.
 * Below lg and under reduced motion the same layers are laid flat, one under the other.
 */
export function LabSpecimen({ locale, layers, shot, inset, specimen, codeHtml }: SpecimenProps) {
  const index = (id: LayerId) => layers.findIndex((l) => l.id === id);
  const tag = (id: LayerId) => {
    const n = index(id);
    return `L${n} · ${layers[n]?.label ?? ""}`;
  };
  return (
    <div className="lab-stage" data-layers={layers.length}>
      <ScrollProgress start="top 88%" end="center 48%" />
      <div className="stack-scene">
        <div className="stack">
          {shot && (
            <div className="stack-layer stack-layer-ui" data-layer="surface" style={{ "--n": index("surface") } as React.CSSProperties}>
              <span className="stack-layer-tag">{tag("surface")}</span>
              <div className="stack-shot">
                <Image src={shot.src} alt={shot.alt} width={shot.width} height={shot.height} sizes="(min-width: 64rem) 50vw, 100vw" placeholder={shot.blurDataURL ? "blur" : "empty"} blurDataURL={shot.blurDataURL} className="h-auto w-full" />
              </div>
              {inset && (
                <div className="lab-inset">
                  <Image src={inset.src} alt={inset.alt} width={inset.width} height={inset.height} sizes="(min-width: 64rem) 12vw, 30vw" placeholder={inset.blurDataURL ? "blur" : "empty"} blurDataURL={inset.blurDataURL} />
                </div>
              )}
            </div>
          )}
          {specimen && codeHtml && (
            <div className="stack-layer lab-layer-code" data-layer="code" style={{ "--n": index("code") } as React.CSSProperties}>
              <span className="stack-layer-tag">{tag("code")}</span>
              <span className="lab-file">{specimen.surface.file}</span>
              <div className="lab-code" dangerouslySetInnerHTML={{ __html: codeHtml }} />
            </div>
          )}
          {specimen && (
            <div className="stack-layer" data-layer="modules" style={{ "--n": index("modules") } as React.CSSProperties}>
              <span className="stack-layer-tag">{tag("modules")}</span>
              <ul className="stack-grid">
                {specimen.modules.map((m) => (
                  <li key={m.name} className="stack-cell">
                    <span className="font-mono text-mono text-ink">{m.name}</span>
                    <span className="text-xs text-ink-2">{m.role[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {specimen && (
            <div className="stack-layer" data-layer="services" style={{ "--n": index("services") } as React.CSSProperties}>
              <span className="stack-layer-tag">{tag("services")}</span>
              <ul className="stack-grid stack-grid-infra">
                {specimen.services.map((s) => (
                  <li key={s.name} className="stack-cell">
                    <span className="font-mono text-mono text-ink">{s.name}</span>
                    <span className="text-xs text-ink-2">{s.role[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
