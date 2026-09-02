import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { getBuildInfo } from "@/lib/telemetry/build-info";

const STATIC_PATHS = ["/", "/work", "/lab", "/about", "/contact"];

function url(locale: string, path: string) {
  return `${SITE_URL}/${locale}${path === "/" ? "" : path}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date(getBuildInfo().commitDate);
  return routing.locales.flatMap((locale) =>
    STATIC_PATHS.map((path) => ({
      url: url(locale, path),
      lastModified,
      changeFrequency: path === "/" ? "weekly" : "monthly",
      priority: path === "/" ? 1 : 0.7,
      alternates: {
        languages: Object.fromEntries(routing.locales.map((l) => [l, url(l, path)])),
      },
    })),
  );
}
