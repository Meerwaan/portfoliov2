export type LiveState = "probing" | "live" | "degraded";

/** The only circle and the only pulse on the site. Renders semantic state, never decoration. */
export function LiveDot({ state, className = "" }: { state: LiveState; className?: string }) {
  return <span aria-hidden="true" data-state={state} className={`live-dot ${className}`} />;
}
