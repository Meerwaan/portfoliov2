"use client";

import { useEffect, useRef } from "react";

/**
 * Writes --progress (0..1) on its parent element as it scrolls through the viewport, scrubbed by GSAP
 * ScrollTrigger loaded on demand. Pure CSS consumes the variable (line fills, ticks). Reduced motion: --progress = 1.
 */
export function ScrollProgress({ start = "top 70%", end = "bottom 60%" }: { start?: string; end?: string }) {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const target = anchor.current?.parentElement;
    if (!target) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      target.style.setProperty("--progress", "1");
      return;
    }
    let cleanup: (() => void) | undefined;
    let cancelled = false;
    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const trigger = ScrollTrigger.create({
        trigger: target,
        start,
        end,
        scrub: 0.6,
        onUpdate: (self) => target.style.setProperty("--progress", self.progress.toFixed(4)),
      });
      cleanup = () => trigger.kill();
    })();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [start, end]);
  return <span ref={anchor} hidden />;
}
