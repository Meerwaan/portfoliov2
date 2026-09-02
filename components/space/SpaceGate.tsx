"use client";

import dynamic from "next/dynamic";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { SpaceItem } from "./types";

type Mode = "fallback" | "strip" | "scene";

/** Lets next/dynamic's loading state render the server-built fallback without re-sending the images. */
const PlaceholderContext = createContext<ReactNode>(null);
function Placeholder() {
  return <>{useContext(PlaceholderContext)}</>;
}

const SpaceScene = dynamic(() => import("./SpaceScene"), { ssr: false, loading: Placeholder });

function hasWebGL2(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true });
    if (!gl) return false;
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function decide(): Mode {
  if (process.env.NEXT_PUBLIC_SPACE === "off") return "fallback";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "fallback";
  const nav = navigator as Navigator & { deviceMemory?: number };
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 47.9375rem)").matches;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  if (coarse || narrow || lowMemory) return "strip";
  if (!hasWebGL2()) return "fallback";
  return "scene";
}

/**
 * Chooses between the 3D scene, the 2D strip and the static fallback. The server always renders the fallback;
 * the scene chunk is only requested once the section is within one viewport and the page has finished loading.
 */
export function SpaceGate({ items, fallback, strip }: { items: SpaceItem[]; fallback: ReactNode; strip: ReactNode }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<Mode>("fallback");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let decided: Mode | null = null;
    let near = false;
    let loaded = document.readyState === "complete";
    // Scroll intent: the hero fills the first viewport, so nobody sees the stage without scrolling. Waiting for
    // the first scroll keeps three.js out of the load phase (and out of Lighthouse's TBT window) at no visible cost.
    let intent = window.scrollY > 0;
    let done = false;

    const settle = (next: Mode) => {
      done = true;
      cleanup();
      if (next !== "fallback") setMode(next);
    };
    const check = () => {
      if (done) return;
      if (decided === null) decided = decide();
      if (decided !== "scene") return settle(decided);
      if (near && loaded && intent) settle("scene");
    };
    const onIntent = () => {
      intent = true;
      check();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        near = entry.isIntersecting;
        check();
      },
      { rootMargin: "100%" },
    );
    const onLoad = () => {
      loaded = true;
      check();
    };
    const cleanup = () => {
      observer.disconnect();
      window.removeEventListener("load", onLoad);
      window.removeEventListener("scroll", onIntent);
    };

    observer.observe(host);
    if (!loaded) window.addEventListener("load", onLoad, { once: true });
    if (!intent) window.addEventListener("scroll", onIntent, { once: true, passive: true });
    return cleanup;
  }, []);

  return (
    <PlaceholderContext.Provider value={fallback}>
      <div ref={hostRef} data-space-mode={mode}>
        {mode === "scene" ? <SpaceScene items={items} /> : mode === "strip" ? strip : fallback}
      </div>
    </PlaceholderContext.Provider>
  );
}
