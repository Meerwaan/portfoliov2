import type { SearchIndex } from "./types";

const cache = new Map<string, Promise<SearchIndex>>();

/** Fetches /search-index.<locale>.json once per session (generated at build by scripts/build-search-index.mts). */
export function loadSearchIndex(locale: string): Promise<SearchIndex> {
  let pending = cache.get(locale);
  if (!pending) {
    pending = fetch(`/search-index.${locale}.json`, { cache: "force-cache" }).then((res) => {
      if (!res.ok) throw new Error(`search index ${res.status}`);
      return res.json() as Promise<SearchIndex>;
    });
    pending.catch(() => cache.delete(locale));
    cache.set(locale, pending);
  }
  return pending;
}
