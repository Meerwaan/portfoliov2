import Image from "next/image";
import { ViewTransition } from "react";
import { getLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import type { Project } from "@/lib/content/loader";
import { StatusChip } from "./StatusChip";
import { formatPeriod } from "./labels";

export async function CaseHero({ project }: { project: Project }) {
  const t = await getTranslations("work");
  const locale = await getLocale();
  return (
    <header className="container-page grid gap-10 pt-16 pb-12 md:pt-24 lg:grid-cols-12 lg:gap-12">
      <div className="flex flex-col gap-6 lg:col-span-5">
        <p className="mono-label text-ink-3">{project.node}</p>
        <h1 className="font-display text-3xl font-medium text-ink">{project.title}</h1>
        <p className="max-w-[40ch] text-xl text-ink-2">{project.oneLiner}</p>
        <dl className="mt-2 grid grid-cols-[7rem_1fr] gap-x-4 gap-y-3 border-t border-rule pt-5 text-sm">
          <dt className="mono-label text-ink-3">{t("meta.role")}</dt>
          <dd className="text-ink">{project.roleLabel}</dd>
          <dt className="mono-label text-ink-3">{t("meta.period")}</dt>
          <dd className="text-ink tabular">{formatPeriod(project.period, locale)}</dd>
          <dt className="mono-label text-ink-3">{t("meta.status")}</dt>
          <dd>
            <StatusChip status={project.status} />
          </dd>
          <dt className="mono-label text-ink-3">{t("meta.stack")}</dt>
          <dd className="font-mono text-mono text-ink-2">{project.stack.join(" · ")}</dd>
          {(project.links.live || project.links.repo) && (
            <>
              <dt className="mono-label text-ink-3">{t("meta.links")}</dt>
              <dd className="flex flex-wrap gap-4">
                {project.links.live && (
                  <a href={project.links.live} target="_blank" rel="noopener" className="inline-flex items-center gap-1 border-b border-rule-strong text-ink hover:border-signal hover:text-signal">
                    {t("meta.live")} <ArrowUpRight size={14} />
                  </a>
                )}
                {project.links.repo && (
                  <a href={project.links.repo} target="_blank" rel="noopener" className="inline-flex items-center gap-1 border-b border-rule-strong text-ink hover:border-signal hover:text-signal">
                    {t("meta.repo")} <ArrowUpRight size={14} />
                  </a>
                )}
              </dd>
            </>
          )}
        </dl>
      </div>
      <div className="lg:col-span-7">
        {project.hero ? (
          <ViewTransition name={`screen-${project.slug}`} share="screen" default="none">
            <figure className="overflow-hidden rounded-md border border-rule bg-paper-2">
              <Image src={project.hero.src} alt={project.hero.alt} width={project.hero.width} height={project.hero.height} priority sizes="(min-width: 64rem) 58vw, 100vw" placeholder={project.hero.blurDataURL ? "blur" : "empty"} blurDataURL={project.hero.blurDataURL} className="h-auto w-full" />
            </figure>
          </ViewTransition>
        ) : (
          <div className="flex aspect-[16/10] flex-col justify-end gap-3 rounded-md border border-dashed border-rule-strong p-6">
            <span className="mono-label text-ink-3">{project.screensNote ? t("noScreen") : t("screenPending")}</span>
            {project.screensNote && <p className="max-w-[44ch] text-ink-2">{project.screensNote}</p>}
          </div>
        )}
      </div>
    </header>
  );
}
