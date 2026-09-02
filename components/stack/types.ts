import type { StackData } from "@/lib/content/schema";

export type StackItem = {
  slug: string;
  node: string;
  title: string;
  oneLiner: string;
  status: "production" | "delivered" | "building";
  ui: { src: string; width: number; height: number; blurDataURL?: string; alt: string };
  stack: StackData;
};

export const LAYERS = ["ui", "routes", "models", "infra"] as const;
export type LayerId = (typeof LAYERS)[number];
