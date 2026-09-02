"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import type { LayersData } from "@/lib/content/schema";

type Cell = LayersData["layers"][number]["cells"][number];
function text(v: string | { fr: string; en: string } | undefined, locale: Locale): string {
  if (!v) return "";
  return typeof v === "string" ? v : v[locale];
}

/**
 * Generic exploded view: the same CSS-3D stack as the home, without an image. The top layer's cells are the
 * hotspots; hovering or focusing one lights the linked cells on the layers below and prints the chain.
 * Desktop: GSAP scrubs --explode on scroll (pinned). Below lg / reduced motion: flat, already exploded.
 */
export function ExplodedLayers({ data, locale, eyebrow }: { data: LayersData; locale: Locale; eyebrow: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [focusLayer, setFocusLayer] = useState<string | null>(null);
  const [layer, setLayer] = useState<string>(data.layers[0].id);
  const uid = useId();
  const top = data.layers[0];
  const hot = active ? top.cells.find((c) => c.id === active) : null;
  const lit = new Set(hot?.links ?? []);
  const litByLayer = data.layers.slice(1).map((l) => ({ layer: l, cells: l.cells.filter((c) => lit.has(c.id)) }));

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(min-width: 64rem)").matches) return;
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const header = document.querySelector<HTMLElement>("body > header");
      const nav = header ? header.offsetHeight : 0;
      const ids = data.layers.map((l) => l.id);
      const ctx = gsap.context(() => {
        gsap.set(stage, { "--explode": 0, "--tilt": 62, "--spin": -32 });
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: stage,
            pin: true,
            anticipatePin: 1,
            start: `top ${nav}px`,
            end: "+=160%",
            scrub: 0.8,
            onUpdate: (self) => {
              const idx = Math.min(ids.length - 1, Math.floor(self.progress * ids.length * 1.15));
              setLayer((cur) => (cur === ids[idx] ? cur : ids[idx]));
            },
          },
        });
        tl.to(stage, { "--explode": 1, "--tilt": 54, "--spin": -24, duration: 0.7, ease: "power2.out" }, 0);
        tl.to({}, { duration: 0.3 }, 0.7);
      }, stage);
      cleanup = () => ctx.revert();
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [data.layers]);

  const cellNode = (c: Cell, isTop: boolean) => {
    const body = (
      <>
        <span className="font-mono text-mono text-ink">{text(c.title, locale)}</span>
        {c.sub && <span className="text-xs text-ink-2">{text(c.sub, locale)}</span>}
      </>
    );
    if (isTop) {
      return (
        <button
          type="button"
          className={`stack-cell stack-cell-hot ${active === c.id ? "is-active" : ""}`}
          aria-pressed={active === c.id}
          onMouseEnter={() => setActive(c.id)}
          onMouseLeave={() => setActive(null)}
          onFocus={() => setActive(c.id)}
          onBlur={() => setActive(null)}
          onClick={() => setActive((cur) => (cur === c.id ? null : c.id))}
        >
          {body}
          <span className="stack-thread" aria-hidden="true" />
        </button>
      );
    }
    const cls = `stack-cell ${lit.has(c.id) ? "is-lit" : ""}`;
    return c.href ? (
      <Link href={c.href} className={`${cls} stack-cell-link`}>
        {body}
      </Link>
    ) : (
      <span className={cls}>{body}</span>
    );
  };

  return (
    <div ref={stageRef} className="stack-stage container-page grid gap-8 py-10 lg:h-[calc(100svh-var(--spacing-nav))] lg:grid-cols-12 lg:items-center lg:py-0" data-focus-layer={focusLayer ?? undefined} aria-labelledby={`${uid}-title`}>
      <div className="flex flex-col gap-6 lg:col-span-3">
        <p id={`${uid}-title`} className="mono-label text-ink-3">
          {eyebrow}
        </p>
        <ol className="stack-legend flex flex-col gap-2">
          {data.layers.map((l, n) => (
            <li key={l.id}>
              <button
                type="button"
                onMouseEnter={() => setFocusLayer(l.id)}
                onMouseLeave={() => setFocusLayer(null)}
                onFocus={() => setFocusLayer(l.id)}
                onBlur={() => setFocusLayer(null)}
                aria-pressed={layer === l.id}
                className={`flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-(--dur-1) ${layer === l.id ? "text-signal" : "text-ink-2 hover:text-ink"}`}
              >
                <span className="mono-label w-8 shrink-0">L{n}</span>
                <span className="flex flex-col">
                  <span className="text-sm">{l.label[locale]}</span>
                  <span className="mono-label text-ink-3">{l.cells.length}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <div className="min-h-[9rem]" aria-live="polite">
          <p className="mono-label text-ink-3">{hot ? `${text(hot.title, locale)} · ${text(hot.sub, locale)}` : data.hint[locale]}</p>
          {hot && (
            <ul className="mt-2 flex flex-col gap-1 text-sm">
              {litByLayer.map(({ layer: l, cells }) =>
                cells.length ? (
                  <li key={l.id} className="flex gap-2">
                    <span className="mono-label w-16 shrink-0 text-ink-3">{l.label[locale]}</span>
                    <span className="text-signal">{cells.map((c) => text(c.title, locale)).join(" · ")}</span>
                  </li>
                ) : null,
              )}
            </ul>
          )}
        </div>
      </div>

      <div className="stack-scene lg:col-span-9">
        <div className="stack">
          {data.layers.map((l, n) => (
            <div key={l.id} className={`stack-layer ${n === 0 ? "stack-layer-top" : ""}`} data-layer={l.id} style={{ "--n": n } as React.CSSProperties}>
              <span className="stack-layer-tag">
                L{n} · {l.label[locale]}
              </span>
              <ul className={`stack-grid ${n === 0 ? "stack-grid-top" : l.cells.length > 12 ? "stack-grid-dense" : ""}`}>
                {l.cells.map((c) => (
                  <li key={c.id} className="contents">
                    {cellNode(c, n === 0)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
