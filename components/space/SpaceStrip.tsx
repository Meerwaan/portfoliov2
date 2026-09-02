import Image from "next/image";
import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import { CaptionBody } from "./CaptionBody";
import type { SpaceItem } from "./types";

/**
 * 2D fallback for coarse pointers, narrow viewports and low-memory devices:
 * a horizontal scroll-snap row of the same screenshots with the same captions. No JavaScript.
 */
export async function SpaceStrip({ items }: { items: SpaceItem[] }) {
  const t = await getTranslations("space");
  const status = await getTranslations("work.status");
  return (
    <ul className="space-strip -mx-gutter flex snap-x snap-mandatory gap-5 overflow-x-auto px-gutter pb-2">
      {items.map((item) => (
        <li key={item.slug} className="flex w-[84%] shrink-0 snap-start flex-col gap-5 sm:w-[62%] lg:w-[46%]">
          <ViewTransition name={`screen-${item.slug}`} share="screen" default="none">
            <figure className="overflow-hidden rounded-md border border-rule bg-paper-2">
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 64rem) 46vw, (min-width: 40rem) 62vw, 84vw"
                placeholder={item.blurDataURL ? "blur" : "empty"}
                blurDataURL={item.blurDataURL}
                className="h-auto w-full"
              />
            </figure>
          </ViewTransition>
          <CaptionBody item={item} openLabel={t("open")} statusLabel={status(item.status)} />
        </li>
      ))}
    </ul>
  );
}
