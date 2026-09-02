import type { MDXComponents } from "mdx/types";
import type { ReactNode } from "react";
import { Callout } from "./Callout";
import { Figure } from "./Figure";
import { Decision } from "./Decision";

/** Components available inside case-study and lab MDX. Server components only: no client JS ships for prose. */
export const mdxComponents: MDXComponents = {
  h2: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h2 id={id} className="mt-section-sm scroll-mt-24 font-display text-2xl font-medium text-ink first:mt-0">
      <a href={`#${id}`} className="no-underline hover:text-signal">
        {children}
      </a>
    </h2>
  ),
  h3: ({ children, id }: { children?: ReactNode; id?: string }) => (
    <h3 id={id} className="mt-10 scroll-mt-24 font-display text-xl font-medium text-ink">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => <p className="my-5 text-ink-2">{children}</p>,
  ul: ({ children }: { children?: ReactNode }) => <ul className="my-5 list-disc space-y-2 pl-5 text-ink-2 marker:text-ink-3">{children}</ul>,
  ol: ({ children }: { children?: ReactNode }) => <ol className="my-5 list-decimal space-y-2 pl-5 text-ink-2 marker:text-ink-3">{children}</ol>,
  li: ({ children }: { children?: ReactNode }) => <li className="pl-1">{children}</li>,
  strong: ({ children }: { children?: ReactNode }) => <strong className="font-medium text-ink">{children}</strong>,
  a: ({ children, href }: { children?: ReactNode; href?: string }) => (
    <a href={href} className="border-b border-rule-strong text-ink transition-colors duration-(--dur-1) hover:border-signal hover:text-signal" rel={href?.startsWith("http") ? "noopener" : undefined} target={href?.startsWith("http") ? "_blank" : undefined}>
      {children}
    </a>
  ),
  blockquote: ({ children }: { children?: ReactNode }) => (
    <blockquote className="my-8 border-l-2 border-signal pl-5 text-lg text-ink">{children}</blockquote>
  ),
  hr: () => <hr className="my-12 border-rule" />,
  code: ({ children, className }: { children?: ReactNode; className?: string }) =>
    className ? (
      <code className={className}>{children}</code>
    ) : (
      <code className="rounded-sm bg-paper-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink ring-1 ring-rule">{children}</code>
    ),
  pre: ({ children, ...rest }: { children?: ReactNode; [k: string]: unknown }) => (
    <pre {...rest} className="code-block">
      {children}
    </pre>
  ),
  table: ({ children }: { children?: ReactNode }) => (
    <div className="my-8 overflow-x-auto">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  ),
  th: ({ children }: { children?: ReactNode }) => <th className="mono-label border-b border-rule-strong py-2 pr-6 text-left font-normal text-ink-3">{children}</th>,
  td: ({ children }: { children?: ReactNode }) => <td className="border-b border-rule py-3 pr-6 align-top text-ink-2">{children}</td>,
  Callout,
  Figure,
  Decision,
};
