import "server-only";
import { createHighlighter, type Highlighter } from "shiki";

const LANGS = ["python", "typescript", "tsx", "javascript", "jsx"] as const;
export type CodeLang = (typeof LANGS)[number];

let highlighter: Promise<Highlighter> | null = null;

/** Highlights a code excerpt at build time with the same dual theme as the MDX code blocks (no client JS). */
export async function highlightCode(code: string, lang: CodeLang): Promise<string> {
  highlighter ??= createHighlighter({ themes: ["github-light-default", "github-dark-default"], langs: [...LANGS] });
  const hl = await highlighter;
  return hl.codeToHtml(code, { lang, themes: { light: "github-light-default", dark: "github-dark-default" }, defaultColor: false });
}
