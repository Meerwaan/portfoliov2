"use client";

import { useTranslations } from "next-intl";
import { MagnifyingGlass } from "@phosphor-icons/react/ssr";
import { useCommand } from "./CommandStore";

export function CommandTrigger() {
  const t = useTranslations("a11y");
  const { open } = useCommand();
  return (
    <button
      type="button"
      onClick={() => open("")}
      title={t("openCommand")}
      className="inline-flex h-8 items-center gap-2 rounded-sm px-2 text-ink-2 transition-colors duration-(--dur-1) hover:text-signal"
    >
      <MagnifyingGlass size={16} aria-hidden="true" />
      <span className="sr-only">{t("openCommand")}</span>
      <kbd className="mono-label hidden text-ink-3 md:inline" aria-hidden="true">⌘K</kbd>
    </button>
  );
}
