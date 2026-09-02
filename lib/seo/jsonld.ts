import { site } from "@/lib/site";
import type { Locale } from "@/i18n/routing";

const JOB_TITLE: Record<Locale, string> = {
  fr: "Ingénieur produit full-stack",
  en: "Full-stack product engineer",
};

export function personJsonLd(locale: Locale) {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: site.name,
    url: `${site.url}/${locale}`,
    jobTitle: JOB_TITLE[locale],
    email: `mailto:${site.email}`,
    sameAs: [site.github, site.linkedin],
    address: {
      "@type": "PostalAddress",
      addressLocality: site.location.locality,
      addressRegion: site.location.region,
      addressCountry: site.location.country,
    },
    knowsAbout: ["TypeScript", "Next.js", "React", "React Native", "Node.js", "NestJS", "Prisma", "PostgreSQL", "Docker", "AWS"],
  };
}

/** Serialize for a <script type="application/ld+json"> without allowing "</script>" injection. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
