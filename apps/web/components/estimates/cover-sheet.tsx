"use client";

import { useState } from "react";
import { FileSpreadsheet, Info } from "lucide-react";

type CoverSheetProps = { includeCoverSheet?: boolean; onToggle?: (value: boolean) => void };

export function CoverSheet({ includeCoverSheet = false, onToggle }: CoverSheetProps) {
  const [enabled, setEnabled] = useState(includeCoverSheet);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    onToggle?.(newValue);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
        <FileSpreadsheet className="w-4 h-4 text-[#5e6c84]" />
        <span className="text-[12px] font-semibold text-[#172b4d]">Cover Sheet</span>
      </div>
      <div className="flex-1 p-4">
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-[#5e6c84]">Include Cover Sheet?</span>
          <button type="button" className="text-[#b3bac5] hover:text-[#5e6c84]" title="The cover sheet includes company branding and project details.">
            <Info className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleToggle}
            className={`relative w-9 h-5 rounded-full transition-colors ${enabled ? "bg-[#ef7d32]" : "bg-[#dfe1e6]"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${enabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
        </div>
      </div>
    </div>
  );
}
