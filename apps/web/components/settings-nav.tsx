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
  let currentGroup: string | undefined;

  return (
    <nav aria-label="Settings navigation" className="space-y-2">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        const showGroup = item.group && item.group !== currentGroup;

        if (item.group) {
          currentGroup = item.group;
        }

        return (
          <div key={item.href} className={showGroup ? "pt-3 first:pt-0" : ""}>
            {showGroup ? (
              <p className="px-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--text-tertiary)]">
                {item.group}
              </p>
            ) : null}
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "block rounded-md border px-4 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2",
                active
                  ? "border-[var(--graphite)] bg-[var(--graphite)] text-white shadow-[0_18px_40px_-30px_rgba(23,23,23,0.5)]"
                  : neutral
                    ? "border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--graphite-light)] hover:bg-[var(--highlight)] hover:text-[var(--text-primary)]"
                    : "border-[var(--border-warm)] bg-white text-[var(--text-secondary)] hover:border-[var(--copper)] hover:bg-[var(--cream)]"
              ].join(" ")}
            >
              <p className="text-sm font-semibold tracking-tight">
                {item.label}
              </p>
              <p
                className={[
                  "mt-2 text-xs leading-5",
                  active
                    ? "text-[var(--cream)]"
                    : neutral
                      ? "text-[var(--text-tertiary)]"
                      : "text-[var(--text-tertiary)]"
                ].join(" ")}
              >
                {item.description}
              </p>
            </Link>
          </div>
        );
      })}
    </nav>
  );
}
