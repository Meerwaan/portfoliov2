import { getLocale, getTranslations } from "next-intl/server";
import { getProjects, type Locale, type Project } from "@/lib/content/loader";
import { SpaceFallback } from "./SpaceFallback";
import { SpaceGate } from "./SpaceGate";
import { SpaceStrip } from "./SpaceStrip";
import type { SpaceItem } from "./types";

function toItems(projects: Project[]): SpaceItem[] {
  return projects
    .filter((p): p is Project & { hero: NonNullable<Project["hero"]>; space: NonNullable<Project["space"]> } => p.hero !== null && p.space !== undefined)
    .sort((a, b) => a.space.index - b.space.index)
    .slice(0, 6)
    .map((p) => ({
      slug: p.slug,
      node: p.node,
      title: p.title,
      oneLiner: p.oneLiner,
      status: p.status,
      texture: p.hero.texture,
      src: p.hero.src,
      width: p.hero.width,
      height: p.hero.height,
      blurDataURL: p.hero.blurDataURL,
      alt: p.hero.alt,
      tilt: p.space.tilt,
    }));
}

/**
 * The interface space: real product screenshots as planes the camera travels through on scroll.
 * Server component. The images are always in the HTML through the fallback; the scene is a lazy client leaf.
 */
export async function InterfaceSpace() {
  const locale = (await getLocale()) as Locale;
  const items = toItems(await getProjects(locale));
  if (items.length === 0) return null;
  const t = await getTranslations("space");

  const fallback = (
    <div className="container-page">
      <SpaceFallback items={items} />
    </div>
  );
  const strip = (
    <div className="container-page">
      <SpaceStrip items={items} />
    </div>
  );

  return (
    <section aria-labelledby="space-title" className="border-t border-rule py-section">
      <div className="container-page flex flex-wrap items-end justify-between gap-x-8 gap-y-3 pb-10 md:pb-14">
        <h2 id="space-title" className="max-w-[18ch] font-display text-3xl font-medium text-ink">
          {t("title")}
        </h2>
        <p className="mono-label text-ink-3">{t("meta", { count: items.length })}</p>
      </div>
      {/* No Suspense here on purpose: the gate renders the fallback synchronously, so the images are in the HTML once.
          The scene's own boundary lives in next/dynamic (SpaceGate) and shows the same fallback while the chunk loads. */}
      <SpaceGate items={items} fallback={fallback} strip={strip} />
    </section>
  );
}
