import type { Metadata } from "next";
import { hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { routing } from "@/i18n/routing";
import { buildMetadata } from "@/lib/seo/metadata";
import { site } from "@/lib/site";
import { CopyEmail } from "@/components/contact/CopyEmail";
import { LocalTime } from "@/components/contact/LocalTime";
import { ContactForm } from "@/components/contact/ContactForm";

export async function generateMetadata({ params }: PageProps<"/[locale]/contact">): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};
  const t = await getTranslations({ locale, namespace: "contact" });
  return buildMetadata({ locale, path: "/contact", title: t("title"), description: t("description") });
}

export default async function ContactPage({ params }: PageProps<"/[locale]/contact">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const formEnabled = Boolean(process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL);

  return (
    <>
      <section className="container-page pt-16 pb-12 md:pt-24">
        <p className="max-w-[40ch] text-xl text-ink-2">{t("intro")}</p>
        <div className="mt-8 flex flex-col gap-4">
          <a href={`mailto:${site.email}`} className="w-fit break-all font-display text-3xl font-medium text-ink transition-colors duration-(--dur-1) hover:text-signal">
            {site.email}
          </a>
          <CopyEmail email={site.email} />
        </div>
      </section>

      <section className="container-page grid gap-12 border-t border-rule py-section lg:grid-cols-12">
        <div className="lg:col-span-5">
          <h2 className="font-display text-2xl font-medium text-ink">{t("availabilityTitle")}</h2>
          <p className="mt-4 max-w-[40ch] text-ink-2">{t("availability")}</p>
          <p className="mono-label mt-6 text-ink-3">
            {site.location.locality} · {site.timeZone} <LocalTime timeZone={site.timeZone} />
          </p>
        </div>
        <ul className="mono-label flex flex-col gap-4 lg:col-span-4 lg:col-start-8">
          <li>
            <a href={site.linkedin} target="_blank" rel="me noopener" className="inline-flex items-center gap-2 border-b border-rule-strong pb-1 text-ink hover:border-signal hover:text-signal">
              LinkedIn <ArrowUpRight size={14} />
            </a>
          </li>
          <li>
            <a href={site.github} target="_blank" rel="me noopener" className="inline-flex items-center gap-2 border-b border-rule-strong pb-1 text-ink hover:border-signal hover:text-signal">
              GitHub <ArrowUpRight size={14} />
            </a>
          </li>
          <li>
            <a href={site.cvPath} download className="inline-flex items-center gap-2 border-b border-rule-strong pb-1 text-ink hover:border-signal hover:text-signal">
              CV (PDF) <ArrowUpRight size={14} />
            </a>
          </li>
        </ul>
      </section>

      {formEnabled && (
        <section className="container-page border-t border-rule py-section">
          <h2 className="font-display text-2xl font-medium text-ink">{t("form.title")}</h2>
          <ContactForm />
        </section>
      )}
    </>
  );
}
