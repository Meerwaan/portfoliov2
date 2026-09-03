"use client";

import { useEffect, useRef } from "react";

/**
 * Hovering, focusing or tapping a tool in the stack diagram lights it with the tools it is linked to (both
 * directions) and dims everything else. Attributes come from the generated SVG: [data-node] groups and
 * [data-link="from|to"] paths. Pure DOM, attached once the diagram is in the page.
 */
export function StackMapFocus() {
  const anchor = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const root = anchor.current?.closest<HTMLElement>(".stack-map")?.querySelector<HTMLElement>("[data-diagram]");
    if (!root) return;
    const nodes = Array.from(root.querySelectorAll<SVGGElement>("[data-node]"));
    const links = Array.from(root.querySelectorAll<SVGPathElement>("[data-link]"));
    const clear = () => {
      root.removeAttribute("data-focus");
      for (const el of [...nodes, ...links]) el.removeAttribute("data-hi");
    };
    const focus = (name: string) => {
      const near = new Set([name]);
      for (const l of links) {
        const [a, b] = (l.dataset.link ?? "").split("|");
        if (a === name || b === name) {
          near.add(a);
          near.add(b);
          l.setAttribute("data-hi", "");
        } else l.removeAttribute("data-hi");
      }
      for (const n of nodes) {
        if (near.has(n.dataset.node ?? "")) n.setAttribute("data-hi", "");
        else n.removeAttribute("data-hi");
      }
      root.setAttribute("data-focus", "");
    };
    const onOver = (e: Event) => {
      const n = (e.target as Element).closest<SVGGElement>("[data-node]");
      if (n?.dataset.node) focus(n.dataset.node);
    };
    const onClick = (e: Event) => {
      const n = (e.target as Element).closest<SVGGElement>("[data-node]");
      if (!n?.dataset.node) return clear();
      if (n.hasAttribute("data-hi") && root.hasAttribute("data-focus") && root.dataset.current === n.dataset.node) return clear();
      root.dataset.current = n.dataset.node;
      focus(n.dataset.node);
    };
    root.addEventListener("mouseover", onOver);
    root.addEventListener("mouseleave", clear);
    root.addEventListener("focusin", onOver);
    root.addEventListener("focusout", clear);
    root.addEventListener("click", onClick);
    return () => {
      root.removeEventListener("mouseover", onOver);
      root.removeEventListener("mouseleave", clear);
      root.removeEventListener("focusin", onOver);
      root.removeEventListener("focusout", clear);
      root.removeEventListener("click", onClick);
    };
  }, []);
  return <span ref={anchor} hidden />;
}
