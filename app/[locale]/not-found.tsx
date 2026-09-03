import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("notFound");
  const r = await getTranslations("rail.context");
  return (
    <section className="container-page flex min-h-[calc(100svh-var(--spacing-nav))] flex-col justify-center gap-6 py-section">
      <p className="mono-label text-ink-3">{r("notFound")}</p>
      <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
      <p className="max-w-[60ch] text-ink-2">{t("body")}</p>
      <Link href="/" className="mono-label w-fit border-b border-ink pb-1 hover:border-signal hover:text-signal">
        {t("home")}
      </Link>
    </section>
  );
}
