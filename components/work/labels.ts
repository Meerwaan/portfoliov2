import type { Role, Status } from "@/lib/content/schema";

export type ProjectCard = {
  slug: string;
  node: string;
  title: string;
  oneLiner: string;
  role: Role;
  status: Status;
  period: { from: string; to: string | null };
  stack: string[];
  keywords: string[];
  hero: { src: string; width: number; height: number; blurDataURL?: string; alt: string } | null;
  /** Why no capture is published, when hero is null. */
  screensNote?: string;
};

export function formatPeriod(period: { from: string; to: string | null }, locale: string): string {
  const year = (v: string) => v.slice(0, 4);
  if (!period.to) return locale === "fr" ? `${year(period.from)} à aujourd'hui` : `${year(period.from)} to date`;
  return year(period.from) === year(period.to) ? year(period.from) : `${year(period.from)}-${year(period.to)}`;
}
