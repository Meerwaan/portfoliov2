"use client";

import { Link, usePathname } from "@/i18n/navigation";

type Item = { href: "/work" | "/lab" | "/about" | "/contact"; label: string };

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-sm px-1.5 py-1 text-sm transition-colors duration-(--dur-1) sm:px-3 ${
              active ? "text-signal" : "text-ink-2 hover:text-ink"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
