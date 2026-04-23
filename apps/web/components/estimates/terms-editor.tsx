"use client";

import { useState } from "react";
import {
  FileText,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  List,
  ListOrdered,
  Undo,
  Redo,
  Maximize2,
  Code,
  Palette,
  ChevronDown
} from "lucide-react";

type TermsEditorProps = {
  defaultValue?: string;
  onChange?: (value: string) => void;
};

function Toolbar() {
  return (
    <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-2 flex items-center gap-0.5">
      <select className="h-6 px-1.5 text-[11px] border border-[#dfe1e6] rounded bg-white">
        <option>A</option>
      </select>
      <select className="h-6 px-1.5 text-[11px] border border-[#dfe1e6] rounded bg-white w-14 ml-1">
        <option>Aa</option>
      </select>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Text Color">
        <Palette className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <div className="w-px h-4 bg-[#dfe1e6] mx-1" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Undo">
        <Undo className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Redo">
        <Redo className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <div className="w-px h-4 bg-[#dfe1e6] mx-1" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Bold">
        <Bold className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Italic">
        <Italic className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Underline">
        <Underline className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Strikethrough">
        <Strikethrough className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <div className="w-px h-4 bg-[#dfe1e6] mx-1" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Align">
        <AlignLeft className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Bullet List">
        <List className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Numbered List">
        <ListOrdered className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <div className="w-px h-4 bg-[#dfe1e6] mx-1" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Expand">
        <Maximize2 className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-[#dfe1e6]" title="Code">
        <Code className="w-3.5 h-3.5 text-[#5e6c84]" />
      </button>
    </div>
  );
}

const DEFAULT_TERMS = `This estimate is based on the information provided and is subject to change if additional details emerge or project specifications are modified. Any changes will be communicated to the customer in writing prior to implementation. It does not constitute a final quote.

Unforeseen conditions during removal may necessitate additional costs and a change order. If the customer declines to approve the change order, the warranty may be adjusted or voided at Danek Flooring Inc.'s discretion.

Danek Flooring Inc. is not responsible for any damages occurring after installation is completed. Any post-installation repairs requested by the customer will be billed at standard labor rates.`;

export function TermsEditor({ defaultValue, onChange }: TermsEditorProps) {
  const [content, setContent] = useState(defaultValue || DEFAULT_TERMS);
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="h-10 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
        <FileText className="w-4 h-4 text-[#5e6c84]" />
        <span className="text-[13px] font-semibold text-[#172b4d]">Terms and Conditions</span>
      </div>

      {/* Terms Section */}
      <div className="border-b border-[#dfe1e6]">
        <div className="px-3 py-2 border-b border-[#dfe1e6]">
          <span className="text-[12px] font-medium text-[#172b4d]">Terms</span>
        </div>
        <Toolbar />
        <textarea
          value={content}
          onChange={(e) => { setContent(e.target.value); onChange?.(e.target.value); }}
          className="w-full h-[200px] p-3 text-[12px] leading-relaxed text-[#172b4d] bg-white outline-none resize-none"
          placeholder="Enter terms..."
        />
        <div className="h-7 bg-[#f8f9fa] border-t border-[#dfe1e6] px-3 flex items-center justify-end gap-3 text-[10px] text-[#5e6c84]">
          <span>Words: {wordCount}</span>
          <span>Characters: {charCount}</span>
        </div>
      </div>

      {/* Inclusions Section */}
      <div className="border-b border-[#dfe1e6]">
        <div className="px-3 py-2 border-b border-[#dfe1e6]">
          <span className="text-[12px] font-medium text-[#172b4d]">Inclusions</span>
        </div>
        <Toolbar />
        <textarea
          className="w-full h-[100px] p-3 text-[12px] leading-relaxed text-[#172b4d] bg-white outline-none resize-none"
          placeholder="Start typing..."
        />
        <div className="h-7 bg-[#f8f9fa] border-t border-[#dfe1e6] px-3 flex items-center justify-end gap-3 text-[10px] text-[#5e6c84]">
          <span>Words: 0</span>
          <span>Characters: 0</span>
        </div>
      </div>

      {/* Exclusions Section */}
      <div>
        <div className="px-3 py-2 border-b border-[#dfe1e6]">
          <span className="text-[12px] font-medium text-[#172b4d]">Exclusions</span>
        </div>
        <Toolbar />
        <textarea
          className="w-full h-[100px] p-3 text-[12px] leading-relaxed text-[#172b4d] bg-white outline-none resize-none"
          placeholder="Start typing..."
        />
        <div className="h-7 bg-[#f8f9fa] border-t border-[#dfe1e6] px-3 flex items-center justify-end gap-3 text-[10px] text-[#5e6c84]">
          <span>Words: 0</span>
          <span>Characters: 0</span>
        </div>
      </div>
    </div>
  );
}
