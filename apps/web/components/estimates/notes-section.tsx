"use client";

import { useState } from "react";
import {
  StickyNote,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  Subscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
  Maximize2,
  Code,
  Palette,
  Highlighter
} from "lucide-react";

type NotesSectionProps = {
  defaultValue?: string;
  onChange?: (value: string) => void;
};

function EditorToolbar() {
  return (
    <div className="h-11 bg-white border-b border-[#e5e7eb] px-2 flex items-center gap-1">
      <select className="h-7 px-2 text-[12px] border border-gray-200 rounded bg-white">
        <option>A</option>
      </select>
      <select className="h-7 px-2 text-[12px] border border-gray-200 rounded bg-white w-[60px]">
        <option>Aa</option>
      </select>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Palette className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Highlighter className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Undo className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Redo className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Bold className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Italic className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Underline className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Strikethrough className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Superscript className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Subscript className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <AlignLeft className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <AlignCenter className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <AlignRight className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <List className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <ListOrdered className="w-4 h-4 text-gray-600" />
      </button>
      <div className="w-px h-5 bg-gray-200 mx-1" />
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Maximize2 className="w-4 h-4 text-gray-600" />
      </button>
      <button type="button" className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100">
        <Code className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

export function NotesSection({ defaultValue = "", onChange }: NotesSectionProps) {
  const [content, setContent] = useState(defaultValue);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);
  };

  return (
    <section id="notes">
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-[#f9fafb] border-b border-[#e5e7eb] px-4 flex items-center gap-3">
          <StickyNote className="w-[18px] h-[18px] text-gray-600" />
          <span className="text-[14px] font-semibold text-gray-900">Notes</span>
        </div>

        {/* Toolbar */}
        <EditorToolbar />

        {/* Content */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={handleChange}
            className="w-full min-h-[200px] text-[14px] leading-[1.6] text-gray-900 bg-transparent outline-none resize-none"
            placeholder="Start typing..."
          />
        </div>

        {/* Footer */}
        <div className="h-8 bg-[#f9fafb] border-t border-[#e5e7eb] px-4 flex items-center justify-end gap-4 text-[12px] text-gray-500">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
      </div>
    </section>
  );
}
