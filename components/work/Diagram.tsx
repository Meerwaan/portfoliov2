"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, useGSAP);

/**
 * Architecture diagram drawn stroke by stroke as the reader scrolls. The SVG comes from content/<slug>/diagram.svg
 * (authored by us, not user input). Paths carry data-draw, label groups data-label, in reading order.
 * Reduced motion: the SVG is simply shown.
 */
export function Diagram({ svg, label }: { svg: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", desktop: "(min-width: 48rem)" },
        (ctx) => {
          const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean };
          if (!motion) return;
          const steps = gsap.utils.toArray<SVGGElement>("[data-step]", ref.current);
          if (steps.length === 0) return;
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ref.current,
              start: "top 78%",
              end: desktop ? "bottom 45%" : "top 40%",
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
        },
      );
    },
    { scope: ref },
  );

  return (
    <div
      ref={ref}
      role="img"
      aria-label={label}
      className="diagram my-6 w-full overflow-x-auto text-ink [&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[40rem]"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
