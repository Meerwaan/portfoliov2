import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "@/lib/site";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png";

type Card = {
  /** Big line (page or project title). Defaults to the site name. */
  title?: string;
  /** Supporting sentence, ≤ 2 lines. */
  subtitle: string;
  /** Mono meta segments rendered on the bottom rail (route, status, period...). */
  meta: string[];
  /** Whether the live dot is shown (systems in production, or the site itself). */
  live?: boolean;
  locale: "fr" | "en";
};

const PAPER = "#f6f5f1";
const INK = "#111210";
const INK_2 = "#4b4b47";
const INK_3 = "#6f6f69";
const RULE = "#dddcd6";
const SIGNAL = "#0a5bff";

async function fonts() {
  const dir = path.join(process.cwd(), "assets", "fonts");
  const [display, mono] = await Promise.all([
    readFile(path.join(dir, "CabinetGrotesk-Bold.otf")),
    readFile(path.join(dir, "CommitMono-400.ttf")),
  ]);
  return [
    { name: "Cabinet", data: display, weight: 700 as const, style: "normal" as const },
    { name: "Commit", data: mono, weight: 400 as const, style: "normal" as const },
  ];
}

/** Paper card shared by every route: name, title, one sentence, and a real mono rail. */
export async function ogCard(card: Card) {
  const title = card.title ?? site.name;
  const showName = card.title !== undefined;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          color: INK,
          padding: "56px 64px 0",
          fontFamily: "Cabinet",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: "Commit", fontSize: 22, color: INK_3, letterSpacing: 1 }}>
          <span>{showName ? site.name.toUpperCase() : "MWN"}</span>
          <span>{site.url.replace(/^https?:\/\//, "")}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: showName ? 96 : 116, lineHeight: 1, letterSpacing: -4, fontWeight: 700 }}>{title}</div>
          <div style={{ fontSize: 34, lineHeight: 1.3, color: INK_2, maxWidth: 980 }}>{card.subtitle}</div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
            height: 72,
            borderTop: `1px solid ${RULE}`,
            fontFamily: "Commit",
            fontSize: 20,
            color: INK_3,
            letterSpacing: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {card.live && <span style={{ width: 14, height: 14, borderRadius: 7, background: SIGNAL }} />}
          {card.meta.map((m, i) => (
            <span key={i} style={{ color: i === 0 && card.live ? SIGNAL : INK_3 }}>
              {m}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...OG_SIZE, fonts: await fonts() },
  );
}
