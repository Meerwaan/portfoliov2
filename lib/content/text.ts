/** Plain-text helpers shared by the MDX renderer and the build scripts (no React, no Next imports). */

export type Heading = { depth: 2 | 3; text: string; id: string };

export function extractHeadings(source: string): Heading[] {
  const out: Heading[] = [];
  for (const line of source.split("\n")) {
    const m = /^(##|###)\s+(.+?)\s*$/.exec(line);
    if (!m) continue;
    const text = m[2].replace(/[`*_]/g, "");
    out.push({ depth: m[1].length as 2 | 3, text, id: slugify(text) });
  }
  return out;
}

/** Close enough to github-slugger (used by rehype-slug) for our headings. */
function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function stripMdx(source: string, max = 400): string {
  return source
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/^#+\s.*$/gm, " ")
    .replace(/[`*_>#[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
}
