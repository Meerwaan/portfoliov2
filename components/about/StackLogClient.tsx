"use client";

import { useEffect, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";

export type LogUse = { title: string; href: string | null; from: number; to: number | null };
export type LogTool = { name: string; layer: string; layerLabel: string; year: number; core: boolean; uses: LogUse[] };
export type LogRelease = { year: number; where: string; caption: string; groups: { id: string; label: string; tools: string[] }[] };
type Labels = { version: string; installed: string; inService: string; hint: string; since: string; today: string; latest: string };

/**
 * The changelog itself. The release nearest the reading line is the current version: the sticky panel shows it
 * with the number of tools installed so far. Hovering or focusing a tool replaces the panel's readout with where
 * that tool served. Releases reveal their tools with a short stagger the first time they come into view.
 */
export function StackLogClient({ releases, tools, labels }: { releases: LogRelease[]; tools: LogTool[]; labels: Labels }) {
  const listRef = useRef<HTMLOListElement>(null);
  const [current, setCurrent] = useState(releases[releases.length - 1]?.year ?? 0);
  const [hovered, setHovered] = useState<string | null>(null);

  useEffect(() => {
    const items = Array.from(listRef.current?.querySelectorAll<HTMLElement>("[data-release]") ?? []);
    if (items.length === 0) return;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const line = window.innerHeight * 0.42;
      const atBottom = window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8;
      let best: HTMLElement | null = null;
      for (const el of items) if (el.getBoundingClientRect().top <= line) best = el;
      // The last release sits just above the footer and may never reach the reading line: the page end counts.
      const y = Number((atBottom ? items[items.length - 1] : (best ?? items[0])).dataset.release);
      setCurrent((cur) => (cur === y ? cur : y));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(pick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) (e.target as HTMLElement).setAttribute("data-seen", "");
        if (!raf) raf = requestAnimationFrame(pick);
      },
      { threshold: [0, 0.2, 0.5, 0.8, 1] },
    );
    items.forEach((el) => io.observe(el));
    pick();
    return () => {
      io.disconnect();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  const release = releases.find((r) => r.year === current) ?? releases[0];
  const installed = tools.filter((t) => t.year <= current).length;
  const inService = tools.filter((t) => t.core).length;
  const focus = hovered ? tools.find((t) => t.name === hovered) ?? null : null;
  const period = (u: LogUse) => (u.to === null ? `${u.from} → ${labels.today}` : u.to === u.from ? String(u.from) : `${u.from}-${u.to}`);
  const latestYear = releases[releases.length - 1]?.year;

  return (
    <div className="stack-log container-page grid gap-10 pb-section lg:grid-cols-12 lg:items-start">
      <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:col-span-4" aria-live="polite">
        <p className="mono-label text-ink-3">{labels.version}</p>
        <p className="stack-log-version font-display font-medium text-ink tabular">
          v{release.year}
          {release.year === latestYear && <span className="stack-log-latest mono-label">{labels.latest}</span>}
        </p>
        <p className="mono-label text-signal">{release.where}</p>
        <p className="mono-label text-ink-3">
          {installed} {labels.installed} · {inService} {labels.inService}
        </p>
        <div className="min-h-[9rem] border-t border-rule pt-4">
          {focus ? (
            <>
              <p className="mono-label text-ink-3">{focus.layerLabel}</p>
              <p className="mt-1 font-display text-2xl font-medium text-ink">{focus.name}</p>
              <p className="mono-label mt-1 text-ink-3">
                {labels.since} {focus.year}
                {focus.core && <span className="text-signal"> · {labels.inService}</span>}
              </p>
              {focus.uses.length > 0 && (
                <ul className="mt-3">
                  {focus.uses.map((u, i) => (
                    <li key={`${u.title}-${i}`} className="flex items-baseline justify-between gap-4 border-t border-rule py-2 text-sm">
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
              )}
            </>
          ) : (
            <p className="mono-label text-ink-3">{labels.hint}</p>
          )}
        </div>
      </aside>

      <ol ref={listRef} className="lg:col-span-8">
        {releases.map((r) => (
          <li key={r.year} data-release={r.year} data-current={r.year === current || undefined} className="stack-log-release border-t border-rule py-8 md:py-10">
            <div className="grid gap-6 md:grid-cols-[7rem_minmax(0,1fr)]">
              <div className="flex flex-col gap-1">
                <span className="stack-log-year font-display text-2xl font-medium">v{r.year}</span>
                <span className="mono-label text-ink-3">{r.where}</span>
              </div>
              <div className="flex min-w-0 flex-col gap-5">
                <p className="max-w-[56ch] text-lg text-ink-2">{r.caption}</p>
                <dl className="flex flex-col gap-2.5">
                  {r.groups.map((g) => (
                    <div key={g.id} className="grid gap-x-4 gap-y-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
                      <dt className="mono-label pt-1.5 text-ink-3">{g.label}</dt>
                      <dd className="flex flex-wrap gap-1.5">
                        {g.tools.map((name, i) => {
                          const tool = tools.find((t) => t.name === name);
                          return (
                            <button
                              key={name}
                              type="button"
                              className="stack-log-chip"
                              data-core={tool?.core || undefined}
                              style={{ "--i": i } as React.CSSProperties}
                              onMouseEnter={() => setHovered(name)}
                              onMouseLeave={() => setHovered(null)}
                              onFocus={() => setHovered(name)}
                              onBlur={() => setHovered(null)}
                              onClick={() => setHovered((cur) => (cur === name ? null : name))}
                              aria-pressed={hovered === name}
                            >
                              <span aria-hidden="true" className="stack-log-plus">
                                +
                              </span>
                              {name}
                            </button>
                          );
                        })}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
