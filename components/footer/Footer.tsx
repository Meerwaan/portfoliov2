import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { getBuildInfo } from "@/lib/telemetry/build-info";
import { ThemeToggle } from "@/components/system/ThemeToggle";
import { LocaleSwitch } from "@/components/system/LocaleSwitch";
import { RailStatus } from "@/components/telemetry/RailStatus";

export async function Footer() {
  const t = await getTranslations("footer");
  const r = await getTranslations("rail");
  const build = getBuildInfo();
  return (
    <footer className="border-t border-rule">
      <div className="container-page flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-ink-2">{t("rights")}</p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 md:hidden">
            <RailStatus compact />
            <span className="mono-label text-ink-3">
              {r("build")} <span className="normal-case text-ink-2">{build.sha7}</span>
            </span>
            <ThemeToggle />
            <LocaleSwitch />
          </div>
        </div>
        <ul className="mono-label flex items-center gap-6 text-ink-2">
          <li>
            <a href={site.github} rel="me noopener" target="_blank" className="hover:text-signal">
              GitHub
            </a>
          </li>
          <li>
            <a href={site.linkedin} rel="me noopener" target="_blank" className="hover:text-signal">
              LinkedIn
            </a>
          </li>
          <li>
            <a href={`mailto:${site.email}`} className="hover:text-signal">
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
