"use client";

import { FileText, GripVertical } from "lucide-react";
import type { EstimateScopeItem } from "@floorconnector/types";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

type ScopeOfWorkProps = {
  summaryHtml: string;
  items: EstimateScopeItem[];
  onSummaryChange: (value: string) => void;
  onItemTextChange: (id: string, value: string) => void;
  onItemIncludeChange: (id: string, checked: boolean) => void;
};

export function ScopeOfWork({
  summaryHtml,
  items,
  onSummaryChange,
  onItemTextChange,
  onItemIncludeChange
}: ScopeOfWorkProps) {
  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="grid xl:grid-cols-[minmax(0,1.38fr)_480px]">
        <div className="border-r border-[#e6e9ef]">
          <RichTextEditor
            label="Scope / SOW summary"
            value={summaryHtml}
            mode="document"
            minHeight={575}
            onChange={onSummaryChange}
          />
        </div>

        <div>
          <div className="border-b border-[#e6e9ef] bg-[#f8f8f8] px-4 py-3">
            <div className="flex items-center gap-3 text-[15px] font-semibold text-[#171717]">
              <FileText className="h-4 w-4 text-[#5f5f5f]" />
              <h2>Scope / SOW output items</h2>
            </div>
            <p className="mt-2 text-[13px] leading-5 text-[#6b7c96]">
              Use reusable scope blocks in the summary, then keep the checked line items here as the
              output list that follows this estimate into customer-facing scope.
            </p>
          </div>

          <div>
            {items.map((item, index) => (
              <div
                key={item.id}
                className={[
                  "grid grid-cols-[24px_24px_minmax(0,1fr)] items-center gap-3 border-b border-[#e5e5e5] px-4 py-3",
                  index % 2 === 0 ? "bg-white" : "bg-[#fcfcfd]"
                ].join(" ")}
              >
                <GripVertical className="h-4 w-4 text-[#c1cadd]" />
                <input
                  type="checkbox"
                  checked={item.includeInOutput}
                  onChange={(event) => onItemIncludeChange(item.id, event.target.checked)}
                  className="h-5 w-5 rounded-[3px] border-[#a9b5c8] text-[#2a2a2a]"
                />
                <input
                  value={item.text}
                  onChange={(event) => onItemTextChange(item.id, event.target.value)}
                  placeholder="Add scope / SOW output item (max 2000 characters)."
                  className="h-8 border-0 bg-transparent px-0 text-[14px] text-[#2a2a2a] placeholder:text-[#a9b5c8] focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
