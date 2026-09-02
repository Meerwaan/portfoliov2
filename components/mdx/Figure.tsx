import Image from "next/image";
import type { ReactNode } from "react";

/**
 * Real capture only. `src` must point to a processed rendition under /screens; width/height are required so
 * layout never shifts. Used from MDX as <Figure src="/screens/reputap/dashboard-1600.webp" width={2880} height={1800} alt="..." />
 */
export function Figure({ src, alt, width, height, caption }: { src: string; alt: string; width: number; height: number; caption?: ReactNode }) {
  return (
    <figure className="my-10">
      <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
        <Image src={src} alt={alt} width={width} height={height} sizes="(min-width: 64rem) 60rem, 100vw" className="h-auto w-full" />
      </div>
      {caption && <figcaption className="mt-3 text-sm text-ink-3">{caption}</figcaption>}
    </figure>
  );
}
