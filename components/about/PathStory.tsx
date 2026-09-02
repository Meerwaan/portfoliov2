import { getProject, getProjectDiagram, getStory } from "@/lib/content/loader";
import type { Locale } from "@/i18n/routing";
import { PathStoryClient, type StoryItem } from "./PathStoryClient";

/** Resolves each step's proof (a real capture or an architecture diagram) on the server. */
export async function PathStory({ locale, eyebrow }: { locale: Locale; eyebrow: string }) {
  const { steps } = await getStory();
  const items: StoryItem[] = await Promise.all(
    steps.map(async (s) => {
      let proof: StoryItem["proof"] = { kind: "none" };
      if (s.proof.kind === "screen") {
        const p = await getProject(s.proof.project, locale).catch(() => null);
        const shot = p?.screenshots.find((x) => x.id === (s.proof as { id: string }).id) ?? p?.hero ?? null;
        if (shot) proof = { kind: "screen", src: shot.src, width: shot.width, height: shot.height, blurDataURL: shot.blurDataURL, alt: shot.alt };
      } else if (s.proof.kind === "diagram") {
        const svg = await getProjectDiagram(s.proof.project);
        if (svg) proof = { kind: "diagram", svg };
      }
      return {
        id: s.id,
        from: s.from,
        to: s.to,
        kind: s.kind,
        org: s.org,
        place: s.place,
        role: s.role[locale],
        line: s.line[locale],
        stack: s.stack,
        href: s.href,
        proof,
      };
    }),
  );
  return <PathStoryClient items={items} eyebrow={eyebrow} />;
}
