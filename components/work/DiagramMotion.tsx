"use client";

import { useEffect, useRef } from "react";

/**
 * Draws the sibling [data-diagram] SVG stroke by stroke as the reader scrolls. GSAP + ScrollTrigger + DrawSVG are
 * imported on demand when the diagram is within one viewport, never on page load. Reduced motion: nothing runs
 * and the server-rendered SVG stays fully visible.
 */
export function DiagramMotion({ end, pin }: { end?: string; pin?: { selector: string; length: string } } = {}) {
  const anchor = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = anchor.current?.parentElement?.querySelector<HTMLElement>("[data-diagram]");
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup: (() => void) | undefined;
    let cancelled = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();
        void (async () => {
          const [{ default: gsap }, { ScrollTrigger }, { DrawSVGPlugin }] = await Promise.all([
            import("gsap"),
            import("gsap/ScrollTrigger"),
            import("gsap/DrawSVGPlugin"),
          ]);
          if (cancelled) return;
          gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);
          const desktop = window.matchMedia("(min-width: 48rem)").matches;
          const steps = Array.from(root.querySelectorAll<SVGGElement>("[data-step]"));
          if (steps.length === 0) return;
          // Pinned mode (desktop): the block stays on screen while the drawing plays over `pin.length` of scroll.
          const pinEl = pin && desktop ? root.closest<HTMLElement>(pin.selector) : null;
          const ctx = gsap.context(() => {
            const tl = gsap.timeline({
              scrollTrigger: pinEl
                ? { trigger: pinEl, pin: pinEl, anticipatePin: 1, start: "top 10%", end: `+=${pin!.length}`, scrub: 0.8 }
                : {
                    trigger: root,
                    start: "top 78%",
                    // Default: the drawing finishes as the diagram passes mid-screen. A tall diagram passes `end` so
                    // it is complete by the time it fills the viewport.
                    end: desktop ? (end ?? "bottom 45%") : "top 40%",
                    scrub: desktop ? 0.8 : false,
                  },
            });
            // Every step takes the same time whatever its number of strokes, so a dense step never lags.
            const STEP = 1.1;
            steps.forEach((step, i) => {
              const paths = step.querySelectorAll("[data-draw]");
              const labels = step.querySelectorAll("[data-label]");
              gsap.set(paths, { drawSVG: "0%" });
              gsap.set(labels, { autoAlpha: 0 });
              const t0 = i * STEP;
              // The step being drawn is exposed on the root so the page can follow it (year captions, highlights).
              tl.call(() => root.setAttribute("data-step", String(i + 1)), [], t0 + 0.01);
              tl.to(paths, { drawSVG: "100%", duration: 0.55, ease: "none", stagger: Math.min(0.15, 0.55 / Math.max(paths.length, 1)) }, t0);
              tl.to(labels, { autoAlpha: 1, duration: 0.3 }, t0 + 0.55);
            });
          }, root);
          cleanup = () => ctx.revert();
        })();
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(root);
    return () => {
      cancelled = true;
      io.disconnect();
      cleanup?.();
    };
  }, [end, pin]);

  return <span ref={anchor} hidden />;
}
