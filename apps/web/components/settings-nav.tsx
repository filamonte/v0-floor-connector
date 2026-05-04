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
              "block border px-4 py-3 transition",
              active
                ? "border-[#171717] bg-[#171717] text-white shadow-[0_18px_40px_-30px_rgba(23,23,23,0.5)]"
                : neutral
                  ? "rounded-md border-[#e2e5e9] bg-white text-[#374151] hover:border-[#9ca3af] hover:bg-[#f8fafc] hover:text-[#111827]"
                  : "border-[#d9cdc2] bg-white text-[#594839] hover:border-[#ef7d32] hover:bg-[#fbf7f2]"
            ].join(" ")}
          >
            <p className="text-sm font-semibold tracking-tight">{item.label}</p>
            <p
              className={[
                "mt-2 text-xs leading-5",
                active ? "text-[#f3e7dc]" : neutral ? "text-[#6b7280]" : "text-[#8f7f72]"
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
