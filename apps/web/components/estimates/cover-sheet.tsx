"use client";

import { useState } from "react";
import { FileSpreadsheet, Info } from "lucide-react";

type CoverSheetProps = {
  includeCoverSheet?: boolean;
  onToggle?: (value: boolean) => void;
};

export function CoverSheet({
  includeCoverSheet = false,
  onToggle
}: CoverSheetProps) {
  const [enabled, setEnabled] = useState(includeCoverSheet);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    onToggle?.(newValue);
  };

  return (
    <section id="cover-sheet">
      <div className="bg-white border border-[#e5e7eb] rounded-lg px-4 h-16 flex items-center justify-between">
        {/* Left - Label */}
        <div className="flex items-center gap-3">
          <FileSpreadsheet className="w-[18px] h-[18px] text-gray-600" />
          <span className="text-[14px] font-semibold text-gray-900">
            Cover Sheet
          </span>
        </div>

        {/* Right - Toggle */}
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-gray-600">Include Cover Sheet?</span>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition"
            title="The cover sheet includes company branding, project details, and contact information at the beginning of your estimate PDF."
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Toggle Switch */}
          <button
            type="button"
            onClick={handleToggle}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              enabled ? "bg-[#ef7d32]" : "bg-gray-200"
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                enabled ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
