"use client";

import { useState } from "react";
import { FileText, ClipboardList, Bold, Italic, Underline, AlignLeft, List, ListOrdered, Maximize2, Code, Palette, Undo, Redo, GripVertical } from "lucide-react";

type ScopeItem = { id: string; text: string; checked: boolean };
type ScopeOfWorkProps = { summary?: string; items?: ScopeItem[]; onSummaryChange?: (v: string) => void; onItemsChange?: (items: ScopeItem[]) => void };

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

export function ScopeOfWork({ summary = "", items = [], onSummaryChange, onItemsChange }: ScopeOfWorkProps) {
  const [localSummary, setLocalSummary] = useState(summary);
  const [localItems, setLocalItems] = useState<ScopeItem[]>(items);
  const wordCount = localSummary.trim() ? localSummary.trim().split(/\s+/).length : 0;

  const addItem = () => {
    const newItems = [...localItems, { id: `scope-${Date.now()}`, text: "", checked: false }];
    setLocalItems(newItems);
    onItemsChange?.(newItems);
  };

  return (
    <div className="h-full flex bg-white">
      {/* Left - Summary */}
      <div className="flex-1 flex flex-col border-r border-[#dfe1e6]">
        <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
          <FileText className="w-4 h-4 text-[#5e6c84]" />
          <span className="text-[12px] font-semibold text-[#172b4d]">Summary</span>
        </div>
        <Toolbar />
        <textarea
          value={localSummary}
          onChange={(e) => { setLocalSummary(e.target.value); onSummaryChange?.(e.target.value); }}
          className="flex-1 p-3 text-[12px] leading-relaxed text-[#172b4d] outline-none resize-none"
          placeholder="Start typing..."
        />
        <div className="h-6 bg-[#f8f9fa] border-t border-[#dfe1e6] px-3 flex items-center justify-end gap-3 text-[10px] text-[#5e6c84] shrink-0">
          <span>Words: {wordCount}</span>
          <span>Characters: {localSummary.length}</span>
        </div>
      </div>

      {/* Right - Checklist */}
      <div className="w-[400px] flex flex-col">
        <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
          <ClipboardList className="w-4 h-4 text-[#5e6c84]" />
          <span className="text-[11px] font-semibold text-[#172b4d]">Scope of Work (Checked items show on PDF)</span>
        </div>
        <div className="flex-1 overflow-auto">
          {localItems.map((item) => (
            <div key={item.id} className="h-8 px-2 flex items-center gap-2 border-b border-[#f0f0f0]">
              <GripVertical className="w-3 h-3 text-[#b3bac5] cursor-grab shrink-0" />
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {
                  const newItems = localItems.map(i => i.id === item.id ? { ...i, checked: !i.checked } : i);
                  setLocalItems(newItems);
                  onItemsChange?.(newItems);
                }}
                className="w-4 h-4 rounded border-[#dfe1e6] shrink-0"
              />
              <input
                type="text"
                value={item.text}
                onChange={(e) => {
                  const newItems = localItems.map(i => i.id === item.id ? { ...i, text: e.target.value } : i);
                  setLocalItems(newItems);
                  onItemsChange?.(newItems);
                }}
                placeholder="Add Scope of Work (max 2000 characters)."
                className="flex-1 text-[11px] text-[#172b4d] bg-transparent outline-none"
                maxLength={2000}
              />
            </div>
          ))}
          <div className="h-8 px-2 flex items-center gap-2 cursor-pointer hover:bg-[#f4f5f7]" onClick={addItem}>
            <GripVertical className="w-3 h-3 text-[#dfe1e6] shrink-0" />
            <input type="checkbox" disabled className="w-4 h-4 rounded border-[#dfe1e6] shrink-0" />
            <span className="text-[11px] text-[#b3bac5]">Add Scope of Work (max 2000 characters).</span>
          </div>
        </div>
      </div>
    </div>
  );
}
