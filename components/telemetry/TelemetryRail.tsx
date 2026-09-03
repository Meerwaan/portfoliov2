import { getTranslations } from "next-intl/server";
import { getBuildInfo } from "@/lib/telemetry/build-info";
import { ThemeToggle } from "@/components/system/ThemeToggle";
import { LocaleSwitch } from "@/components/system/LocaleSwitch";
import { RailStatus } from "./RailStatus";
import { RouteContext } from "./RouteContext";

/**
 * Fixed bottom rail (desktop). Build data is rendered on the server and therefore static and crawlable;
 * status, region and latency are hydrated by the client probe.
 */
export async function TelemetryRail() {
  const t = await getTranslations("rail");
  const a = await getTranslations("a11y");
  const build = getBuildInfo();

  return (
    <aside
      aria-label={a("rail")}
      className="mono-label fixed inset-x-0 bottom-0 z-10 hidden h-rail items-center justify-between border-t border-rule bg-paper/95 px-gutter backdrop-blur-sm md:flex"
    >
      <div className="flex items-center gap-6">
        <RouteContext />
        <RailStatus />
      </div>
      <div className="flex items-center gap-6">
        <span className="inline-flex items-center gap-2">
          <span className="text-ink-3">{t("build")}</span>
          <span className="normal-case text-ink-2">{build.sha7}</span>
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="text-ink-3">{t("deploy")}</span>
          <span className="text-ink-2">{build.isLocal ? t("local") : build.deployStamp}</span>
        </span>
        <ThemeToggle />
        <LocaleSwitch />
      </div>
    </aside>
  );
}
