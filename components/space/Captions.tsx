"use client";

import type { CSSProperties, MouseEvent } from "react";
import { useTranslations } from "next-intl";
import { CaptionBody } from "./CaptionBody";
import type { SpaceItem } from "./types";

/** Caption i stays fully visible while the camera is within this fraction of a segment from plane i... */
const HOLD = 0.12;
/** ...and is gone this much further, so two captions never overlap (windows end well before the midpoint). */
const FADE = 0.23;

/** Maps the scroll progress (0..1) to the opacity of each caption. */
export function applyCaptionProgress(elements: (HTMLElement | null)[], progress: number, count: number) {
  const position = count > 1 ? progress * (count - 1) : 0;
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (!el) continue;
    const distance = Math.abs(position - i);
    const opacity = Math.min(1, Math.max(0, 1 - (distance - HOLD) / FADE));
    el.style.opacity = opacity.toFixed(3);
    el.style.visibility = opacity > 0.01 ? "visible" : "hidden";
    el.style.transform = `translateY(${((1 - opacity) * 8).toFixed(2)}px)`;
  }
}

function initialStyle(index: number): CSSProperties {
  return index === 0 ? { opacity: 1, visibility: "visible" } : { opacity: 0, visibility: "hidden" };
}

/**
 * DOM overlay over the pinned stage. All captions are stacked in the same grid cell; the scene drives
 * their opacity through refs. Text stays real DOM: selectable, readable, with a focusable link.
 */
export function Captions({
  items,
  setElement,
  onOpen,
}: {
  items: SpaceItem[];
  setElement: (index: number, el: HTMLLIElement | null) => void;
  onOpen: (event: MouseEvent<HTMLAnchorElement>, index: number) => void;
}) {
  const t = useTranslations("space");
  const status = useTranslations("work.status");
  return (
    <ul className="container-page pointer-events-none absolute inset-x-0 bottom-0 z-30 grid pb-8 md:pb-[calc(var(--spacing-rail)+2rem)]">
      {items.map((item, index) => (
        <li
          key={item.slug}
          ref={(el) => setElement(index, el)}
          className="pointer-events-auto w-fit max-w-[40ch] [grid-area:1/1]"
          style={initialStyle(index)}
        >
          <CaptionBody item={item} openLabel={t("open")} statusLabel={status(item.status)} onOpen={(event) => onOpen(event, index)} />
        </li>
      ))}
    </ul>
  );
}
