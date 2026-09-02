"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("error");
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <section className="container-page flex min-h-[calc(100svh-var(--spacing-nav))] flex-col justify-center gap-6 py-section">
      <p className="mono-label text-ink-3">RUNTIME_ERROR{error.digest ? ` · ${error.digest}` : ""}</p>
      <h1 className="font-display text-3xl font-medium">{t("title")}</h1>
      <button
        type="button"
        onClick={reset}
        className="mono-label w-fit border-b border-ink pb-1 hover:border-signal hover:text-signal"
      >
        {t("retry")}
      </button>
    </section>
  );
}
