"use client";

import { Command } from "cmdk";
import { useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { applyTheme } from "@/lib/theme/theme";
import { providers } from "./providers";
import { useCommand } from "./CommandStore";
import { isAsyncIterable, type CommandContext, type CommandEvent, type CommandGroup, type CommandItem } from "./types";

const GROUP_ORDER: CommandGroup[] = ["systems", "lab", "pages", "sections", "actions"];
const ROUTE_SHORTCUTS = ["/", "/work", "/lab", "/about", "/contact"] as const;

type Answer = { text: string; citations: { href: string; title: string }[]; done: boolean; error?: string };

export function CommandBar() {
  const { isOpen, close, query, setQuery } = useCommand();
  const t = useTranslations("command");
  const tWork = useTranslations("work");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [items, setItems] = useState<CommandItem[]>([]);
  // cmdk keeps a stale selection when the item list is replaced asynchronously; the selection is owned here
  // and falls back to the first visible item, so Enter always has a target.
  const [selectedRaw, setSelectedRaw] = useState("");
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const tAny = t as unknown as (key: string) => string;
  const tWorkAny = tWork as unknown as (key: string) => string;

  const ctx = useMemo<CommandContext>(
    () => ({
      locale,
      pathname,
      close,
      navigate: (href) => {
        close();
        if (/^https?:/.test(href) || href.endsWith(".pdf")) window.open(href, "_blank", "noopener");
        else router.push(href);
      },
      setTheme: (theme) => {
        applyTheme(theme);
        close();
      },
      switchLocale: (next) => {
        close();
        router.replace(pathname, { locale: next });
      },
      copy: async (text) => {
        await navigator.clipboard.writeText(text);
        setNotice(tAny("copied"));
        window.setTimeout(() => setNotice(null), 1400);
      },
      t: (key) => (key.startsWith("status.") ? tWorkAny(key) : tAny(key)),
    }),
    [locale, pathname, router, close, tAny, tWorkAny],
  );

  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    let alive = true;
    (async () => {
      const matched = providers.filter((p) => p.matches(query, ctx)).sort((a, b) => a.priority - b.priority);
      const collected: CommandItem[] = [];
      let stream: AsyncIterable<CommandEvent> | null = null;
      for (const provider of matched) {
        try {
          const result = provider.run(query, ctx, controller.signal);
          if (isAsyncIterable(result)) {
            stream = result;
            continue;
          }
          collected.push(...(await result).items);
        } catch {
          /* a failing provider must not break the bar */
        }
      }
      if (!alive) return;
      setItems(collected);
      if (!stream) {
        setAnswer(null);
        return;
      }
      const state: Answer = { text: "", citations: [], done: false };
      setAnswer({ ...state });
      for await (const event of stream) {
        if (!alive) return;
        if (event.type === "chunk") state.text += event.text;
        else if (event.type === "citation") state.citations.push({ href: event.href, title: event.title });
        else if (event.type === "error") state.error = event.message;
        else if (event.type === "done") state.done = true;
        setAnswer({ ...state, citations: [...state.citations] });
      }
    })();
    return () => {
      alive = false;
      controller.abort();
    };
  }, [query, isOpen, ctx]);

  const grouped = useMemo(() => {
    const map = new Map<CommandGroup, CommandItem[]>();
    for (const item of items) map.set(item.group, [...(map.get(item.group) ?? []), item]);
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ group: g, items: (map.get(g) ?? []).sort((a, b) => b.score - a.score) }));
  }, [items]);

  const firstId = grouped[0]?.items[0]?.id ?? "";
  const selected = items.some((item) => item.id === selectedRaw) ? selectedRaw : firstId;

  function select(item: CommandItem) {
    if (item.run) void item.run(ctx);
    else if (item.href) ctx.navigate(item.href);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if ((e.metaKey || e.ctrlKey) && /^[1-5]$/.test(e.key)) {
      e.preventDefault();
      ctx.navigate(ROUTE_SHORTCUTS[Number(e.key) - 1]);
      return;
    }
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      const item = items.find((i) => i.id === selected);
      if (item) {
        e.preventDefault();
        select(item);
      }
    }
  }

  return (
    <Command.Dialog
      open={isOpen}
      onOpenChange={(next) => (next ? undefined : close())}
      label={t("label")}
      shouldFilter={false}
      loop
      value={selected}
      onValueChange={setSelectedRaw}
      onKeyDown={onKeyDown}
      overlayClassName="command-overlay"
      contentClassName="command-dialog"
    >
      <div className="flex h-14 items-center gap-3 border-b border-rule px-4">
        <span aria-hidden="true" className="font-mono text-ink-3">
          &gt;
        </span>
        <Command.Input
          value={query}
          onValueChange={setQuery}
          placeholder={t("placeholder")}
          autoFocus
          className="min-w-0 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-3"
        />
        <kbd className="mono-label rounded-sm border border-rule px-1.5 py-0.5 text-ink-3">esc</kbd>
      </div>

      {answer && (
        <div className="border-b border-rule px-4 py-4 text-ink" aria-live="polite">
          <p className="whitespace-pre-wrap">{answer.text || (answer.done ? "" : "…")}</p>
          {answer.error && <p className="mono-label mt-2 text-ink-3">{answer.error}</p>}
          {answer.citations.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-3">
              {answer.citations.map((c) => (
                <li key={c.href}>
                  <button type="button" onClick={() => ctx.navigate(c.href)} className="mono-label border-b border-rule-strong text-ink-2 hover:border-signal hover:text-signal">
                    {c.title}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <Command.List className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
        <Command.Empty className="px-3 py-10 text-center">
          <span className="mono-label text-ink-3">{t("empty")}</span>
        </Command.Empty>
        {grouped.map(({ group, items }) => (
          <Command.Group key={group} heading={t(`groups.${group}`)}>
            {items.map((item) => (
              <Command.Item key={item.id} value={item.id} onSelect={() => select(item)} className="command-item">
                <span className="flex min-w-0 flex-col">
                  <span className="truncate font-display text-base text-ink">{item.title}</span>
                  {item.subtitle && <span className="truncate text-sm text-ink-2">{item.subtitle}</span>}
                </span>
                {item.meta && <span className="mono-label shrink-0 text-ink-3">{item.meta}</span>}
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>

      <div className="mono-label flex items-center justify-between gap-4 border-t border-rule px-4 py-2 text-ink-3">
        <span className="flex gap-4">
          <span>↑↓ {t("hints.navigate")}</span>
          <span>↵ {t("hints.open")}</span>
          <span className="hidden sm:inline">&gt; {t("hints.actions")}</span>
          <span className="hidden sm:inline">go {t("hints.go")}</span>
        </span>
        <span className="text-signal" aria-live="polite">
          {notice ?? `${items.length}`}
        </span>
      </div>
    </Command.Dialog>
  );
}
