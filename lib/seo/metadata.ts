import type { Metadata } from "next";
import { SITE_URL, site } from "@/lib/site";
import { routing, type Locale } from "@/i18n/routing";

type Input = {
  locale: Locale;
  /** Path without locale prefix, starting with "/" ("/" for home). */
  path: string;
  title?: string;
  description: string;
  type?: "website" | "article";
};

const OG_LOCALE: Record<Locale, string> = { fr: "fr_FR", en: "en_GB" };

function url(locale: string, path: string) {
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export function buildMetadata({ locale, path, title, description, type = "website" }: Input): Metadata {
  const canonical = url(locale, path);
  const languages = Object.fromEntries(routing.locales.map((l) => [l, url(l, path)]));
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: { ...languages, "x-default": url(routing.defaultLocale, path) },
    },
    openGraph: {
      type,
      url: canonical,
      siteName: site.name,
      title: title ?? site.name,
      description,
      locale: OG_LOCALE[locale],
      alternateLocale: routing.locales.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
    },
    twitter: {
      card: "summary_large_image",
      title: title ?? site.name,
      description,
    },
  };
}
