"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SettingsNavItem } from "@/lib/settings/navigation";

type SettingsNavProps = {
  items: readonly SettingsNavItem[];
  tone?: "warm" | "neutral";
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav({ items, tone = "warm" }: SettingsNavProps) {
  const pathname = usePathname();
  const neutral = tone === "neutral";

  return (
    <nav aria-label="Settings navigation" className="space-y-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={[
              "block border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
              active
                ? "border-[var(--graphite)] bg-[var(--graphite)] text-white shadow-[0_18px_40px_-30px_rgba(23,23,23,0.5)]"
                : neutral
                  ? "rounded-md border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
                  : "border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--copper)] hover:bg-[var(--cream)]"
            ].join(" ")}
          >
            <p className="text-sm font-semibold tracking-tight">{item.label}</p>
            <p
              className={[
                "mt-2 text-xs leading-5",
                active ? "text-[var(--cream)]" : neutral ? "text-[var(--text-tertiary)]" : "text-[var(--text-tertiary)]"
              ].join(" ")}
            >
              {item.description}
            </p>
          </Link>
        );
      })}
    </nav>
  );
}
