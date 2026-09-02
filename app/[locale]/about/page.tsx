import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowDown } from "@phosphor-icons/react/ssr";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { getAbout } from "@/lib/content/loader";
import { renderMdx } from "@/lib/content/mdx";
import { site } from "@/lib/site";
import { PathStory } from "@/components/about/PathStory";

export async function generateMetadata({ params }: PageProps<"/[locale]/about">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "about" });
  return buildMetadata({ locale, path: "/about", title: t("title"), description: t("description") });
}

export default async function AboutPage({ params }: PageProps<"/[locale]/about">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const about = await getAbout(locale);
  const body = await renderMdx(about.body);
  const years = about.path.education.concat(about.path.experience).map((e) => e.from.slice(0, 4));
  const span = `${Math.min(...years.map(Number))} → ${new Date().getFullYear()}`;

  return (
    <>
      <section className="container-page grid gap-10 pt-16 pb-section md:pt-24 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-24 flex flex-col gap-6">
            <p className="mono-label text-ink-3">
              PATH · {span}
            </p>
            <h1 className="max-w-[18ch] font-display text-3xl font-medium text-ink">{about.statement}</h1>
            <a
              href={site.cvPath}
              download
              className="mono-label inline-flex w-fit items-center gap-2 border-b border-ink pb-1 text-ink transition-colors duration-(--dur-1) hover:border-signal hover:text-signal"
            >
              {t("cv")} <ArrowDown size={14} />
            </a>
          </div>
        </div>
        <div className="prose-case lg:col-span-6 lg:col-start-7">{body}</div>
      </section>

      <section className="border-t border-rule" aria-label={t("pathTitle")}>
        <div className="container-page grid gap-6 pt-section pb-10 lg:grid-cols-12">
          <h2 className="font-display text-3xl font-medium text-ink lg:col-span-7">{t("pathTitle")}</h2>
          <p className="max-w-[44ch] text-lg text-ink-2 lg:col-span-5 lg:col-start-8">{t("pathIntro")}</p>
        </div>
        <PathStory locale={locale} eyebrow={`PATH · ${span}`} />
      </section>

    </>
  );
}
