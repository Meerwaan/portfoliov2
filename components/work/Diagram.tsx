import { DiagramMotion } from "./DiagramMotion";

/**
 * Architecture diagram. The SVG (authored by us in content/<slug>/diagram.svg) is server-rendered so it is
 * in the HTML; DiagramMotion attaches the scroll-driven drawing only when the diagram approaches the viewport,
 * which keeps GSAP out of the initial JavaScript.
 */
export function Diagram({ svg, label, end }: { svg: string; label: string; end?: string }) {
  return (
    <div className="diagram my-6 w-full overflow-x-auto text-ink [&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[40rem]">
      <div role="img" aria-label={label} data-diagram dangerouslySetInnerHTML={{ __html: svg }} />
      <DiagramMotion end={end} />
    </div>
  );
}
