import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { getBuildInfo } from "@/lib/telemetry/build-info";
import { getProjectSlugs } from "@/lib/content/loader";

const STATIC_PATHS = ["/", "/work", "/lab", "/about", "/contact"];

function url(locale: string, path: string) {
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date(getBuildInfo().commitDate);
  const slugs = await getProjectSlugs();
  const paths = [...STATIC_PATHS, ...slugs.map((s) => `/work/${s}`)];
  return routing.locales.flatMap((locale) =>
    paths.map((path) => ({
      url: url(locale, path),
      lastModified,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : path.startsWith("/work/") ? 0.8 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}
