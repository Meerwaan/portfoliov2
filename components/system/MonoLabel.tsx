import type { ElementType, ReactNode } from "react";

export function MonoLabel({
  as = "span",
  children,
  className = "",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  // Cast: @types/react 19.2 + TS 5.9 collapse the children prop of a generic ElementType tag to `never`.
  const Tag = as as "span";
  return <Tag className={`mono-label ${className}`}>{children}</Tag>;
}
