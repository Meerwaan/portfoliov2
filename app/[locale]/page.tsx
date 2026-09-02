import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { Hero } from "@/components/hero/Hero";
import { LegacyHashRedirect } from "@/components/home/LegacyHashRedirect";
import { StackSection } from "@/components/stack/StackSection";

export async function generateMetadata({ params }: PageProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "site" });
  return {
    ...buildMetadata({ locale, path: "/", description: t("description") }),
    title: { absolute: `${site.name} · ${t("tagline")}` },
  };
}

export default async function HomePage({ params }: PageProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <>
      <LegacyHashRedirect />
      <Hero />
      <StackSection />
    </>
  );
}
