"use client";

import { FileText } from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

type TermsEditorProps = {
  termsHtml: string;
  inclusionsHtml: string;
  exclusionsHtml: string;
  onTermsChange: (value: string) => void;
  onInclusionsChange: (value: string) => void;
  onExclusionsChange: (value: string) => void;
};

export function TermsEditor({
  termsHtml,
  inclusionsHtml,
  exclusionsHtml,
  onTermsChange,
  onInclusionsChange,
  onExclusionsChange
}: TermsEditorProps) {
  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f7f8fb] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#23395d]">
          <FileText className="h-4 w-4 text-[#607492]" />
          <h2>Terms and Conditions</h2>
        </div>
      </div>

      <div className="space-y-5 px-0 py-0">
        <RichTextEditor
          label="Terms"
          value={termsHtml}
          mode="document"
          onChange={onTermsChange}
        />
        <RichTextEditor
          label="Inclusions"
          value={inclusionsHtml}
          mode="standard"
          minHeight={220}
          onChange={onInclusionsChange}
        />
        <RichTextEditor
          label="Exclusions"
          value={exclusionsHtml}
          mode="standard"
          minHeight={220}
          onChange={onExclusionsChange}
        />
      </div>
    </section>
  );
}
