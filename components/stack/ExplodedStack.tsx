"use client";

import Image from "next/image";
import { ViewTransition, useEffect, useId, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { LiveDot } from "@/components/system/LiveDot";
import type { Locale } from "@/i18n/routing";
import { LAYERS, type LayerId, type StackItem } from "./types";

/**
 * One product, exploded. Desktop: a pinned stage where four CSS-3D planes separate as the reader scrolls
 * (GSAP ScrollTrigger scrubs the --explode custom property; everything else is CSS). Hovering or focusing a
 * hotspot on the real interface lights the routes and the fields it touches. Mobile and reduced motion:
 * the same layers, flat and already exploded.
 */
export function ExplodedStack({ item, locale }: { item: StackItem; locale: Locale }) {
  const t = useTranslations("stack");
  const tStatus = useTranslations("work.status");
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<string | null>(null);
  const [focusLayer, setFocusLayer] = useState<LayerId | null>(null);
  const [layer, setLayer] = useState<LayerId>("ui");
  const uid = useId();
  const { stack } = item;

  const hot = active ? stack.hotspots.find((h) => h.id === active) : null;
  const litRoutes = new Set(hot?.routes ?? []);
  const litFields = new Set(hot?.fields ?? []);
  const litModels = new Set([...litFields].map((f) => f.split(".")[0]));

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
              const p = self.progress;
              const next: LayerId = p < 0.18 ? "ui" : p < 0.4 ? "routes" : p < 0.62 ? "models" : "infra";
              setLayer((cur) => (cur === next ? cur : next));
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
  }, []);

  const live = item.status === "production";
  const legend = (
    <ol className="stack-legend flex flex-col gap-2">
      {LAYERS.map((id, n) => {
        const count = id === "ui" ? stack.hotspots.length : id === "routes" ? stack.totals.routes : id === "models" ? stack.totals.models : stack.infra.length;
        const current = layer === id;
        return (
          <li key={id}>
            <button
              type="button"
              onMouseEnter={() => setFocusLayer(id)}
              onMouseLeave={() => setFocusLayer(null)}
              onFocus={() => setFocusLayer(id)}
              onBlur={() => setFocusLayer(null)}
              aria-pressed={current}
              className={`flex w-full items-baseline gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-(--dur-1) ${current ? "text-signal" : "text-ink-2 hover:text-ink"}`}
            >
              <span className="mono-label w-8 shrink-0">L{n}</span>
              <span className="flex flex-col">
                <span className="text-sm">{t(`layers.${id}`)}</span>
                <span className="mono-label text-ink-3">{t(`counts.${id}`, { count })}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );

  return (
    <article className="border-t border-rule" aria-labelledby={`${uid}-title`}>
      <div ref={stageRef} className="stack-stage container-page grid gap-8 py-10 lg:h-[calc(100svh-var(--spacing-nav))] lg:grid-cols-12 lg:items-center lg:py-0" data-focus-layer={focusLayer ?? undefined}>
        <div className="flex flex-col gap-6 lg:col-span-3">
          <div className="flex flex-col gap-2">
            <span className="mono-label text-ink-3">{item.node}</span>
            <h3 id={`${uid}-title`} className="font-display text-2xl font-medium text-ink">
              {item.title}
            </h3>
            <p className="text-ink-2">{item.oneLiner}</p>
            <span className="mono-label inline-flex items-center gap-2 text-ink-2">
              {live && <LiveDot state="live" />}
              <span className={live ? "text-signal" : undefined}>{tStatus(item.status)}</span>
            </span>
          </div>
          {legend}
          <div className="min-h-[7rem]" aria-live="polite">
            <p className="mono-label text-ink-3">{hot ? hot.label[locale] : t("hint")}</p>
            {hot && (
              <ul className="mt-2 flex flex-col gap-0.5 font-mono text-mono text-ink-2">
                {hot.routes.map((id) => {
                  const r = stack.routes.find((x) => x.id === id);
                  return r ? (
                    <li key={id} className="truncate">
                      <span className="text-ink-3">{r.method}</span> {r.path}
                    </li>
                  ) : null;
                })}
                {hot.fields.map((f) => (
                  <li key={f} className="truncate text-signal">
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <Link href={`/work/${item.slug}`} className="group inline-flex w-fit items-center gap-1 border-b border-rule-strong pb-0.5 text-ink transition-colors duration-(--dur-2) hover:border-signal hover:text-signal">
            {t("open")}
            <ArrowRight size={16} className="transition-transform duration-(--dur-2) ease-(--ease-out) group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="stack-scene lg:col-span-9">
          <div className="stack">
            {/* L0: the real interface, with hotspots */}
            <div className="stack-layer stack-layer-ui" data-layer="ui" style={{ "--n": 0 } as React.CSSProperties}>
              <span className="stack-layer-tag">L0 · {t("layers.ui")}</span>
              <ViewTransition name={`screen-${item.slug}`} share="screen" default="none">
                <div className="stack-shot">
                  <Image src={item.ui.src} alt={item.ui.alt} width={item.ui.width} height={item.ui.height} sizes="(min-width: 64rem) 60vw, 100vw" placeholder={item.ui.blurDataURL ? "blur" : "empty"} blurDataURL={item.ui.blurDataURL} className="h-auto w-full" />
                </div>
              </ViewTransition>
              {stack.hotspots.map((h) => (
                <button
                  key={h.id}
                  type="button"
                  className={`stack-hotspot ${active === h.id ? "is-active" : ""}`}
                  style={{ left: `${h.x}%`, top: `${h.y}%`, width: `${h.w}%`, height: `${h.h}%` }}
                  aria-label={h.label[locale]}
                  aria-pressed={active === h.id}
                  onMouseEnter={() => setActive(h.id)}
                  onMouseLeave={() => setActive(null)}
                  onFocus={() => setActive(h.id)}
                  onBlur={() => setActive(null)}
                  onClick={() => setActive((cur) => (cur === h.id ? null : h.id))}
                >
                  <span className="stack-thread" aria-hidden="true" />
                </button>
              ))}
            </div>

            {/* L1: routes and actions */}
            <div className="stack-layer" data-layer="routes" style={{ "--n": 1 } as React.CSSProperties}>
              <span className="stack-layer-tag">L1 · {t("layers.routes")}</span>
              <ul className="stack-grid">
                {stack.routes.map((r) => (
                  <li key={r.id} className={`stack-cell ${litRoutes.has(r.id) ? "is-lit" : ""}`}>
                    <span className="mono-label text-ink-3">{r.method}</span>
                    <span className="font-mono text-mono text-ink">{r.path}</span>
                    <span className="text-xs text-ink-2">{r.note[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* L2: data model */}
            <div className="stack-layer" data-layer="models" style={{ "--n": 2 } as React.CSSProperties}>
              <span className="stack-layer-tag">L2 · {t("layers.models")}</span>
              <ul className="stack-grid stack-grid-models">
                {stack.models.map((m) => (
                  <li key={m.name} className={`stack-cell ${litModels.has(m.name) ? "is-lit" : ""}`}>
                    <span className="font-mono text-mono font-bold text-ink">{m.name}</span>
                    <span className="stack-fields">
                      {m.fields.map((f) => (
                        <span key={f} className={litFields.has(`${m.name}.${f}`) ? "is-lit" : undefined}>
                          {f}
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* L3: infrastructure */}
            <div className="stack-layer" data-layer="infra" style={{ "--n": 3 } as React.CSSProperties}>
              <span className="stack-layer-tag">L3 · {t("layers.infra")}</span>
              <ul className="stack-grid stack-grid-infra">
                {stack.infra.map((i) => (
                  <li key={i.name} className="stack-cell">
                    <span className="font-mono text-mono text-ink">{i.name}</span>
                    <span className="text-xs text-ink-2">{i.role[locale]}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
