import type { ElementType, ReactNode } from "react";

export function MonoLabel({
  as: Tag = "span",
  children,
  className = "",
}: {
  as?: ElementType;
  children: ReactNode;
  className?: string;
}) {
  return <Tag className={`mono-label ${className}`}>{children}</Tag>;
}
