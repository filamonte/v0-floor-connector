"use client";

import { NotebookText } from "lucide-react";

import { RichTextEditor } from "@/components/ui/rich-text-editor";

type NotesSectionProps = {
  value: string;
  onChange: (value: string) => void;
};

export function NotesSection({ value, onChange }: NotesSectionProps) {
  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f7f8fb] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#23395d]">
          <NotebookText className="h-4 w-4 text-[#607492]" />
          <h2>Notes</h2>
        </div>
      </div>

      <RichTextEditor
        value={value}
        mode="document"
        minHeight={520}
        onChange={onChange}
      />
    </section>
  );
}
