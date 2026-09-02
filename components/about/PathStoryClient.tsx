"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";

export type StoryItem = {
  id: string;
  from: string;
  to: string | null;
  kind: "founder" | "experience" | "education";
  org: string;
  place?: string;
  role: string;
  line: string;
  stack: string[];
  href?: string;
  proof:
    | { kind: "screen"; src: string; width: number; height: number; blurDataURL?: string; alt: string }
    | { kind: "diagram"; svg: string }
    | { kind: "none" };
};

/**
 * One step per screen. Desktop: the stage pins and scrolling advances through the steps; every step is in the
 * HTML, only the active one is visible. A rail of years on the left says where you are and jumps on click.
 * Mobile and reduced motion: the same steps stacked, no pin.
 */
export function PathStoryClient({ items, eyebrow }: { items: StoryItem[]; eyebrow: string }) {
  const t = useTranslations("about");
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<{ start: number; end: number } | null>(null);
  const [active, setActive] = useState(0);
  const [pinned, setPinned] = useState(false);

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
      setPinned(true);
      const st = ScrollTrigger.create({
        trigger: stage,
        pin: true,
        anticipatePin: 1,
        start: `top ${nav}px`,
        end: `+=${items.length * 90}%`,
        onUpdate: (self) => {
          triggerRef.current = { start: self.start, end: self.end };
          const idx = Math.min(items.length - 1, Math.floor(self.progress * items.length));
          setActive((cur) => (cur === idx ? cur : idx));
        },
        onRefresh: (self) => {
          triggerRef.current = { start: self.start, end: self.end };
        },
      });
      cleanup = () => {
        st.kill();
        setPinned(false);
      };
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [items.length]);

  function jump(i: number) {
    const tr = triggerRef.current;
    if (!tr) {
      document.getElementById(`step-${items[i].id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const y = tr.start + ((i + 0.5) / items.length) * (tr.end - tr.start);
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  return (
    <div ref={stageRef} className="path-story container-page" data-pinned={pinned ? "true" : undefined}>
      <div className="grid gap-10 lg:h-[calc(100svh-var(--spacing-nav))] lg:grid-cols-12 lg:items-center">
        <ol className="path-rail hidden lg:col-span-2 lg:flex lg:flex-col lg:gap-1" aria-label={eyebrow}>
          {items.map((s, i) => (
            <li key={s.id}>
              <button type="button" onClick={() => jump(i)} aria-current={i === active ? "step" : undefined} className={`path-rail-item mono-label flex w-full items-center gap-3 rounded-sm px-2 py-1.5 text-left transition-colors duration-(--dur-1) ${i === active ? "text-signal" : "text-ink-3 hover:text-ink"}`}>
                <span className="path-rail-tick" aria-hidden="true" />
                <span className="tabular">{s.to === null ? `${s.from} →` : s.from === s.to ? s.from : `${s.from}-${s.to}`}</span>
              </button>
            </li>
          ))}
        </ol>

        <div className="path-steps relative lg:col-span-10">
          {items.map((s, i) => {
            const range = s.to === null ? `${s.from} → ${t("today")}` : s.from === s.to ? s.from : `${s.from} → ${s.to}`;
            return (
              <article key={s.id} id={`step-${s.id}`} className="path-step-panel grid gap-8 lg:grid-cols-12 lg:items-center" data-active={i === active ? "true" : undefined} aria-hidden={pinned && i !== active ? true : undefined}>
                <div className="flex flex-col gap-4 lg:col-span-6">
                  <p className="path-year font-mono text-ink-3 tabular">{range}</p>
                  <p className="mono-label text-ink-3">{t(s.kind)}</p>
                  <h3 className="font-display text-3xl font-medium text-ink">{s.role}</h3>
                  <p className="text-lg text-ink-2">
                    {s.org}
                    {s.place ? `, ${s.place}` : ""}
                  </p>
                  <p className="max-w-[52ch] text-ink-2">{s.line}</p>
                  {s.stack.length > 0 && <p className="mono-label text-ink-3">{s.stack.join(" · ")}</p>}
                  {s.href && (
                    <Link href={s.href} className="mono-label inline-flex w-fit items-center gap-1 border-b border-rule-strong pb-0.5 text-ink hover:border-signal hover:text-signal">
                      {t("readCase")} <ArrowUpRight size={12} />
                    </Link>
                  )}
                </div>
                <div className="path-proof lg:col-span-6">
                  {s.proof.kind === "screen" && (
                    <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
                      <Image src={s.proof.src} alt={s.proof.alt} width={s.proof.width} height={s.proof.height} sizes="(min-width: 64rem) 45vw, 100vw" placeholder={s.proof.blurDataURL ? "blur" : "empty"} blurDataURL={s.proof.blurDataURL} className="h-auto w-full" />
                    </div>
                  )}
                  {s.proof.kind === "diagram" && (
                    <div className="path-diagram rounded-md border border-rule bg-paper-2 p-4 text-ink [&>svg]:h-auto [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: s.proof.svg }} />
                  )}
                  {s.proof.kind === "none" && (
                    <div className="path-plate flex aspect-[16/10] flex-col justify-between rounded-md border border-rule bg-paper-2 p-6">
                      <span className="mono-label text-ink-3">{s.org}</span>
                      <span className="font-mono text-ink-3 tabular" style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1 }}>
                        {s.from}
                      </span>
                      <span className="mono-label text-ink-3">{s.place}</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
