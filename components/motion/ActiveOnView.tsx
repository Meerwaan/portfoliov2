"use client";

import { useEffect } from "react";

/**
 * Marks the [data-track] element closest to the viewport centre with data-active="true" and dispatches
 * "mwn:active" with its id on the nearest [data-track-root]. Used by the lab viewer and the path trace.
 */
export function ActiveOnView({ selector = "[data-track]" }: { selector?: string }) {
  useEffect(() => {
    const items = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (items.length === 0) return;
    let current: HTMLElement | null = null;
    let raf = 0;
    const pick = () => {
      raf = 0;
      const mid = window.innerHeight * 0.45;
      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const el of items) {
        const r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > window.innerHeight) continue;
        const d = Math.abs((r.top + Math.min(r.height, 320) / 2) - mid);
        if (d < bestDist) {
          bestDist = d;
          best = el;
        }
      }
      if (best && best !== current) {
        current?.removeAttribute("data-active");
        best.setAttribute("data-active", "true");
        current = best;
        best.closest("[data-track-root]")?.dispatchEvent(new CustomEvent("mwn:active", { detail: best.dataset.track }));
      }
    };
    const io = new IntersectionObserver(() => {
      if (!raf) raf = requestAnimationFrame(pick);
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    items.forEach((el) => io.observe(el));
    pick();
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, [selector]);
  return null;
}
