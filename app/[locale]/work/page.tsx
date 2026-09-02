import type { Metadata } from "next";
import { Suspense } from "react";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { getProjects } from "@/lib/content/loader";
import { WorkIndex } from "@/components/work/WorkIndex";
import type { ProjectCard } from "@/components/work/labels";

export async function generateMetadata({ params }: PageProps<"/[locale]/work">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "work" });
  return buildMetadata({ locale, path: "/work", title: t("title"), description: t("description") });
}

export default async function WorkPage({ params }: PageProps<"/[locale]/work">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("work");
  const projects = await getProjects(locale);
  const cards: ProjectCard[] = projects.map((p) => ({
    slug: p.slug,
    node: p.node,
    title: p.title,
    oneLiner: p.oneLiner,
    role: p.role,
    status: p.status,
    period: p.period,
    stack: p.stack,
    keywords: p.keywords,
    hero: p.hero ? { src: p.hero.src, width: p.hero.width, height: p.hero.height, blurDataURL: p.hero.blurDataURL, alt: p.hero.alt } : null,
  }));

  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <h1 className="font-display text-3xl font-medium text-ink">{t("title")}</h1>
        <p className="mt-5 max-w-[52ch] text-xl text-ink-2">{t("intro")}</p>
      </section>
      <section className="container-page pb-section">
        <Suspense fallback={null}>
          <WorkIndex projects={cards} />
        </Suspense>
      </section>
    </>
  );
}
