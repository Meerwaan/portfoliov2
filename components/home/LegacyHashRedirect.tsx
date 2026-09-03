"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/** Old one-page anchors (#portfolio, #contact...) become routes. Hashes never reach the server, hence client-side. */
const MAP: Record<string, "/work" | "/contact" | "/about" | "/"> = {
  "#portfolio": "/work",
  "#contact": "/contact",
  "#about": "/about",
  "#resume": "/about",
  "#whatido": "/about",
  "#myskills": "/about",
  "#accueil": "/",
};

export function LegacyHashRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = MAP[window.location.hash.toLowerCase()];
    if (target && target !== "/") router.replace(target);
  }, [router]);
  return null;
}
