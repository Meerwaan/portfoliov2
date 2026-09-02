import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import type { PathEntry } from "@/lib/content/schema";

function year(v: string) {
  return v.slice(0, 4);
}

export async function PathList({ entries, locale }: { entries: PathEntry[]; locale: "fr" | "en" }) {
  const t = await getTranslations("about");
  return (
    <ol className="divide-y divide-rule border-t border-rule">
      {entries.map((e) => {
        const range = e.to === null ? `${year(e.from)} · ${t("today")}` : year(e.from) === year(e.to) ? year(e.from) : `${year(e.from)}-${year(e.to)}`;
        return (
          <li key={`${e.org}-${e.from}`} className="grid gap-2 py-5 md:grid-cols-[9rem_1fr]">
            <span className="mono-label text-ink-3 tabular">{range}</span>
            <span className="flex flex-col gap-1">
              <span className="text-ink">
                <span className="font-medium">{e.role[locale]}</span>
                <span className="text-ink-2">
                  {" "}
                  · {e.org}
                  {e.place ? `, ${e.place}` : ""}
                </span>
              </span>
              {e.line && <span className="text-sm text-ink-2">{e.line[locale]}</span>}
              {e.href && (
                <Link href={e.href} className="mono-label mt-1 inline-flex w-fit items-center gap-1 border-b border-rule-strong text-ink-2 hover:border-signal hover:text-signal">
                  {t("readCase")} <ArrowUpRight size={12} />
                </Link>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
