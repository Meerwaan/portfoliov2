"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ViewTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { LiveDot } from "@/components/system/LiveDot";
import type { Role, Status } from "@/lib/content/schema";
import { formatPeriod, type ProjectCard } from "./labels";

const ROLES: Role[] = ["founder", "freelance", "employee", "study"];
const STATUSES: Status[] = ["production", "delivered", "building"];

function normalize(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

export function WorkIndex({ projects }: { projects: ProjectCard[] }) {
  const t = useTranslations("work");
  const locale = useLocale();
  const params = useSearchParams();
  const [role, setRole] = useState<Role | null>((params.get("role") as Role) || null);
  const [status, setStatus] = useState<Status | null>((params.get("status") as Status) || null);
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [active, setActive] = useState<string | null>(projects[0]?.slug ?? null);

  // Keep the URL shareable without a server round-trip.
  useEffect(() => {
    const next = new URLSearchParams();
    if (role) next.set("role", role);
    if (status) next.set("status", status);
    if (query) next.set("q", query);
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [role, status, query]);

  const filtered = useMemo(() => {
    const q = normalize(query.trim());
    return projects.filter((p) => {
      if (role && p.role !== role) return false;
      if (status && p.status !== status) return false;
      if (!q) return true;
      const hay = normalize([p.title, p.oneLiner, ...p.stack, ...p.keywords].join(" "));
      return q.split(/\s+/).every((token) => hay.includes(token));
    });
  }, [projects, role, status, query]);

  const shown = filtered.find((p) => p.slug === active) ?? filtered[0] ?? null;
  const toggleRole = useCallback((r: Role) => setRole((cur) => (cur === r ? null : r)), []);
  const toggleStatus = useCallback((s: Status) => setStatus((cur) => (cur === s ? null : s)), []);

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <div className="flex flex-col gap-4 border-b border-rule pb-6 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <FilterRow label={t("filters.role")}>
              {ROLES.map((r) => (
                <FilterButton key={r} pressed={role === r} onClick={() => toggleRole(r)}>
                  {t(`role.${r}`)}
                </FilterButton>
              ))}
            </FilterRow>
            <FilterRow label={t("filters.status")}>
              {STATUSES.map((s) => (
                <FilterButton key={s} pressed={status === s} onClick={() => toggleStatus(s)}>
                  {t(`status.${s}`)}
                </FilterButton>
              ))}
            </FilterRow>
          </div>
          <label className="flex items-center gap-2 border-b border-rule-strong pb-1 focus-within:border-signal">
            <span className="sr-only">{t("filters.search")}</span>
            <span aria-hidden="true" className="font-mono text-ink-3">&gt;</span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("filters.searchPlaceholder")}
              className="w-48 bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>

        <p className="sr-only" aria-live="polite">
          {t("count", { count: filtered.length })}
        </p>

        {filtered.length === 0 ? (
          <p className="py-16 text-ink-2">{t("empty")}</p>
        ) : (
          <ol className="divide-y divide-rule">
            {filtered.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/work/${p.slug}`}
                  onMouseEnter={() => setActive(p.slug)}
                  onFocus={() => setActive(p.slug)}
                  className={`group grid gap-3 py-6 transition-colors duration-(--dur-2) md:grid-cols-[6rem_1fr_auto] md:items-baseline ${
                    shown?.slug === p.slug ? "text-ink" : "text-ink"
                  }`}
                >
                  <span className="mono-label text-ink-3">{p.node}</span>
                  <span className="flex flex-col gap-2">
                    <span className="flex items-baseline gap-3">
                      <span className="font-display text-2xl font-medium group-hover:text-signal">{p.title}</span>
                      <ArrowUpRight size={18} className="translate-y-0.5 text-ink-3 opacity-0 transition-opacity duration-(--dur-1) group-hover:opacity-100 group-hover:text-signal" />
                    </span>
                    <span className="text-ink-2">{p.oneLiner}</span>
                    {p.hero && (
                      <span className="mt-2 block overflow-hidden rounded-md border border-rule lg:hidden">
                        <Image src={p.hero.src} alt={p.hero.alt} width={p.hero.width} height={p.hero.height} sizes="(min-width: 64rem) 0px, 100vw" placeholder={p.hero.blurDataURL ? "blur" : "empty"} blurDataURL={p.hero.blurDataURL} className="h-auto w-full" />
                      </span>
                    )}
                    {!p.hero && p.screensNote && <span className="mt-1 text-sm text-ink-3 lg:hidden">{p.screensNote}</span>}
                    <span className="mono-label mt-1 flex flex-wrap gap-x-4 gap-y-1 text-ink-3">
                      <span>{t(`role.${p.role}`)}</span>
                      <span>{formatPeriod(p.period, locale)}</span>
                      <span className="normal-case tracking-normal">{p.stack.slice(0, 4).join(" · ")}</span>
                    </span>
                  </span>
                  <span className="mono-label inline-flex items-center gap-2 text-ink-2 md:justify-self-end">
                    {p.status === "production" && <LiveDot state="live" />}
                    <span className={p.status === "production" ? "text-signal" : undefined}>{t(`status.${p.status}`)}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </div>

      <aside className="hidden lg:col-span-5 lg:block" aria-hidden="true">
        <div className="sticky top-24">
          {shown?.hero ? (
            <ViewTransition name={`screen-${shown.slug}`} share="screen" default="none">
              <div className="overflow-hidden rounded-md border border-rule bg-paper-2">
                <Image key={shown.slug} src={shown.hero.src} alt="" width={shown.hero.width} height={shown.hero.height} sizes="40vw" placeholder={shown.hero.blurDataURL ? "blur" : "empty"} blurDataURL={shown.hero.blurDataURL} className="h-auto w-full" />
              </div>
            </ViewTransition>
          ) : shown ? (
            <div className="flex aspect-[16/10] flex-col justify-end gap-3 rounded-md border border-dashed border-rule-strong p-6">
              <span className="mono-label text-ink-3">{shown.screensNote ? t("noScreen") : t("screenPending")}</span>
              {shown.screensNote && <span className="max-w-[38ch] text-sm text-ink-2">{shown.screensNote}</span>}
            </div>
          ) : null}
          {shown && (
            <p className="mono-label mt-3 text-ink-3">
              {shown.node} · {shown.title}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1" role="group" aria-label={label}>
      <span className="mono-label mr-2 text-ink-3">{label}</span>
      {children}
    </div>
  );
}

function FilterButton({ pressed, onClick, children }: { pressed: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={`rounded-sm px-2 py-0.5 text-sm transition-colors duration-(--dur-1) ${
        pressed ? "bg-signal-soft text-signal" : "text-ink-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
