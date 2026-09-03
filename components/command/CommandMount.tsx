"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useCommand } from "./CommandStore";

const CommandBar = dynamic(() => import("./CommandBar").then((m) => m.CommandBar), { ssr: false });

/**
 * Keeps cmdk out of the initial bundle: the palette chunk loads on the first ⌘K / "/" / open() call,
 * or when the browser is idle, whichever comes first.
 */
export function CommandMount() {
  const { isOpen, open } = useCommand();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setReady(true);
        open("");
      } else if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setReady(true);
        open("");
      }
    };
    window.addEventListener("keydown", onKey);
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle
      ? window.requestIdleCallback(() => setReady(true), { timeout: 4000 })
      : window.setTimeout(() => setReady(true), 2500);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
    };
  }, [open]);

  if (!ready && !isOpen) return null;
  return <CommandBar />;
}
