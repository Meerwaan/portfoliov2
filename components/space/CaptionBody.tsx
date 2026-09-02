import type { MouseEvent } from "react";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import { Link } from "@/i18n/navigation";
import { LiveDot } from "@/components/system/LiveDot";
import type { SpaceItem } from "./types";

/**
 * The caption of one screen: node id, title, one-liner, status chip and the real link to the case study.
 * Presentational only (no hooks) so the same markup serves the static fallback, the strip and the 3D overlay.
 */
export function CaptionBody({
  item,
  openLabel,
  statusLabel,
  onOpen,
}: {
  item: SpaceItem;
  openLabel: string;
  statusLabel: string;
  onOpen?: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  const live = item.status === "production";
  return (
    <div className="flex flex-col gap-2">
      <span className="mono-label text-ink-3">{item.node}</span>
      <h3 className="font-display text-2xl font-medium text-ink">{item.title}</h3>
      <p className="max-w-[40ch] text-ink-2">{item.oneLiner}</p>
      <span className="mono-label inline-flex items-center gap-2 text-ink-2">
        {live && <LiveDot state="live" />}
        <span className={live ? "text-signal" : undefined}>{statusLabel}</span>
      </span>
      <Link
        href={`/work/${item.slug}`}
        onClick={onOpen}
        className="group mt-1 inline-flex w-fit items-center gap-1 border-b border-rule-strong pb-0.5 text-ink transition-colors duration-(--dur-2) hover:border-signal hover:text-signal"
      >
        {openLabel}
        <ArrowRight size={16} className="transition-transform duration-(--dur-2) ease-(--ease-out) group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
