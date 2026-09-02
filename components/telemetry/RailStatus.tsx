"use client";

import { useTranslations } from "next-intl";
import { LiveDot } from "@/components/system/LiveDot";
import { useTelemetry } from "./TelemetryProvider";

/** STATUS · REGION · RTT, hydrated from the client probe. */
export function RailStatus({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("rail");
  const { state, rtt, region } = useTelemetry();
  const label = state === "live" ? t("live") : state === "degraded" ? t("degraded") : t("probing");
  const regionLabel = region ? (region === "local" ? t("local") : region) : null;

  if (compact) {
    return (
      <span className="mono-label inline-flex items-center gap-2 text-ink-2" aria-live="polite">
        <LiveDot state={state} />
        <span>{label}</span>
        {rtt !== null && <span className="normal-case text-ink-3">{rtt}ms</span>}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-5" aria-live="polite">
      <span className="inline-flex items-center gap-2">
        <LiveDot state={state} />
        <span className="text-ink-3">{t("status")}</span>
        <span className={state === "live" ? "text-signal" : "text-ink-2"}>{label}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="text-ink-3">{t("region")}</span>
        <span className="text-ink-2">{regionLabel ?? "-"}</span>
      </span>
      <span className="inline-flex items-center gap-2">
        <span className="text-ink-3">{t("rtt")}</span>
        <span className={`tabular normal-case ${rtt !== null ? "text-signal" : "text-ink-2"}`}>
          {rtt !== null ? `${rtt}ms` : "-"}
        </span>
      </span>
    </span>
  );
}
