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
                "block rounded-[4px] border px-3 py-3 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8] focus-visible:ring-offset-2",
                active
                  ? "border-[#005eb8] bg-[#005eb8] text-white shadow-none"
                  : neutral
                    ? "border-[#d1d5db] bg-white text-[var(--text-secondary)] hover:border-[#005eb8] hover:bg-[#eef6ff] hover:text-[var(--text-primary)]"
                    : "border-[#d1d5db] bg-white text-[var(--text-secondary)] hover:border-[#005eb8] hover:bg-[#eef6ff] hover:text-[var(--text-primary)]"
              ].join(" ")}
            >
              <p className="text-sm font-semibold tracking-tight">
                {item.label}
              </p>
              <p
                className={[
                  "mt-2 text-xs leading-5",
                  active
                    ? "text-white/75"
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
