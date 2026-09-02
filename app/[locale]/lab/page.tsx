import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { getLabEntries } from "@/lib/content/loader";
import { LabLog } from "@/components/lab/LabLog";
import { LabBench } from "@/components/lab/LabBench";

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
      <section className="container-page pt-16 pb-12 md:pt-24">
        <h1 className="font-display text-3xl font-medium text-ink">{t("title")}</h1>
        <p className="mt-5 max-w-[52ch] text-xl text-ink-2">{t("intro")}</p>
      </section>
      <LabBench entries={entries} locale={locale} />
      <LabLog entries={entries} />
    </>
  );
}
