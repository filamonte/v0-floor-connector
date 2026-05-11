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
        className="inline-flex h-10 items-center rounded-[4px] border border-[var(--border-warm)] bg-white px-3.5 text-sm font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-[var(--copper)] hover:text-[var(--text-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--copper)] focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-controls="mobile-app-navigation"
      >
        {isOpen ? "Close menu" : "Open menu"}
      </button>

      {isOpen ? (
        <div
          id="mobile-app-navigation"
          className="mt-4 border border-[var(--border-warm)] bg-white p-5 shadow-[0_24px_80px_-40px_rgba(34,26,20,0.28)]"
        >
          <div className="mb-4">
            <UniversalCreateMenu
              idBase="mobile-universal-create-menu"
              align="left"
              buttonLabel="Quick create"
              buttonClassName="w-full justify-center rounded-[4px] border-[var(--copper)] bg-[var(--copper)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--copper-light)]"
              panelClassName="left-0 right-0 w-full"
            />
          </div>
          <ProtectedAppNav currentRole={currentRole} variant="drawer" />
        </div>
      ) : null}
    </div>
  );
}
