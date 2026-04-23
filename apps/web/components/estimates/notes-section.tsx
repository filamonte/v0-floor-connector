"use client";

import { useState } from "react";
import { StickyNote, Bold, Italic, Underline, AlignLeft, List, ListOrdered, Maximize2, Code, Palette, Undo, Redo } from "lucide-react";

type NotesSectionProps = { defaultValue?: string; onChange?: (value: string) => void };

function Toolbar() {
  return (
    <div className="h-8 bg-[#f8f9fa] border-b border-[#dfe1e6] px-2 flex items-center gap-0.5">
      <select className="h-5 px-1 text-[10px] border border-[#dfe1e6] rounded bg-white"><option>A</option></select>
      <select className="h-5 px-1 text-[10px] border border-[#dfe1e6] rounded bg-white w-10 ml-1"><option>Aa</option></select>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Palette className="w-3 h-3 text-[#5e6c84]" /></button>
      <div className="w-px h-3 bg-[#dfe1e6] mx-0.5" />
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Undo className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Redo className="w-3 h-3 text-[#5e6c84]" /></button>
      <div className="w-px h-3 bg-[#dfe1e6] mx-0.5" />
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Bold className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Italic className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Underline className="w-3 h-3 text-[#5e6c84]" /></button>
      <div className="w-px h-3 bg-[#dfe1e6] mx-0.5" />
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><AlignLeft className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><List className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><ListOrdered className="w-3 h-3 text-[#5e6c84]" /></button>
      <div className="w-px h-3 bg-[#dfe1e6] mx-0.5" />
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Maximize2 className="w-3 h-3 text-[#5e6c84]" /></button>
      <button type="button" className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#dfe1e6]"><Code className="w-3 h-3 text-[#5e6c84]" /></button>
    </div>
  );
}

export function NotesSection({ defaultValue = "", onChange }: NotesSectionProps) {
  const [content, setContent] = useState(defaultValue);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
        <StickyNote className="w-4 h-4 text-[#5e6c84]" />
        <span className="text-[12px] font-semibold text-[#172b4d]">Notes</span>
      </div>
      <Toolbar />
      <textarea
        value={content}
        onChange={(e) => { setContent(e.target.value); onChange?.(e.target.value); }}
        className="flex-1 p-3 text-[12px] leading-relaxed text-[#172b4d] outline-none resize-none"
        placeholder="Start typing..."
      />
      <div className="h-6 bg-[#f8f9fa] border-t border-[#dfe1e6] px-3 flex items-center justify-end gap-3 text-[10px] text-[#5e6c84] shrink-0">
        <span>Words: {wordCount}</span>
        <span>Characters: {content.length}</span>
      </div>
    </div>
  );
}
