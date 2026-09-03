"use client";

import { useEffect, useRef } from "react";

/**
 * Draws the sibling [data-diagram] SVG stroke by stroke as the reader scrolls. GSAP + ScrollTrigger + DrawSVG are
 * imported on demand when the diagram is within one viewport, never on page load. Reduced motion: nothing runs
 * and the server-rendered SVG stays fully visible.
 */
export function DiagramMotion({ end }: { end?: string } = {}) {
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
          const ctx = gsap.context(() => {
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: root,
                start: "top 78%",
                // Default: the drawing finishes as the diagram passes mid-screen. A tall diagram passes `end` so
                // it is complete by the time it fills the viewport.
                end: desktop ? (end ?? "bottom 45%") : "top 40%",
                scrub: desktop ? 0.8 : false,
              },
            });
            steps.forEach((step, i) => {
              const paths = step.querySelectorAll("[data-draw]");
              const labels = step.querySelectorAll("[data-label]");
              gsap.set(paths, { drawSVG: "0%" });
              gsap.set(labels, { autoAlpha: 0 });
              tl.to(paths, { drawSVG: "100%", duration: 1, ease: "none", stagger: 0.15 }, i * 0.9);
              tl.to(labels, { autoAlpha: 1, duration: 0.35 }, i * 0.9 + 0.6);
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
  }, [end]);

  return <span ref={anchor} hidden />;
}
