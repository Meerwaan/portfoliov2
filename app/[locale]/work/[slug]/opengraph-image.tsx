import { getTranslations } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { getProject, getProjectSlugs } from "@/lib/content/loader";
import { OG_CONTENT_TYPE, OG_SIZE, ogCard } from "@/lib/seo/og";
import { formatPeriod } from "@/components/work/labels";

export async function generateStaticParams() {
  const slugs = await getProjectSlugs();
  return routing.locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
export const alt = "Merwan Laouini";

export default async function Image({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const l = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const slugs = await getProjectSlugs();
  if (!slugs.includes(slug)) return ogCard({ locale: l, subtitle: "", meta: [`/${l}/work`] });
  const [project, t] = await Promise.all([getProject(slug, l), getTranslations({ locale: l, namespace: "work" })]);
  return ogCard({
    locale: l,
    title: project.title,
    subtitle: project.oneLiner,
    meta: [t(`status.${project.status}`).toUpperCase(), project.node, formatPeriod(project.period, l).toUpperCase(), project.stack.slice(0, 2).join(" · ")],
    live: project.status === "production",
  });
}
