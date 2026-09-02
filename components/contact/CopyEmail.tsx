"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy } from "@phosphor-icons/react/ssr";

export function CopyEmail({ email }: { email: string }) {
  const t = useTranslations("contact");
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable: the mailto link above still works */
    }
  }
  return (
    <button type="button" onClick={copy} className="mono-label inline-flex w-fit items-center gap-2 text-ink-2 transition-colors duration-(--dur-1) hover:text-signal">
      <Copy size={14} />
      <span aria-live="polite" className={copied ? "text-signal" : undefined}>
        {copied ? t("copied") : t("copy")}
      </span>
    </button>
  );
}
