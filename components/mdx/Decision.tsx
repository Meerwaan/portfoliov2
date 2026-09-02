import type { ReactNode } from "react";

/** Architecture decision record block: title, the choice, and why. */
export function Decision({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="my-10 border-l border-rule pl-5">
      <h3 className="font-display text-xl font-medium text-ink">{title}</h3>
      <div className="mt-2 text-ink-2 [&>p]:my-3">{children}</div>
    </section>
  );
}
