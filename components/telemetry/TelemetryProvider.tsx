"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { LiveState } from "@/components/system/LiveDot";

export type Telemetry = {
  state: LiveState;
  /** Round-trip time to /api/ping in ms, measured client-side. */
  rtt: number | null;
  /** Vercel function region (e.g. "cdg1"), "local" in development. */
  region: string | null;
};

const initial: Telemetry = { state: "probing", rtt: null, region: null };
const TelemetryContext = createContext<Telemetry>(initial);

const INTERVAL_MS = 60_000;

export function TelemetryProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<Telemetry>(initial);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;

    async function probe() {
      const t0 = performance.now();
      try {
        const res = await fetch("/api/ping", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { region?: string };
        if (cancelled) return;
        setTelemetry({
          state: "live",
          rtt: Math.max(1, Math.round(performance.now() - t0)),
          region: data.region ?? "unknown",
        });
      } catch {
        if (!cancelled) setTelemetry((prev) => ({ ...prev, state: "degraded" }));
      }
    }

    function schedule() {
      window.clearInterval(timer);
      if (document.visibilityState === "visible") {
        timer = window.setInterval(probe, INTERVAL_MS);
      }
    }

    void probe();
    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  return <TelemetryContext.Provider value={telemetry}>{children}</TelemetryContext.Provider>;
}

export function useTelemetry() {
  return useContext(TelemetryContext);
}
