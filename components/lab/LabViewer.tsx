"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import type { LabStatus } from "@/lib/content/schema";

export type ViewerEntry = {
  slug: string;
  index: number;
  title: string;
  status: LabStatus;
  year: string;
  stack: string[];
  shot: { src: string; width: number; height: number; blurDataURL?: string; alt: string } | null;
};

/**
 * Sticky monitor beside the lab log: shows the capture of the entry currently in view, with a mono header
 * (LAB/03 · slug · status · year). Entries without a capture get their stack as a typographic panel.
 */
export function LabViewer({ entries }: { entries: ViewerEntry[] }) {
  const t = useTranslations("lab");
  const [active, setActive] = useState(entries[0]?.slug ?? null);

  useEffect(() => {
    const root = document.querySelector("[data-track-root='lab']");
    if (!root) return;
    const onActive = (e: Event) => setActive((e as CustomEvent<string>).detail ?? null);
    root.addEventListener("mwn:active", onActive);
    return () => root.removeEventListener("mwn:active", onActive);
  }, []);

  const entry = entries.find((e) => e.slug === active) ?? entries[0];
  if (!entry) return null;
  const n = String(entry.index + 1).padStart(2, "0");

  return (
    <div className="lab-viewer sticky top-24 flex flex-col gap-3" aria-live="polite">
      <p className="mono-label flex flex-wrap gap-x-3 text-ink-3">
        <span className="text-ink">LAB/{n}</span>
        <span>{entry.slug}</span>
        <span className={entry.status === "active" ? "text-signal" : undefined}>{t(`status.${entry.status}`)}</span>
        <span>{entry.year}</span>
      </p>
      <div className="lab-viewer-frame relative overflow-hidden rounded-md border border-rule bg-paper-2">
        {entries.map((e) =>
          e.shot ? (
            <Image
              key={e.slug}
              src={e.shot.src}
              alt={e.shot.alt}
              width={e.shot.width}
              height={e.shot.height}
              sizes="(min-width: 64rem) 40vw, 100vw"
              placeholder={e.shot.blurDataURL ? "blur" : "empty"}
              blurDataURL={e.shot.blurDataURL}
              className={`lab-viewer-shot h-auto w-full ${e.slug === entry.slug ? "is-active" : ""}`}
            />
          ) : (
            <div key={e.slug} className={`lab-viewer-shot lab-viewer-empty ${e.slug === entry.slug ? "is-active" : ""}`}>
              <span className="mono-label text-ink-3">{t("noScreen")}</span>
              <ul className="mt-4 flex flex-col gap-1 font-mono text-mono text-ink-2">
                {e.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ),
        )}
      </div>
      <p className="text-sm text-ink-2">{entry.title}</p>
    </div>
  );
}
