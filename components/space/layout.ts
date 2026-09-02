/**
 * Shared geometry of the interface space: where each plane sits and where the camera stops in front of it.
 * Only imported by the client scene (lazy chunk).
 */
export const PLANE_HEIGHT = 1;
export const Z_STEP = 3;
/** Wide enough that the camera path (x≈0 mid-transit) clears the previous plane's edge. */
export const X_OFFSET = 1.35;
export const Y_OFFSET = 0.08;
/** Distance between the camera and the plane it is looking at. */
export const CAMERA_DISTANCE = 2.6;
/** The camera looks slightly below the plane centre so the screen sits high and the caption has room. */
export const LOOK_DROP = 0.07;
/** Total extra size of the frame plane drawn behind each screenshot (about 1px at reading distance). */
export const FRAME = 0.005;

export type Vec3 = [number, number, number];

export function planePosition(index: number): Vec3 {
  const side = index % 2 === 0 ? -1 : 1;
  return [side * X_OFFSET, -side * Y_OFFSET, -index * Z_STEP];
}

export function degToRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
