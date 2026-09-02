import type { ReactNode } from "react";

/** A short aside. `label` is the only mono element allowed in prose (e.g. "CE QUI A CASSÉ"). */
export function Callout({ label, children }: { label: string; children: ReactNode }) {
  return (
    <aside className="my-10 grid gap-3 border-t border-rule-strong pt-4 md:grid-cols-[10rem_1fr]">
      <p className="mono-label text-ink-3">{label}</p>
      <div className="text-ink [&>p]:my-0 [&>p+p]:mt-3">{children}</div>
    </aside>
  );
}
