"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollProgress } from "@/components/motion/ScrollProgress";

export type StackUse = { title: string; href: string | null; from: number; to: number | null };
export type StackItem = { id: string; name: string; since: number | null; uses: StackUse[] };
export type StackLayer = { id: string; label: string; items: StackItem[] };

/**
 * Four CSS-3D planes, one per layer of the stack, separating as the stage reaches the viewport centre (same
 * language as the home and the lab). Hovering, focusing or tapping a tool fills the readout on the left with the
 * projects where it was used; hovering a layer in the legend isolates its plane.
 */
export function StackLayersClient({ layers, hint, today }: { layers: StackLayer[]; hint: string; today: string }) {
  const t = useTranslations("about");
  const [active, setActive] = useState<string | null>(null);
  const [focusLayer, setFocusLayer] = useState<string | null>(null);
  const current = layers.flatMap((l) => l.items.map((item) => ({ item, layer: l }))).find(({ item }) => item.id === active) ?? null;
  const period = (u: StackUse) => (u.to === u.from ? String(u.from) : `${u.from} → ${u.to ?? today}`);

  return (
    <div className="container-page grid gap-10 pb-section lg:grid-cols-12 lg:items-start">
      <div className="flex flex-col gap-8 lg:col-span-4">
        <ol className="flex flex-col gap-1">
          {layers.map((layer, n) => (
            <li key={layer.id} onMouseEnter={() => setFocusLayer(layer.id)} onMouseLeave={() => setFocusLayer(null)} className="group flex items-baseline gap-3 py-1 text-ink-2">
              <span className="mono-label w-7 shrink-0 text-ink-3">L{n}</span>
              <span className="flex flex-col">
                <span className="text-sm text-ink transition-colors duration-(--dur-1) group-hover:text-signal">{layer.label}</span>
                <span className="mono-label text-ink-3">{t("stackLayerCount", { count: layer.items.length })}</span>
              </span>
            </li>
          ))}
        </ol>

        <div className="min-h-[14rem] border-t border-rule pt-5" aria-live="polite">
          {current ? (
            <>
              <p className="mono-label text-ink-3">{current.layer.label}</p>
              <p className="mt-1 font-display text-2xl font-medium text-ink">{current.item.name}</p>
              <p className="mono-label mt-1 text-ink-3">
                {current.item.since && <span>{t("stackSince", { year: current.item.since })} · </span>}
                {t("stackUses", { count: current.item.uses.length })}
              </p>
              <ul className="mt-4">
                {current.item.uses.map((u) => (
                  <li key={`${u.title}-${u.from}`} className="flex items-baseline justify-between gap-4 border-t border-rule py-2 text-sm">
                    {u.href ? (
                      <Link href={u.href} className="text-ink transition-colors duration-(--dur-1) hover:text-signal">
                        {u.title}
                      </Link>
                    ) : (
                      <span className="text-ink">{u.title}</span>
                    )}
                    <span className="mono-label shrink-0 text-ink-3">{period(u)}</span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="mono-label text-ink-3">{hint}</p>
          )}
        </div>
      </div>

      <div className="about-stack-stage lg:col-span-8" data-layers={layers.length}>
        <ScrollProgress start="top 85%" end="center 45%" />
        <div className="stack-scene">
          <div className="stack">
            {layers.map((layer, n) => (
              <div key={layer.id} className="stack-layer" data-layer={layer.id} data-dim={focusLayer && focusLayer !== layer.id ? "" : undefined} style={{ "--n": n } as React.CSSProperties}>
                <span className="stack-layer-tag">
                  L{n} · {layer.label}
                </span>
                <ul className="stack-grid about-stack-grid">
                  {layer.items.map((item) => (
                    <li key={item.id} className="min-w-0">
                      <button
                        type="button"
                        aria-pressed={active === item.id}
                        onMouseEnter={() => setActive(item.id)}
                        onFocus={() => setActive(item.id)}
                        onClick={() => setActive((cur) => (cur === item.id ? null : item.id))}
                        className={`stack-cell about-stack-cell ${active === item.id ? "is-lit" : ""}`}
                      >
                        <span className="font-mono text-mono text-ink">{item.name}</span>
                        <span className="text-xs text-ink-2">{item.since ? t("stackSince", { year: item.since }) : " "}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
