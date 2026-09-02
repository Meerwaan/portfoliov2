import Image from "next/image";
import type { Screenshot } from "@/lib/content/schema";

/** Full-bleed captures after the narrative, alternating widths so the rhythm is not a stack of identical cards. */
export function ScreenSequence({ screenshots }: { screenshots: Screenshot[] }) {
  if (screenshots.length === 0) return null;
  return (
    <section className="container-page py-section">
      <ul className="grid gap-12 lg:grid-cols-12">
        {screenshots.map((s, i) => (
          <li key={s.id} className={i % 2 === 0 ? "lg:col-span-12" : "lg:col-span-8 lg:col-start-5"}>
            <figure>
              <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
                <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes={i % 2 === 0 ? "(min-width: 90rem) 84rem, 100vw" : "(min-width: 64rem) 56vw, 100vw"} placeholder={s.blurDataURL ? "blur" : "empty"} blurDataURL={s.blurDataURL} className="h-auto w-full" />
              </div>
              <figcaption className="mt-3 text-sm text-ink-3">{s.alt}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
