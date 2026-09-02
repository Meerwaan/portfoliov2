import Image from "next/image";
import type { Screenshot } from "@/lib/content/schema";

type Row = { kind: "wide"; shot: Screenshot } | { kind: "phones"; shots: Screenshot[] };

/** Consecutive phone captures share one row; desktop captures alternate full and offset widths. */
function group(screenshots: Screenshot[]): Row[] {
  const rows: Row[] = [];
  for (const s of screenshots) {
    const last = rows[rows.length - 1];
    if (s.frame === "phone") {
      if (last?.kind === "phones" && last.shots.length < 3) last.shots.push(s);
      else rows.push({ kind: "phones", shots: [s] });
    } else rows.push({ kind: "wide", shot: s });
  }
  return rows;
}

function Shot({ s, sizes, priority }: { s: Screenshot; sizes: string; priority?: boolean }) {
  return (
    <figure className="m-0">
      <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
        <Image src={s.src} alt={s.alt} width={s.width} height={s.height} sizes={sizes} priority={priority} placeholder={s.blurDataURL ? "blur" : "empty"} blurDataURL={s.blurDataURL} className="h-auto w-full" />
      </div>
    </figure>
  );
}

export function ScreenSequence({ screenshots }: { screenshots: Screenshot[] }) {
  if (screenshots.length === 0) return null;
  const rows = group(screenshots);
  let wide = 0;
  return (
    <section className="container-page py-section">
      <ul className="grid gap-12 lg:grid-cols-12">
        {rows.map((row, i) => {
          if (row.kind === "phones") {
            return (
              <li key={i} className="lg:col-span-10 lg:col-start-2">
                <ul className="grid grid-cols-3 gap-4 md:gap-8">
                  {row.shots.map((s) => (
                    <li key={s.id}>
                      <Shot s={s} sizes="(min-width: 64rem) 26vw, 33vw" />
                    </li>
                  ))}
                </ul>
              </li>
            );
          }
          const offset = wide++ % 2 === 1;
          return (
            <li key={row.shot.id} className={offset ? "lg:col-span-8 lg:col-start-5" : "lg:col-span-12"}>
              <Shot s={row.shot} sizes={offset ? "(min-width: 64rem) 56vw, 100vw" : "(min-width: 90rem) 84rem, 100vw"} />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
