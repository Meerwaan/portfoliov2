import type { Status } from "@/lib/content/schema";

/** Serializable subset of a project passed from the server to the space components. */
export type SpaceItem = {
  slug: string;
  node: string;
  title: string;
  oneLiner: string;
  status: Status;
  /** 1600px WebP used as the WebGL texture. */
  texture: string;
  /** Largest WebP rendition used by next/image. */
  src: string;
  width: number;
  height: number;
  blurDataURL?: string;
  alt: string;
  /** Rotation around Y in degrees, between -8 and 8. */
  tilt: number;
};
