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
import { PathTrace } from "@/components/about/PathTrace";

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
  const STACK_LABELS = { front: t("stackGroups.front"), mobile: t("stackGroups.mobile"), back: t("stackGroups.back"), data: t("stackGroups.data"), infra: t("stackGroups.infra") } as const;
  const groups = Object.entries(about.path.stack) as [keyof typeof STACK_LABELS, string[]][];
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

      <section className="container-page grid gap-10 border-t border-rule py-section lg:grid-cols-12">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-24 flex flex-col gap-3">
            <h2 className="font-display text-2xl font-medium text-ink">{t("pathTitle")}</h2>
            <p className="max-w-[36ch] text-ink-2">{t("pathIntro")}</p>
          </div>
        </div>
        <div className="lg:col-span-7 lg:col-start-6">
          <PathTrace experience={about.path.experience} education={about.path.education} locale={locale} />
        </div>
      </section>

      <section className="container-page border-t border-rule py-section">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-2xl font-medium text-ink">{t("stack")}</h2>
          <p className="mono-label text-ink-3">{t("stackNote")}</p>
        </div>
        <dl className="mt-10 grid gap-x-8 gap-y-10 border-t border-rule pt-8 sm:grid-cols-2 lg:grid-cols-5">
          {groups.map(([key, items]) => (
            <div key={key} className="stack-group">
              <dt className="mono-label text-ink-3">{STACK_LABELS[key] ?? key}</dt>
              <dd className="mt-3 flex flex-col gap-1 text-ink-2">
                {items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
