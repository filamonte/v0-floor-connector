"use client";

import { FileBadge2, Info } from "lucide-react";

type CoverSheetProps = {
  enabled?: boolean;
};

export function CoverSheet({ enabled = false }: CoverSheetProps) {
  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f8f8f8] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#171717]">
          <FileBadge2 className="h-4 w-4 text-[#5f5f5f]" />
          <h2>Cover Sheet</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-5 text-[15px] text-[#6c7c96]">
        <span>Include Cover Sheet?</span>
        <Info className="h-4 w-4 text-slate-400" />
        <span
          className={`relative inline-flex h-7 w-12 items-center rounded-full transition ${
            enabled ? "bg-[#f4812a]" : "bg-[#dfe3e9]"
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
