"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { CatmullRomCurve3, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CAMERA_DISTANCE, LOOK_DROP, planePosition } from "./layout";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/** Height of the sticky site header, so the pinned stage starts right under it. */
function navOffset(): number {
  const header = document.querySelector<HTMLElement>("body > header");
  return header && getComputedStyle(header).position === "sticky" ? header.offsetHeight : 0;
}

function buildCurves(count: number) {
  const stops: Vector3[] = [];
  const looks: Vector3[] = [];
  for (let i = 0; i < count; i++) {
    const [x, y, z] = planePosition(i);
    looks.push(new Vector3(x, y - LOOK_DROP, z));
    stops.push(new Vector3(x, y - LOOK_DROP, z + CAMERA_DISTANCE));
  }
  if (count === 1) {
    // A single plane: a short dolly-in instead of a path.
    stops.unshift(stops[0].clone().add(new Vector3(0, 0, 1.2)));
    looks.unshift(looks[0].clone());
  }
  return {
    camera: new CatmullRomCurve3(stops, false, "catmullrom", 0.5),
    look: new CatmullRomCurve3(looks, false, "catmullrom", 0.5),
  };
}

/**
 * Moves the camera along a Catmull-Rom curve through a point in front of each plane.
 * Progress comes from a pinned, scrubbed ScrollTrigger; every update invalidates one frame,
 * and useFrame keeps asking for frames only until position and aim have converged.
 */
export function CameraRig({
  count,
  stageRef,
  progressRef,
  onProgress,
}: {
  count: number;
  stageRef: RefObject<HTMLDivElement | null>;
  progressRef: RefObject<number>;
  onProgress: (progress: number) => void;
}) {
  const camera = useThree((state) => state.camera);
  const invalidate = useThree((state) => state.invalidate);
  const curves = useMemo(() => buildCurves(count), [count]);
  const targetPosition = useRef(new Vector3());
  const targetLook = useRef(new Vector3());
  const currentLook = useRef(new Vector3());

  useLayoutEffect(() => {
    curves.camera.getPoint(progressRef.current, targetPosition.current);
    curves.look.getPoint(progressRef.current, targetLook.current);
    camera.position.copy(targetPosition.current);
    currentLook.current.copy(targetLook.current);
    camera.lookAt(currentLook.current);
    invalidate();
  }, [camera, curves, invalidate, progressRef]);

  useGSAP(
    () => {
      const stage = stageRef.current;
      if (!stage) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.create({
          trigger: stage,
          pin: true,
          anticipatePin: 1,
          start: () => `top ${navOffset()}`,
          end: `+=${count * 100}%`,
          scrub: 0.8,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            onProgress(self.progress);
            invalidate();
          },
        });
      });
      return () => mm.revert();
    },
    { dependencies: [count] },
  );

  useFrame((_, delta) => {
    const progress = progressRef.current;
    curves.camera.getPoint(progress, targetPosition.current);
    curves.look.getPoint(progress, targetLook.current);
    // Frame-rate independent easing; delta is clamped so the first frame after an idle period does not jump.
    const k = 1 - Math.exp(-Math.min(delta, 1 / 30) * 10);
    camera.position.lerp(targetPosition.current, k);
    currentLook.current.lerp(targetLook.current, k);
    camera.lookAt(currentLook.current);
    const settled =
      camera.position.distanceToSquared(targetPosition.current) < 1e-7 &&
      currentLook.current.distanceToSquared(targetLook.current) < 1e-7;
    if (!settled) invalidate();
  });

  return null;
}
