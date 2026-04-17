"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SettingsNavItem } from "@/lib/settings/navigation";

type SettingsNavProps = {
  items: readonly SettingsNavItem[];
};

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SettingsNav({ items }: SettingsNavProps) {
  const pathname = usePathname();

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
              "block rounded-[1.5rem] border px-4 py-4 transition",
              active
                ? "border-slate-950 bg-slate-950 text-white shadow-[0_18px_40px_-28px_rgba(15,23,42,0.55)]"
                : "border-slate-200 bg-white/88 text-slate-700 hover:border-slate-300 hover:bg-white"
            ].join(" ")}
          >
            <p className="text-sm font-semibold tracking-tight">{item.label}</p>
            <p
              className={[
                "mt-2 text-xs leading-5",
                active ? "text-slate-300" : "text-slate-500"
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
