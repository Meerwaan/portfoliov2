import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { site } from "@/lib/site";
import { NavLinks } from "./NavLinks";

export async function Nav() {
  const t = await getTranslations("nav");
  const a = await getTranslations("a11y");
  const items = [
    { href: "/work" as const, label: t("work") },
    { href: "/lab" as const, label: t("lab") },
    { href: "/about" as const, label: t("about") },
    { href: "/contact" as const, label: t("contact") },
  ];

  return (
    <header className="sticky top-0 z-20 border-b border-rule bg-paper/90 backdrop-blur-sm">
      <div className="container-page flex h-nav items-center justify-between gap-4">
        <Link href="/" className="whitespace-nowrap text-ink hover:text-signal" aria-label={site.name}>
          <span className="mono-label normal-case sm:hidden">{site.signature}</span>
          <span className="hidden font-display text-lg font-medium tracking-tight sm:inline">{site.name}</span>
        </Link>
        <nav aria-label={a("mainNav")} className="flex items-center gap-0 sm:gap-2">
          <NavLinks items={items} />
        </nav>
      </div>
    </header>
  );
}
