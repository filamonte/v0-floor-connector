"use client";

import Link from "next/link";
import type { MembershipRole } from "@floorconnector/types";

import { useProtectedNavigationState } from "@/lib/navigation/navigation-client";

type ProtectedAppNavProps = {
  currentRole?: MembershipRole;
  variant?: "sidebar" | "mobile" | "drawer";
};

export function ProtectedAppNav({
  currentRole,
  variant = "sidebar"
}: ProtectedAppNavProps) {
  const { sections, isItemActive } = useProtectedNavigationState(currentRole);
  const visibleItems = sections.flatMap((group) => group.items);

  return (
    <nav
      aria-label="Application navigation"
      className={
        variant === "sidebar"
          ? "flex flex-col gap-6"
          : variant === "drawer"
            ? "flex flex-col gap-6"
            : "flex min-w-max items-center gap-2"
      }
    >
      {variant === "mobile"
        ? visibleItems.map((item) => {
            const isActive = isItemActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={[
                  "rounded-full px-4 py-2 text-sm font-medium transition",
                  isActive
                    ? "bg-slate-950 text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-950"
                ].join(" ")}
              >
                {item.label}
              </Link>
            );
          })
        : sections.map((group) => (
            <div key={group.id}>
              <p className="px-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">
                {group.label}
              </p>
              <div className="mt-2 flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive = isItemActive(item);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={[
                        "flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition",
                        isActive
                          ? "bg-white text-slate-950 shadow-[0_18px_40px_-26px_rgba(15,23,42,0.55)]"
                          : "text-slate-300 hover:bg-white/8 hover:text-white"
                      ].join(" ")}
                    >
                      <span>{item.label}</span>
                      {isActive ? (
                        <span className="h-2.5 w-2.5 rounded-full bg-brand-700" />
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
    </nav>
  );
}
