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
      aria-label={t("openCommand")}
      title={t("openCommand")}
      className="inline-flex h-8 items-center gap-2 rounded-sm px-2 text-ink-2 transition-colors duration-(--dur-1) hover:text-signal"
    >
      <MagnifyingGlass size={16} />
      <kbd className="mono-label hidden text-ink-3 md:inline">⌘K</kbd>
    </button>
  );
}
