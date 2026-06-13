import type { ReactNode } from "react";
import Link from "next/link";

import { SignOutForm } from "@/components/sign-out-form";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

type PortalLayoutProps = {
  children: ReactNode;
};

export default async function PortalLayout({ children }: PortalLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    return children;
  }

  const portalNavItems = [
    {
      href: "/portal",
      label: "Home",
      shortLabel: "Home"
    },
    {
      href: "/portal#portal-projects",
      label: "Projects",
      shortLabel: "Projects"
    },
    {
      href: "/portal#portal-documents",
      label: "Documents",
      shortLabel: "Docs"
    },
    {
      href: "/portal#portal-billing",
      label: "Billing",
      shortLabel: "Billing"
    }
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-950 print:bg-white">
      <div className="grid min-h-screen lg:grid-cols-[72px_minmax(0,1fr)] print:block">
        <aside className="sticky top-0 hidden h-screen border-r border-black/80 bg-[#080a0f] text-white lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-5 print:hidden">
          <div className="flex flex-col items-center gap-6">
            <Link
              href="/portal"
              aria-label="Portal home"
              className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-white/10 bg-white text-[11px] font-bold tracking-tight text-[#080a0f]"
            >
              FC
            </Link>
            <nav aria-label="Portal rail" className="flex flex-col gap-2">
              {portalNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className="flex h-10 w-10 items-center justify-center rounded-[4px] border border-white/10 bg-white/[0.04] text-[10px] font-semibold uppercase tracking-[0.14em] text-white/70 transition hover:border-[#005eb8] hover:bg-[#005eb8] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8fc7ff]"
                >
                  {item.shortLabel.slice(0, 2)}
                </Link>
              ))}
            </nav>
          </div>
          <p className="[writing-mode:vertical-rl] rotate-180 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/35">
            Customer portal
          </p>
        </aside>

        <div className="min-w-0 pb-20 lg:pb-0">
          <header className="sticky top-0 z-30 border-b border-[#d1d5db] bg-white/95 backdrop-blur print:hidden">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-5 py-4 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <Link
                    href="/portal"
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[4px] border border-[#d1d5db] bg-[#080a0f] text-[11px] font-bold text-white lg:hidden"
                  >
                    FC
                  </Link>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#005eb8]">
                      Project Portal
                    </p>
                    <p className="text-lg font-semibold tracking-tight text-[#080a0f]">
                      FloorConnector customer workspace
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex min-w-0 flex-wrap items-center gap-3">
                <nav
                  aria-label="Portal sections"
                  className="hidden flex-wrap items-center gap-1 md:flex"
                >
                  {portalNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="rounded-[4px] px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-[#eef6ff] hover:text-[#005eb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8]"
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
                <div className="max-w-full rounded-[4px] border border-[#d1d5db] bg-[#f9fafb] px-3 py-2 text-sm text-slate-600 [overflow-wrap:anywhere]">
                  {user.email ?? "Authenticated portal user"}
                </div>
                <SignOutForm />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl px-5 py-7 sm:px-8 lg:py-10 print:max-w-none print:p-0">
            {children}
          </main>
        </div>
      </div>

      <nav
        aria-label="Portal mobile navigation"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-[#d1d5db] bg-white/95 px-3 py-2 shadow-[0_-18px_40px_-30px_rgba(15,23,42,0.45)] backdrop-blur md:hidden print:hidden"
      >
        {portalNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex min-h-12 flex-col items-center justify-center rounded-[4px] px-2 text-center text-[11px] font-semibold text-slate-600 transition hover:bg-[#eef6ff] hover:text-[#005eb8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#005eb8]"
          >
            <span className="text-[10px] uppercase tracking-[0.12em]">
              {item.shortLabel.slice(0, 2)}
            </span>
            <span>{item.shortLabel}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
