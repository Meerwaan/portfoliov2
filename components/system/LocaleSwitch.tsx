"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitch({ className = "" }: { className?: string }) {
  const t = useTranslations("locale");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const next = routing.locales.find((l) => l !== locale) ?? routing.defaultLocale;
  return (
    <button
      type="button"
      lang={next}
      aria-label={`${t("short")}: ${t("switchTo")}`}
      title={t("switchTo")}
      onClick={() => router.replace(pathname, { locale: next })}
      className={`mono-label text-ink-2 transition-colors duration-(--dur-1) hover:text-signal ${className}`}
    >
      {t("short")}
    </button>
  );
}
