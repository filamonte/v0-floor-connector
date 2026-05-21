"use client";

import { FileBadge2, Info } from "lucide-react";

type CoverSheetProps = {
  enabled?: boolean;
};

export function CoverSheet({ enabled = false }: CoverSheetProps) {
  return (
    <section className="border-t border-[var(--border-warm)] bg-white">
      <div className="border-b border-[var(--border-warm)] bg-[var(--highlight)] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[var(--text-primary)]">
          <FileBadge2 className="h-4 w-4 text-[var(--text-secondary)]" />
          <h2>Cover Sheet</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-5 text-[15px] text-[var(--text-secondary)]">
        <span>Include Cover Sheet?</span>
        <Info className="h-4 w-4 text-[var(--text-tertiary)]" />
        <span
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            enabled ? "bg-[var(--copper)]" : "bg-[var(--border-warm)]"
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
              enabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </span>
      </div>
    </section>
  );
}
