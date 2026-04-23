"use client";

import { useState } from "react";
import {
  FileText,
  ClipboardList,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Superscript,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Maximize2,
  Code,
  GripVertical,
  Palette,
  Highlighter,
  Undo,
  Redo
} from "lucide-react";

type ScopeItem = {
  id: string;
  text: string;
  checked: boolean;
};

type ScopeOfWorkProps = {
  summary?: string;
  items?: ScopeItem[];
  onSummaryChange?: (value: string) => void;
  onItemsChange?: (items: ScopeItem[]) => void;
};

function CompactToolbar() {
  return (
    <div className="h-10 bg-white border-b border-[#e5e7eb] px-2 flex items-center gap-1">
      <select className="h-6 px-1.5 text-[11px] border border-gray-200 rounded bg-white">
        <option>A</option>
      </select>
      <select className="h-6 px-1.5 text-[11px] border border-gray-200 rounded bg-white w-[50px]">
        <option>Aa</option>
      </select>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Palette className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Highlighter className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Undo className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Redo className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Bold className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Italic className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Underline className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Superscript className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Strikethrough className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <AlignLeft className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <List className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <ListOrdered className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <div className="w-px h-4 bg-gray-200 mx-0.5" />
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Maximize2 className="w-3.5 h-3.5 text-gray-600" />
      </button>
      <button type="button" className="w-6 h-6 flex items-center justify-center rounded hover:bg-gray-100">
        <Code className="w-3.5 h-3.5 text-gray-600" />
      </button>
    </div>
  );
}

export function ScopeOfWork({
  summary = "",
  items = [],
  onSummaryChange,
  onItemsChange
}: ScopeOfWorkProps) {
  const [localSummary, setLocalSummary] = useState(summary);
  const [localItems, setLocalItems] = useState<ScopeItem[]>(items);

  const wordCount = localSummary.trim() ? localSummary.trim().split(/\s+/).length : 0;
  const charCount = localSummary.length;

  const handleSummaryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalSummary(newValue);
    onSummaryChange?.(newValue);
  };

  const handleItemToggle = (id: string) => {
    const newItems = localItems.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setLocalItems(newItems);
    onItemsChange?.(newItems);
  };

  const handleItemTextChange = (id: string, text: string) => {
    const newItems = localItems.map((item) =>
      item.id === id ? { ...item, text } : item
    );
    setLocalItems(newItems);
    onItemsChange?.(newItems);
  };

  const addItem = () => {
    const newItem: ScopeItem = {
      id: `scope-${Date.now()}`,
      text: "",
      checked: false
    };
    const newItems = [...localItems, newItem];
    setLocalItems(newItems);
    onItemsChange?.(newItems);
  };

  return (
    <section id="scope-of-work">
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
        {/* Left Column - Summary */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="h-12 bg-[#f9fafb] border-b border-[#e5e7eb] px-4 flex items-center gap-3">
            <FileText className="w-[18px] h-[18px] text-gray-600" />
            <span className="text-[14px] font-semibold text-gray-900">Summary</span>
          </div>

          {/* Toolbar */}
          <CompactToolbar />

          {/* Content */}
          <div className="p-4">
            <textarea
              value={localSummary}
              onChange={handleSummaryChange}
              className="w-full min-h-[300px] text-[14px] leading-[1.6] text-gray-900 bg-transparent outline-none resize-none"
              placeholder="Start typing..."
            />
          </div>

          {/* Footer */}
          <div className="h-8 bg-[#f9fafb] border-t border-[#e5e7eb] px-4 flex items-center justify-end gap-4 text-[12px] text-gray-500">
            <span>Words: {wordCount}</span>
            <span>Characters: {charCount}</span>
          </div>
        </div>

        {/* Right Column - Checklist */}
        <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
          {/* Header */}
          <div className="h-12 bg-[#f9fafb] border-b border-[#e5e7eb] px-4 flex items-center gap-3">
            <ClipboardList className="w-[18px] h-[18px] text-gray-600" />
            <span className="text-[14px] font-semibold text-gray-900">
              Scope of Work (Checked items show on PDF)
            </span>
          </div>

          {/* Checklist Items */}
          <div className="divide-y divide-[#f0f0f0]">
            {localItems.map((item) => (
              <div
                key={item.id}
                className="h-10 px-3 flex items-center gap-3"
              >
                <GripVertical className="w-4 h-4 text-gray-300 cursor-grab shrink-0" />
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => handleItemToggle(item.id)}
                  className="w-[18px] h-[18px] rounded border-gray-300 shrink-0"
                />
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                  placeholder="Add Scope of Work (max 2000 characters)."
                  className="flex-1 text-[13px] text-gray-900 bg-transparent outline-none"
                  maxLength={2000}
                />
              </div>
            ))}

            {/* Add Item Row */}
            <div
              className="h-10 px-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50"
              onClick={addItem}
            >
              <GripVertical className="w-4 h-4 text-gray-200 shrink-0" />
              <input
                type="checkbox"
                disabled
                className="w-[18px] h-[18px] rounded border-gray-200 shrink-0"
              />
              <span className="text-[13px] text-gray-400">
                Add Scope of Work (max 2000 characters).
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
