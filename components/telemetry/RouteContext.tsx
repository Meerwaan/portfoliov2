"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { site } from "@/lib/site";

function useParisTime() {
  const [time, setTime] = useState<string | null>(null);
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: site.timeZone,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

/** Left slot of the rail: where you are in the system, derived from the route. */
export function RouteContext() {
  const t = useTranslations("rail.context");
  const pathname = usePathname();
  const time = useParisTime();

  let label: string;
  if (pathname === "/") label = t("home");
  else if (pathname === "/work") label = t("work");
  else if (pathname.startsWith("/work/")) {
    const slug = pathname.split("/")[2] ?? "";
    label = `${t("node")} · ${slug.replace(/-/g, "_").toUpperCase()}`;
  } else if (pathname.startsWith("/lab")) label = t("lab");
  else if (pathname.startsWith("/about")) label = t("about");
  else if (pathname.startsWith("/contact")) label = `${t("contact")}${time ? ` · ${site.timeZone} ${time}` : ""}`;
  else label = t("notFound");

  return <span className="text-ink">{label}</span>;
}
