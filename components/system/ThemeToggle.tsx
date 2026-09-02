"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { THEME_EVENT, applyTheme, resolveTheme, type Theme } from "@/lib/theme/theme";

function subscribe(onChange: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener(THEME_EVENT, onChange);
  mq.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(THEME_EVENT, onChange);
    mq.removeEventListener("change", onChange);
  };
}

const getSnapshot = (): Theme => resolveTheme();
const getServerSnapshot = (): Theme | null => null;

export function ThemeToggle({ className = "" }: { className?: string }) {
  const t = useTranslations("theme");
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      aria-pressed={isDark}
      aria-label={isDark ? t("toDay") : t("toNight")}
      title={isDark ? t("toDay") : t("toNight")}
      onClick={() => applyTheme(isDark ? "light" : "dark")}
      className={`mono-label inline-flex h-full items-center gap-2 text-ink-2 transition-colors duration-(--dur-1) hover:text-signal ${className}`}
    >
      <span
        aria-hidden="true"
        className="inline-block h-2 w-2 rounded-sm border border-current"
        style={{ background: isDark ? "currentColor" : "transparent" }}
      />
      <span>{theme === null ? " " : isDark ? t("night") : t("day")}</span>
    </button>
  );
}
