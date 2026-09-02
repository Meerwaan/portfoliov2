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
import { PathList } from "@/components/about/PathList";

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

  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <h1 className="max-w-[22ch] font-display text-3xl font-medium text-ink">{about.statement}</h1>
      </section>

      <section className="container-page grid gap-12 pb-section lg:grid-cols-12">
        <div className="prose-case lg:col-span-7">{body}</div>
        <aside className="lg:col-span-4 lg:col-start-9">
          <a
            href={site.cvPath}
            download
            className="mono-label inline-flex items-center gap-2 border-b border-ink pb-1 text-ink transition-colors duration-(--dur-1) hover:border-signal hover:text-signal"
          >
            {t("cv")} <ArrowDown size={14} />
          </a>
        </aside>
      </section>

      <section className="container-page grid gap-12 border-t border-rule py-section lg:grid-cols-12">
        <h2 className="font-display text-2xl font-medium text-ink lg:col-span-3">{t("experience")}</h2>
        <div className="lg:col-span-9">
          <PathList entries={about.path.experience} locale={locale} />
        </div>
        <h2 className="font-display text-2xl font-medium text-ink lg:col-span-3">{t("education")}</h2>
        <div className="lg:col-span-9">
          <PathList entries={about.path.education} locale={locale} />
        </div>
      </section>

      <section className="container-page border-t border-rule py-section">
        <h2 className="font-display text-2xl font-medium text-ink">{t("stack")}</h2>
        <dl className="mt-8 grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-5">
          {groups.map(([key, items]) => (
            <div key={key}>
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
