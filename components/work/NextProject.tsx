import { getTranslations } from "next-intl/server";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";

export async function NextProject({ slug, title, node }: { slug: string; title: string; node: string }) {
  const t = await getTranslations("work");
  return (
    <section className="border-t border-rule">
      <Link href={`/work/${slug}`} className="group container-page flex items-end justify-between gap-6 py-16 md:py-24">
        <span className="flex flex-col gap-3">
          <span className="mono-label text-ink-3">
            {t("next")} · {node}
          </span>
          <span className="font-display text-3xl font-medium text-ink group-hover:text-signal">{title}</span>
        </span>
        <ArrowRight size={32} className="mb-2 shrink-0 text-ink-3 transition-transform duration-(--dur-2) ease-(--ease-out) group-hover:translate-x-2 group-hover:text-signal" />
      </Link>
    </section>
  );
}
