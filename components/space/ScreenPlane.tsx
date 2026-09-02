"use client";

import { useCallback } from "react";
import { SRGBColorSpace, type Mesh, type MeshBasicMaterial, type Texture } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { useTexture } from "@react-three/drei/core/Texture";
import { FRAME, PLANE_HEIGHT, degToRad, planePosition } from "./layout";
import type { SpaceItem } from "./types";

function setCursor(value: string) {
  document.body.style.cursor = value;
}

/**
 * One screenshot as an unlit textured plane, height 1 unit, width from the manifest aspect ratio,
 * with a slightly larger plane behind it in the `--rule` colour so it reads as a framed screen on paper.
 */
export function ScreenPlane({
  item,
  index,
  frameMaterial,
  meshRef,
  onOpen,
}: {
  item: SpaceItem;
  index: number;
  frameMaterial: MeshBasicMaterial;
  meshRef: (mesh: Mesh | null) => void;
  onOpen: () => void;
}) {
  const width = PLANE_HEIGHT * (item.width / item.height);
  const onLoad = useCallback((texture: Texture) => {
    texture.colorSpace = SRGBColorSpace;
    texture.anisotropy = 4;
    texture.needsUpdate = true;
  }, []);
  const texture = useTexture(item.texture, onLoad);
  const position = planePosition(index);

  const handleClick = useCallback(
    (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      setCursor("");
      onOpen();
    },
    [onOpen],
  );
  const handleOver = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setCursor("pointer");
  }, []);
  const handleOut = useCallback(() => setCursor(""), []);

  return (
    <group position={position} rotation={[0, degToRad(item.tilt), 0]}>
      <mesh position={[0, 0, -0.004]} material={frameMaterial}>
        <planeGeometry args={[width + FRAME, PLANE_HEIGHT + FRAME]} />
      </mesh>
      <mesh ref={meshRef} onClick={handleClick} onPointerOver={handleOver} onPointerOut={handleOut}>
        <planeGeometry args={[width, PLANE_HEIGHT]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  );
}
