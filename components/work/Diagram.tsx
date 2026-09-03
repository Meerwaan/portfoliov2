import { DiagramMotion } from "./DiagramMotion";

/**
 * Architecture diagram. The SVG (authored by us in content/<slug>/diagram.svg) is server-rendered so it is
 * in the HTML; DiagramMotion attaches the scroll-driven drawing only when the diagram approaches the viewport,
 * which keeps GSAP out of the initial JavaScript.
 */
export function Diagram({ svg, label, end, pin, className = "" }: { svg: string; label: string; end?: string; pin?: { selector: string; length: string }; className?: string }) {
  return (
    <div className={`diagram my-6 w-full overflow-x-auto text-ink [&>svg]:h-auto [&>svg]:w-full [&>svg]:min-w-[40rem] ${className}`}>
      <div role="img" aria-label={label} data-diagram dangerouslySetInnerHTML={{ __html: svg }} />
      <DiagramMotion end={end} pin={pin} />
    </div>
  );
}
