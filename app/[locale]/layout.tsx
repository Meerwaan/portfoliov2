import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Analytics } from "@vercel/analytics/next";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL, site } from "@/lib/site";
import { buildMetadata } from "@/lib/seo/metadata";
import { personJsonLd, serializeJsonLd } from "@/lib/seo/jsonld";
import { themeInitScript } from "@/lib/theme/theme";
import { Nav } from "@/components/nav/Nav";
import { TelemetryRail } from "@/components/telemetry/TelemetryRail";
import { TelemetryProvider } from "@/components/telemetry/TelemetryProvider";
import { Footer } from "@/components/footer/Footer";
import { CommandStoreProvider } from "@/components/command/CommandStore";
import { CommandMount } from "@/components/command/CommandMount";
import "../globals.css";

const cabinet = localFont({
  src: "../../assets/fonts/CabinetGrotesk-Variable.woff2",
  variable: "--font-cabinet",
  weight: "100 900",
  display: "swap",
  preload: true,
});

const commit = localFont({
  src: [
    { path: "../../assets/fonts/CommitMono-400.woff2", weight: "400", style: "normal" },
    { path: "../../assets/fonts/CommitMono-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-commit",
  display: "swap",
  preload: true,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: LayoutProps<"/[locale]">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "site" });
  const base = buildMetadata({ locale, path: "/", description: t("description") });
  return {
    ...base,
    metadataBase: new URL(SITE_URL),
    title: { default: `${site.name} · ${t("tagline")}`, template: `%s · ${site.name}` },
    applicationName: site.name,
    authors: [{ name: site.name, url: SITE_URL }],
    creator: site.name,
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0d0f" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("a11y");

  return (
    <html lang={locale} className={`${cabinet.variable} ${commit.variable}`} suppressHydrationWarning>
      <head>
        <script id="theme-init" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased md:pb-rail">
        <a href="#main" className="skip-link">
          {t("skipLink")}
        </a>
        <NextIntlClientProvider>
          <TelemetryProvider>
            <CommandStoreProvider>
              <Nav />
              <main id="main">{children}</main>
              <Footer />
              <TelemetryRail />
              <CommandMount />
            </CommandStoreProvider>
          </TelemetryProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd(locale as Locale)) }}
        />
        <Analytics />
      </body>
    </html>
  );
}
