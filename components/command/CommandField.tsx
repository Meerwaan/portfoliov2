"use client";

import { useLocale, useTranslations } from "next-intl";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";

/**
 * Hero command input. Phase 1 without the palette mounted: submits a plain GET to /work?q= so the field
 * works without JavaScript. The command palette (M2) intercepts focus and Enter and takes over.
 */
export function CommandField() {
  const t = useTranslations("hero");
  const locale = useLocale();
  return (
    <form action={`/${locale}/work`} method="get" role="search" className="w-full max-w-3xl">
      <label htmlFor="command" className="sr-only">
        {t("commandLabel")}
      </label>
      <div className="flex h-14 items-center gap-3 rounded-md border border-rule-strong bg-paper-2 px-4 transition-colors duration-(--dur-2) focus-within:border-signal">
        <span aria-hidden="true" className="font-mono text-ink-3">
          &gt;
        </span>
        <input
          id="command"
          name="q"
          type="search"
          autoComplete="off"
          spellCheck={false}
          placeholder={t("commandPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="mono-label hidden rounded-sm border border-rule px-1.5 py-0.5 text-ink-3 sm:inline-block">
          ⌘K
        </kbd>
        <button type="submit" className="text-ink-3 hover:text-signal" aria-label={t("commandLabel")}>
          <MagnifyingGlass size={18} weight="regular" />
        </button>
      </div>
    </form>
  );
}
