"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export type TraceUse = { title: string; href: string | null; a: number; b: number; ongoing: boolean; from: number; to: number | null };
export type TraceTool = { id: string; name: string; uses: TraceUse[]; since: number | null };
export type TraceGroup = { id: string; label: string; tools: TraceTool[] };
export type TraceSource = { title: string; href: string | null; a: number; b: number; ongoing: boolean };

type Props = {
  groups: TraceGroup[];
  years: { year: number; x: number }[];
  start: number;
  end: number;
  todayX: number;
  sources: TraceSource[];
  labels: { hint: string; projects: string; today: string };
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/**
 * The stack read over time. A playhead sweeps the year axis once when the section comes into view (GSAP, loaded
 * on demand) and lights each tool as its first project starts; afterwards the pointer drives it. The panel on the
 * left reads the year under the head (tools in service, projects running) or, while a row is hovered, that tool.
 * Reduced motion: no sweep, the head starts today.
 */
export function StackTraceClient({ groups, years, start, end, todayX, sources, labels }: Props) {
  const t = useTranslations("about");
  const [x, setX] = useState(todayX);
  const [hovered, setHovered] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const proxy = useRef({ x: todayX });
  const tween = useRef<{ kill: () => void } | null>(null);
  const gsapRef = useRef<typeof import("gsap")["default"] | null>(null);
  const swept = useRef(false);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting) || swept.current) return;
        swept.current = true;
        io.disconnect();
        void import("gsap").then(({ default: gsap }) => {
          gsapRef.current = gsap;
          proxy.current.x = 0;
          setX(0);
          tween.current = gsap.to(proxy.current, { x: todayX, duration: 3.4, ease: "power2.inOut", onUpdate: () => setX(proxy.current.x) });
        });
      },
      { threshold: 0.15 },
    );
    io.observe(root);
    return () => {
      io.disconnect();
      tween.current?.kill();
    };
  }, [todayX]);

  const moveTo = (target: number, animate: boolean) => {
    tween.current?.kill();
    const gsap = gsapRef.current;
    if (animate && gsap) {
      tween.current = gsap.to(proxy.current, { x: target, duration: 0.7, ease: "power2.out", onUpdate: () => setX(proxy.current.x) });
    } else {
      proxy.current.x = target;
      setX(target);
    }
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const rect = trackRef.current?.getBoundingClientRect();
    // Only the axis drives the head: hovering the names column leaves the year where it is.
    if (!rect || e.clientX < rect.left) return;
    moveTo(clamp01((e.clientX - rect.left) / rect.width), false);
  };

  const yearAt = Math.min(Math.floor(start + x * (end - start)), years[years.length - 1]?.year ?? start);
  // A period still running is live from its start onward; a closed one only between its bounds.
  const live = (u: { a: number; b: number; ongoing: boolean }) => u.a <= x && (u.ongoing || x <= u.b + 1e-6);
  const tools = groups.flatMap((g) => g.tools.map((tool) => ({ tool, group: g })));
  const liveTools = tools.filter(({ tool }) => tool.uses.some(live)).length;
  const running = sources.filter(live);
  const focus = hovered ? tools.find(({ tool }) => tool.id === hovered) ?? null : null;
  const period = (u: TraceUse) => (u.to === null ? `${u.from} → ${labels.today}` : u.to === u.from ? String(u.from) : `${u.from}-${u.to}`);

  return (
    <div ref={rootRef} className="container-page grid gap-10 pb-section lg:grid-cols-12 lg:items-start">
      <div className="flex flex-col gap-5 lg:sticky lg:top-24 lg:col-span-4" aria-live="polite">
        {focus ? (
          <>
            <p className="mono-label text-ink-3">{focus.group.label}</p>
            <p className="trace-year-big font-display font-medium text-ink">{focus.tool.name}</p>
            <p className="mono-label text-signal">
              {focus.tool.since !== null && `${t("stackSince", { year: focus.tool.since })} · `}
              {t("stackUses", { count: focus.tool.uses.length })}
            </p>
            <ul className="border-t border-rule">
              {focus.tool.uses.map((u, i) => (
                <li key={`${u.title}-${i}`} className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5 text-sm">
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
          <>
            <p className="trace-year-big font-display font-medium text-ink tabular">{yearAt}</p>
            <p className="mono-label text-signal">{t("stackLive", { count: liveTools })}</p>
            <div className="border-t border-rule pt-4">
              <p className="mono-label text-ink-3">{labels.projects}</p>
              <ul className="mt-1">
                {running.length === 0 && <li className="py-2.5 text-sm text-ink-3">{t("stackNone")}</li>}
                {running.map((s) => (
                  <li key={s.title} className="flex items-baseline justify-between gap-4 border-b border-rule py-2.5 text-sm last:border-b-0">
                    {s.href ? (
                      <Link href={s.href} className="text-ink transition-colors duration-(--dur-1) hover:text-signal">
                        {s.title}
                      </Link>
                    ) : (
                      <span className="text-ink">{s.title}</span>
                    )}
                    {s.ongoing && <span className="mono-label shrink-0 text-ink-3">{labels.today}</span>}
                  </li>
                ))}
              </ul>
            </div>
            <p className="mono-label text-ink-3">{labels.hint}</p>
          </>
        )}
      </div>

      <div className="trace lg:col-span-8" style={{ "--t": x } as React.CSSProperties} onPointerMove={onPointerMove} onPointerLeave={() => moveTo(todayX, true)}>
        <div className="trace-axis">
          <span />
          <div ref={trackRef} className="trace-grid trace-axis-track">
            {years.map((y) => (
              <span key={y.year} className="trace-tick mono-label text-ink-3" style={{ left: `${y.x * 100}%` }}>
                {y.year}
              </span>
            ))}
            <span className="trace-head-tag mono-label">{yearAt}</span>
          </div>
        </div>
        <div className="trace-body">
          <div className="trace-axis trace-lines" aria-hidden="true">
            <span />
            <div className="trace-grid">
              <span className="trace-head" />
            </div>
          </div>
          {groups.map((g) => (
            <section key={g.id} className="trace-group" aria-label={g.label}>
              <p className="trace-group-label mono-label text-ink-3">{g.label}</p>
              {g.tools.map((tool) => {
                const isLive = tool.uses.some(live);
                const isPast = !isLive && tool.uses.some((u) => u.b < x);
                return (
                  <div
                    key={tool.id}
                    className="trace-row"
                    data-live={isLive || undefined}
                    data-past={isPast || undefined}
                    data-hover={hovered === tool.id || undefined}
                    style={{ "--n": tool.uses.length } as React.CSSProperties}
                    tabIndex={0}
                    onMouseEnter={() => setHovered(tool.id)}
                    onMouseLeave={() => setHovered(null)}
                    onFocus={() => setHovered(tool.id)}
                    onBlur={() => setHovered(null)}
                  >
                    <span className="trace-name font-display">{tool.name}</span>
                    <div className="trace-track">
                      {tool.uses.map((u, i) => (
                        <span key={`${u.title}-${i}`} className="trace-bar" data-live={live(u) || undefined} style={{ "--a": u.a, "--b": u.b, "--i": i } as React.CSSProperties} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
