import type { Locale } from "@/i18n/routing";
import type { Theme } from "@/lib/theme/theme";

/**
 * Command bar contract. Phase 1 ships synchronous providers (navigation, search, actions).
 * Phase 2 adds an "ask" provider whose `run` returns an AsyncIterable<CommandEvent> fed by a streaming
 * route handler; the bar already knows how to render such a provider into an AnswerCard.
 */
export type CommandGroup = "systems" | "lab" | "pages" | "sections" | "actions";

export type CommandContext = {
  locale: Locale;
  pathname: string;
  navigate: (href: string) => void;
  setTheme: (theme: Theme) => void;
  switchLocale: (locale: Locale) => void;
  copy: (text: string) => Promise<void>;
  close: () => void;
  t: (key: string) => string;
};

export type CommandItem = {
  id: string;
  group: CommandGroup;
  title: string;
  subtitle?: string;
  /** Trailing mono meta (status, year, target route). */
  meta?: string;
  href?: string;
  run?: (ctx: CommandContext) => void | Promise<void>;
  /** Higher ranks first inside its group. */
  score: number;
};

export type CommandResult = { items: CommandItem[] };

export type CommandEvent =
  | { type: "chunk"; text: string }
  | { type: "citation"; href: string; title: string }
  | { type: "done" }
  | { type: "error"; message: string };

export interface CommandProvider {
  id: string;
  /** Lower runs first; results are concatenated. */
  priority: number;
  matches(query: string, ctx: CommandContext): boolean;
  run(query: string, ctx: CommandContext, signal: AbortSignal): CommandResult | Promise<CommandResult> | AsyncIterable<CommandEvent>;
}

export type SearchEntry = {
  id: string;
  type: "project" | "lab" | "page" | "section";
  title: string;
  subtitle?: string;
  href: string;
  keywords: string[];
  body?: string;
  status?: string;
  stack?: string[];
  order: number;
};

export type SearchIndex = { locale: string; generatedAt: string; entries: SearchEntry[] };

export function isAsyncIterable(value: unknown): value is AsyncIterable<CommandEvent> {
  return typeof value === "object" && value !== null && Symbol.asyncIterator in value;
}
