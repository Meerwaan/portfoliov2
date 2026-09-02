import Image from "next/image";
import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import type { Screenshot } from "@/lib/content/schema";
import { Diagram } from "@/components/work/Diagram";

type Ctx = { screenshots: Screenshot[]; diagram: string | null; diagramLabel: string; captionLabel: (n: number) => string };

function find(ctx: Ctx, id: string): Screenshot | null {
  return ctx.screenshots.find((s) => s.id === id) ?? null;
}

/**
 * Components bound to one case study, so captures live inside the narrative instead of a gallery at the end.
 *   <Architecture />                      the project's diagram, drawn on scroll
 *   <Screens ids="a,b,c" />               a compact row (phone steps or two browser screens), numbered
 *   <Screen id="x" caption="..." />       one capture, breaking out of the prose column
 * Unknown ids render nothing (the capture is simply not processed yet), never a broken image.
 */
export function caseComponents(ctx: Ctx): MDXComponents {
  return {
    Architecture: () =>
      ctx.diagram ? (
        <section className="case-architecture my-12">
          <p className="mono-label text-ink-3">{ctx.diagramLabel}</p>
          <Diagram svg={ctx.diagram} label={ctx.diagramLabel} />
        </section>
      ) : null,
    Screens: ({ ids, caption }: { ids: string | string[]; caption?: ReactNode }) => {
      const list = Array.isArray(ids) ? ids : String(ids ?? "").split(",").map((v) => v.trim()).filter(Boolean);
      const shots = list.map((id) => find(ctx, id)).filter((s): s is Screenshot => s !== null);
      if (shots.length === 0) return null;
      const phones = shots.every((s) => s.frame === "phone");
      return (
        <figure className={`case-screens my-12 ${phones ? "case-screens-phones" : ""}`}>
          <ol className={`grid gap-4 ${phones ? "grid-cols-3" : "grid-cols-1 md:grid-cols-2"}`}>
            {shots.map((s, i) => (
              <li key={s.id} className="flex flex-col gap-2">
                <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
                  <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes={phones ? "(min-width: 64rem) 16rem, 30vw" : "(min-width: 64rem) 28rem, 50vw"} placeholder={s.blurDataURL ? "blur" : "empty"} blurDataURL={s.blurDataURL} className="h-auto w-full" />
                </div>
                <span className="mono-label text-ink-3">{ctx.captionLabel(i + 1)}</span>
              </li>
            ))}
          </ol>
          {caption && <figcaption className="mt-3 text-sm text-ink-3">{caption}</figcaption>}
        </figure>
      );
    },
    Screen: ({ id, caption }: { id: string; caption?: ReactNode }) => {
      const s = find(ctx, id);
      if (!s) return null;
      return (
        <figure className="case-screen my-12">
          <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
            <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes="(min-width: 64rem) 56rem, 100vw" placeholder={s.blurDataURL ? "blur" : "empty"} blurDataURL={s.blurDataURL} className="h-auto w-full" />
          </div>
          <figcaption className="mt-3 text-sm text-ink-3">{caption ?? s.alt}</figcaption>
        </figure>
      );
    },
  };
}
