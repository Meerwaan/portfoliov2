"use client";

import { Suspense, ViewTransition, useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";
import { Canvas, type RootState } from "@react-three/fiber";
import { Preload } from "@react-three/drei/core/Preload";
import { PerformanceMonitor } from "@react-three/drei/core/PerformanceMonitor";
import { MeshBasicMaterial, Vector3, type Camera, type Mesh, type PlaneGeometry } from "three";
import { useRouter } from "@/i18n/navigation";
import { CameraRig } from "./CameraRig";
import { Captions, applyCaptionProgress } from "./Captions";
import { ScreenPlane } from "./ScreenPlane";
import type { SpaceItem } from "./types";

type Rect = { left: number; top: number; width: number; height: number };
type Proxy = { slug: string; src: string; rect: Rect };

/** Screen-space bounding box of a plane: its four corners projected through the camera onto the canvas. */
function projectRect(mesh: Mesh, camera: Camera, canvas: HTMLCanvasElement): Rect | null {
  const { width, height } = (mesh.geometry as PlaneGeometry).parameters;
  const bounds = canvas.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return null;
  const corner = new Vector3();
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const [sx, sy] of [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ]) {
    corner.set((sx * width) / 2, (sy * height) / 2, 0).applyMatrix4(mesh.matrixWorld).project(camera);
    const x = bounds.left + ((corner.x + 1) / 2) * bounds.width;
    const y = bounds.top + ((1 - corner.y) / 2) * bounds.height;
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
  }
  if (!Number.isFinite(minX + minY + maxX + maxY)) return null;
  return { left: minX, top: minY, width: maxX - minX, height: maxY - minY };
}

/**
 * The pinned stage: a transparent WebGL canvas (unlit textured planes, demand rendering), the DOM captions
 * overlay, and the hand-off proxy that lets the browser morph a plane into the case-study hero.
 */
export default function SpaceScene({ items }: { items: SpaceItem[] }) {
  const router = useRouter();
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const captionElements = useRef<(HTMLLIElement | null)[]>([]);
  const meshes = useRef<(Mesh | null)[]>([]);
  const getState = useRef<(() => RootState) | null>(null);
  const [dpr, setDpr] = useState<number | [number, number]>([1, 1.5]);
  const [proxy, setProxy] = useState<Proxy | null>(null);

  const frameMaterial = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  useEffect(() => () => frameMaterial.dispose(), [frameMaterial]);

  // The frame colour follows the theme: read `--rule` at mount and again whenever the theme changes.
  useEffect(() => {
    const apply = () => {
      const rule = getComputedStyle(document.documentElement).getPropertyValue("--rule").trim();
      if (rule) frameMaterial.color.set(rule);
      getState.current?.().invalidate();
    };
    apply();
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", apply);
    return () => {
      observer.disconnect();
      scheme.removeEventListener("change", apply);
      document.body.style.cursor = "";
    };
  }, [frameMaterial]);

  const onProgress = useCallback((progress: number) => applyCaptionProgress(captionElements.current, progress, items.length), [items.length]);

  const open = useCallback(
    (index: number) => {
      const item = items[index];
      if (!item) return;
      const mesh = meshes.current[index];
      const state = getState.current?.();
      const rect = mesh && state ? projectRect(mesh, state.camera, state.gl.domElement) : null;
      if (!rect) {
        router.push(`/work/${item.slug}`);
        return;
      }
      setProxy({ slug: item.slug, src: item.texture, rect });
    },
    [items, router],
  );

  // Navigate once the proxy is in the DOM so the view transition can capture it as the shared "screen" element.
  useEffect(() => {
    if (proxy) router.push(`/work/${proxy.slug}`);
  }, [proxy, router]);

  const onCaptionOpen = useCallback(
    (event: MouseEvent<HTMLAnchorElement>, index: number) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
      event.preventDefault();
      open(index);
    },
    [open],
  );

  return (
    <>
      <div ref={stageRef} className="space-stage relative h-[calc(100svh-var(--spacing-nav))] w-full overflow-hidden">
        <Canvas
          aria-hidden="true"
          dpr={dpr}
          frameloop="demand"
          gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 38, near: 0.1, far: 60 }}
          onCreated={(state) => {
            getState.current = state.get;
          }}
        >
          <PerformanceMonitor bounds={() => [30, 60]} flipflops={1} onDecline={() => setDpr(1)}>
            <CameraRig count={items.length} stageRef={stageRef} progressRef={progressRef} onProgress={onProgress} />
            <Suspense fallback={null}>
              {items.map((item, index) => (
                <ScreenPlane
                  key={item.slug}
                  item={item}
                  index={index}
                  frameMaterial={frameMaterial}
                  meshRef={(mesh) => {
                    meshes.current[index] = mesh;
                  }}
                  onOpen={() => open(index)}
                />
              ))}
              <Preload all />
            </Suspense>
          </PerformanceMonitor>
        </Canvas>
        <Captions
          items={items}
          setElement={(index, el) => {
            captionElements.current[index] = el;
          }}
          onOpen={onCaptionOpen}
        />
      </div>
      {proxy && (
        <ViewTransition name={`screen-${proxy.slug}`} share="screen" default="none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proxy.src}
            alt=""
            aria-hidden="true"
            className="space-proxy rounded-md border border-rule"
            style={{ left: proxy.rect.left, top: proxy.rect.top, width: proxy.rect.width, height: proxy.rect.height }}
          />
        </ViewTransition>
      )}
    </>
  );
}
