import { site } from "@/lib/site";
import { loadSearchIndex } from "./index-client";
import { normalize, rank } from "./ranker";
import type { CommandContext, CommandItem, CommandProvider, SearchEntry } from "./types";

const GROUP_BY_TYPE: Record<SearchEntry["type"], CommandItem["group"]> = {
  project: "systems",
  lab: "lab",
  page: "pages",
  section: "sections",
};

function entryToItem(e: SearchEntry, score: number, ctx: CommandContext): CommandItem {
  const meta = e.type === "project" && e.status ? ctx.t(`status.${e.status}`) : e.type === "section" ? e.subtitle : e.href;
  return {
    id: e.id,
    group: GROUP_BY_TYPE[e.type],
    title: e.title,
    subtitle: e.type === "section" ? undefined : e.subtitle,
    meta,
    href: e.href,
    score,
  };
}

function actionItems(ctx: CommandContext): CommandItem[] {
  const other = ctx.locale === "fr" ? "en" : "fr";
  return [
    { id: "act:night", group: "actions", title: ctx.t("actions.night"), meta: "> night", score: 5, run: (c) => c.setTheme("dark") },
    { id: "act:day", group: "actions", title: ctx.t("actions.day"), meta: "> day", score: 5, run: (c) => c.setTheme("light") },
    { id: "act:locale", group: "actions", title: ctx.t("actions.locale"), meta: `> ${other}`, score: 4, run: (c) => c.switchLocale(other) },
    { id: "act:copy", group: "actions", title: ctx.t("actions.copyEmail"), meta: "> copy email", score: 3, run: (c) => c.copy(site.email) },
    { id: "act:cv", group: "actions", title: ctx.t("actions.cv"), meta: "> cv", score: 2, href: site.cvPath },
    { id: "act:top", group: "actions", title: ctx.t("actions.top"), meta: "> top", score: 1, run: () => window.scrollTo({ top: 0 }) },
  ];
}

const ALIASES: Record<string, string[]> = {
  "act:night": ["night", "nuit", "dark", "sombre", "theme"],
  "act:day": ["day", "jour", "light", "clair", "theme"],
  "act:locale": ["en", "fr", "english", "francais", "french", "lang", "langue"],
  "act:copy": ["copy", "email", "mail", "copier"],
  "act:cv": ["cv", "resume", "pdf"],
  "act:top": ["top", "haut"],
};

/** `> ...` : actions. Empty `>` lists them all. */
export const actionsProvider: CommandProvider = {
  id: "actions",
  priority: 0,
  matches: (q) => q.trimStart().startsWith(">"),
  run(query, ctx) {
    const q = normalize(query.trimStart().slice(1));
    const items = actionItems(ctx)
      .map((item) => {
        if (!q) return item;
        const aliases = ALIASES[item.id] ?? [];
        // Alias hits outrank title substrings so "> en" selects the locale switch, not "Passer en mode nuit".
        const score = aliases.includes(q) ? 30 : aliases.some((a) => a.startsWith(q)) ? 20 : normalize(item.title).includes(q) ? 10 : 0;
        return { ...item, score: score + item.score };
      })
      .filter((item) => !q || item.score > 10);
    return { items };
  },
};

/** `go <target>` : navigation to a page or a system. */
export const navigationProvider: CommandProvider = {
  id: "navigation",
  priority: 0,
  matches: (q) => /^go(\s|$)/i.test(q.trimStart()),
  async run(query, ctx) {
    const target = normalize(query.trimStart().replace(/^go\s*/i, ""));
    const index = await loadSearchIndex(ctx.locale);
    const candidates = index.entries.filter((e) => e.type === "page" || e.type === "project");
    const hits = target ? rank(candidates, target, 8) : candidates;
    return { items: hits.map((e, i) => entryToItem(e, 100 - i, ctx)) };
  },
};

/** Plain text : search across systems, lab, pages and sections. Empty query : suggestions. */
export const searchProvider: CommandProvider = {
  id: "search",
  priority: 1,
  matches: (q) => !q.trimStart().startsWith(">") && !/^go(\s|$)/i.test(q.trimStart()) && !q.trimStart().startsWith("?"),
  async run(query, ctx) {
    const index = await loadSearchIndex(ctx.locale);
    const q = query.trim();
    if (!q) {
      const suggestions = index.entries.filter((e) => e.type === "project" || (e.type === "page" && e.href !== "/"));
      return { items: suggestions.map((e, i) => entryToItem(e, 100 - i, ctx)) };
    }
    return { items: rank(index.entries, q).map((e, i) => entryToItem(e, 100 - i, ctx)) };
  },
};

/** `? question` : reserved for the phase-2 streaming answer provider. */
export const askPlaceholderProvider: CommandProvider = {
  id: "ask",
  priority: 0,
  matches: (q) => q.trimStart().startsWith("?"),
  run(_query, ctx) {
    return { items: [{ id: "ask:soon", group: "actions", title: ctx.t("askSoon"), meta: "?", score: 0 }] };
  },
};

export const providers: CommandProvider[] = [actionsProvider, navigationProvider, askPlaceholderProvider, searchProvider];
