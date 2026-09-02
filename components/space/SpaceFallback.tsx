import Image from "next/image";
import { ViewTransition } from "react";
import { getTranslations } from "next-intl/server";
import { CaptionBody } from "./CaptionBody";
import type { SpaceItem } from "./types";

/**
 * Static composition of the same screenshots. This is what the server HTML, reduced motion,
 * missing WebGL and the loading state of the scene all show, so the captures are always in the document.
 */
export async function SpaceFallback({ items }: { items: SpaceItem[] }) {
  const t = await getTranslations("space");
  const status = await getTranslations("work.status");
  const columns = items.length >= 3 ? "sm:grid-cols-2 xl:grid-cols-3" : "sm:grid-cols-2";
  return (
    <ul className={`grid gap-x-8 gap-y-14 ${columns}`}>
      {items.map((item) => (
        <li key={item.slug} className="flex flex-col gap-5">
          <ViewTransition name={`screen-${item.slug}`} share="screen" default="none">
            <figure className="overflow-hidden rounded-md border border-rule bg-paper-2">
              <Image
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                sizes="(min-width: 80rem) 30vw, (min-width: 40rem) 45vw, 100vw"
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
