import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { serializeJsonLd } from "@/lib/seo/jsonld";
import { SITE_URL, site } from "@/lib/site";
import { getProject, getProjectDiagram, getProjectSlugs, getProjects } from "@/lib/content/loader";
import { renderMdx } from "@/lib/content/mdx";
import { CaseHero } from "@/components/work/CaseHero";
import { Diagram } from "@/components/work/Diagram";
import { caseComponents } from "@/components/mdx/case-components";
import { MetricsTable } from "@/components/work/MetricsTable";
import { NextProject } from "@/components/work/NextProject";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

async function load(locale: string, slug: string) {
  if (!hasLocale(routing.locales, locale)) return null;
  const slugs = await getProjectSlugs();
  if (!slugs.includes(slug)) return null;
  return getProject(slug, locale);
}

export async function generateMetadata({ params }: PageProps<"/[locale]/work/[slug]">): Promise<Metadata> {
  const { locale, slug } = await params;
  const project = await load(locale, slug);
  if (!project) return {};
  return buildMetadata({ locale: project.locale, path: `/work/${slug}`, title: project.title, description: project.summary, type: "article" });
}

export default async function CaseStudyPage({ params }: PageProps<"/[locale]/work/[slug]">) {
  const { locale, slug } = await params;
  const project = await load(locale, slug);
  if (!project) notFound();
  setRequestLocale(project.locale);
  const t = await getTranslations("work");

  const [diagram, all] = await Promise.all([project.diagram ? getProjectDiagram(slug) : Promise.resolve(null), getProjects(project.locale)]);
  const body = await renderMdx(
    project.body,
    caseComponents({
      screenshots: project.screenshots,
      diagram,
      diagramLabel: t("diagram"),
      captionLabel: (n) => t("step", { n }),
    }),
  );
  const inlineDiagram = project.body.includes("<Architecture");
  const index = all.findIndex((p) => p.slug === slug);
  const next = all[(index + 1) % all.length];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: project.title,
      description: project.summary,
      url: `${SITE_URL}/${project.locale}/work/${slug}`,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      author: { "@type": "Person", name: site.name, url: SITE_URL },
      ...(project.links.live ? { sameAs: project.links.live } : {}),
      ...(project.hero ? { image: `${SITE_URL}${project.hero.src}` } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: site.name, item: `${SITE_URL}/${project.locale}` },
        { "@type": "ListItem", position: 2, name: t("title"), item: `${SITE_URL}/${project.locale}/work` },
        { "@type": "ListItem", position: 3, name: project.title, item: `${SITE_URL}/${project.locale}/work/${slug}` },
      ],
    },
  ];

  return (
    <article>
      <CaseHero project={project} />
      {project.fallbackBody && (
        <p className="container-page mono-label text-ink-3">{t("fallbackBody")}</p>
      )}
      <div className="container-page grid gap-12 lg:grid-cols-12">
        <div className="prose-case lg:col-span-8 lg:col-start-3">
          {body}
          {diagram && !inlineDiagram && (
            <section className="my-16">
              <p className="mono-label text-ink-3">{t("diagram")}</p>
              <Diagram svg={diagram} label={`${project.title}: ${t("diagram")}`} />
            </section>
          )}
        </div>
      </div>
      <MetricsTable metrics={project.metrics} />
      {next && next.slug !== slug && <NextProject slug={next.slug} title={next.title} node={next.node} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
    </article>
  );
}
