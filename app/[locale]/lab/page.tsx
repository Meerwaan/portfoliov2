import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLabEntries } from "@/lib/content/loader";
import { LabIndex } from "@/components/lab/LabIndex";
import { LabLedger } from "@/components/lab/LabLedger";

export async function generateMetadata({ params }: PageProps<"/[locale]/lab">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "lab" });
  return buildMetadata({ locale, path: "/lab", title: t("title"), description: t("description") });
}

export default async function LabPage({ params }: PageProps<"/[locale]/lab">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("lab");
  const entries = await getLabEntries(locale);
  return (
    <>
      <section className="container-page pt-16 pb-10 md:pt-24">
        <h1 className="lab-statement font-display font-medium text-ink">{t("statement")}</h1>
        <p className="mt-6 max-w-[56ch] text-xl text-ink-2">{t("intro")}</p>
      </section>
      <LabIndex entries={entries} />
      <LabLedger entries={entries} locale={locale} />
    </>
  );
}
