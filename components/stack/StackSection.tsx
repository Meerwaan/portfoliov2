import { getLocale, getTranslations } from "next-intl/server";
import { getProjectStack, getProjects, type Locale } from "@/lib/content/loader";
import { ExplodedStack } from "./ExplodedStack";
import type { StackItem } from "./types";

/**
 * "Un système, en coupe": each product exploded into its real layers, from the interface down to the
 * infrastructure, with the routes and data models read from the actual codebases (content/<slug>/stack.json).
 * Server component: all text is in the HTML; the client only choreographs the explosion.
 */
export async function StackSection() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("stack");
  const projects = await getProjects(locale);
  const items: StackItem[] = [];
  for (const p of projects) {
    const stack = await getProjectStack(p.slug);
    const ui = p.screenshots.find((s) => s.id === stack?.ui) ?? p.hero;
    if (!stack || !ui) continue;
    items.push({
      slug: p.slug,
      node: p.node,
      title: p.title,
      oneLiner: p.oneLiner,
      status: p.status,
      ui: { src: ui.src, width: ui.width, height: ui.height, blurDataURL: ui.blurDataURL, alt: ui.alt },
      stack,
    });
  }
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="stack-title" className="border-t border-rule pt-section">
      <div className="container-page grid gap-6 pb-12 md:pb-16 lg:grid-cols-12">
        <h2 id="stack-title" className="font-display text-3xl font-medium text-ink lg:col-span-7">
          {t("title")}
        </h2>
        <p className="max-w-[44ch] text-lg text-ink-2 lg:col-span-5 lg:col-start-8">{t("intro")}</p>
      </div>
      {items.map((item) => (
        <ExplodedStack key={item.slug} item={item} locale={locale} />
      ))}
    </section>
  );
}
