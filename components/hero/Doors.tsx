import { getTranslations } from "next-intl/server";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";

const DOORS = [
  { key: "work", href: "/work" },
  { key: "lab", href: "/lab" },
  { key: "contact", href: "/contact" },
] as const;

export async function Doors() {
  const t = await getTranslations("hero.doors");
  return (
    <nav aria-label="Sections" className="grid grid-cols-1 gap-0 md:grid-cols-3 md:gap-8">
      {DOORS.map(({ key, href }) => (
        <Link
          key={key}
          href={href}
          className="group flex items-start justify-between gap-4 border-t border-rule py-5 transition-colors duration-(--dur-2) hover:border-signal"
        >
          <span className="flex flex-col gap-1">
            <span className="font-display text-xl font-medium text-ink group-hover:text-signal">{t(`${key}.title`)}</span>
            <span className="text-sm text-ink-2">{t(`${key}.meta`)}</span>
          </span>
          <ArrowRight
            size={20}
            className="mt-1 shrink-0 text-ink-3 transition-transform duration-(--dur-2) ease-(--ease-out) group-hover:translate-x-1 group-hover:text-signal"
          />
        </Link>
      ))}
    </nav>
  );
}
