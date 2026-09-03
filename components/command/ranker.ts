import type { SearchEntry } from "./types";

export function normalize(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

const TYPE_ORDER: Record<SearchEntry["type"], number> = { project: 0, page: 1, lab: 2, section: 3 };

/**
 * Tiny deterministic scorer: exact/prefix title matches dominate, then keywords, stack, subtitle, body.
 * Ties fall back to entry type then declared order. No dependency, under 60 lines.
 */
export function rank(entries: SearchEntry[], rawQuery: string, limit = 12): SearchEntry[] {
  const tokens = normalize(rawQuery).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return [];
  const scored = entries
    .map((e) => {
      const title = normalize(e.title);
      const keywords = e.keywords.map(normalize);
      const stack = (e.stack ?? []).map(normalize);
      const subtitle = normalize(e.subtitle ?? "");
      const body = normalize(e.body ?? "");
      let score = 0;
      for (const token of tokens) {
        let hit = 0;
        if (title === token) hit = Math.max(hit, 12);
        else if (title.startsWith(token)) hit = Math.max(hit, 8);
        else if (title.includes(token)) hit = Math.max(hit, 6);
        if (keywords.some((k) => k === token || k.startsWith(token))) hit = Math.max(hit, 5);
        if (stack.some((s) => s.includes(token))) hit = Math.max(hit, 4);
        if (subtitle.includes(token)) hit = Math.max(hit, 3);
        if (body.includes(token)) hit = Math.max(hit, 1);
        if (hit === 0) return { e, score: -1 };
        score += hit;
      }
      score -= Math.min(2, title.length / 40);
      return { e, score };
    })
    .filter((s) => s.score >= 0)
    .sort((a, b) => b.score - a.score || TYPE_ORDER[a.e.type] - TYPE_ORDER[b.e.type] || a.e.order - b.e.order);
  return scored.slice(0, limit).map((s) => s.e);
}
