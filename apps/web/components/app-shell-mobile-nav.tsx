"use client";

import { useState } from "react";

import type { MembershipRole } from "@floorconnector/types";

import { ProtectedAppNav } from "@/components/protected-app-nav";
import { UniversalCreateMenu } from "@/components/universal-create-menu";

type AppShellMobileNavProps = {
  currentRole?: MembershipRole;
};

export function AppShellMobileNav({ currentRole }: AppShellMobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
        aria-expanded={isOpen}
        aria-controls="mobile-app-navigation"
      >
        {isOpen ? "Close menu" : "Open menu"}
      </button>

      {isOpen ? (
        <div
          id="mobile-app-navigation"
          className="mt-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.35)]"
        >
          <div className="mb-4">
            <UniversalCreateMenu
              align="left"
              buttonLabel="Quick create"
              buttonClassName="w-full justify-center rounded-full border-slate-200 bg-slate-950 px-4 py-2.5 text-sm text-white hover:bg-slate-800"
              panelClassName="left-0 right-0 w-full"
            />
          </div>
          <ProtectedAppNav currentRole={currentRole} variant="drawer" />
        </div>
      ) : null}
    </div>
  );
}
