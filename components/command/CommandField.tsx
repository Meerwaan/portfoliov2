"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { useCommand } from "./CommandStore";

/**
 * Hero command input. It is a real form (GET /work?q=) so it works without JavaScript; with JavaScript,
 * clicking or typing hands the query over to the command palette.
 */
export function CommandField() {
  const t = useTranslations("hero");
  const locale = useLocale();
  const { open } = useCommand();
  const [value, setValue] = useState("");

  return (
    <form action={`/${locale}/work`} method="get" role="search" className="w-full max-w-3xl" onSubmit={(e) => { e.preventDefault(); open(value); }}>
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
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClick={() => open(value)}
          onKeyDown={(e) => {
            if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
              e.preventDefault();
              open(value + e.key);
            }
          }}
          placeholder={t("commandPlaceholder")}
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="mono-label hidden rounded-sm border border-rule px-1.5 py-0.5 text-ink-2 sm:inline-block">⌘K</kbd>
        <button type="submit" className="text-ink-3 hover:text-signal" aria-label={t("commandLabel")}>
          <MagnifyingGlass size={18} weight="regular" />
        </button>
      </div>
    </form>
  );
}
