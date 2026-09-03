import { getTranslations } from "next-intl/server";
import { site } from "@/lib/site";
import { NameResolve } from "./NameResolve";
import { Doors } from "./Doors";
import { CommandField } from "@/components/command/CommandField";

export async function Hero() {
  const t = await getTranslations("hero");
  return (
    <section className="container-page grid min-h-[calc(100svh-var(--spacing-nav))] grid-rows-[1fr_auto] gap-10 pt-16 pb-8 md:pt-24">
      <div className="flex flex-col justify-center gap-8">
        <NameResolve name={site.name} />
        <p className="max-w-[34ch] text-xl text-ink-2">{t("sentence")}</p>
        <CommandField />
      </div>
      <Doors />
    </section>
  );
}
