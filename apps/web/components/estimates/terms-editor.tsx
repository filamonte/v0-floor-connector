"use client";

import { useState } from "react";
import {
  FileText,
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
  Type,
  Palette,
  Highlighter
} from "lucide-react";

type TermsEditorProps = {
  defaultValue?: string;
  onChange?: (value: string) => void;
};

function EditorToolbar() {
  return (
    <div className="h-11 bg-white border-b border-[#e5e7eb] px-2 flex items-center gap-1">
      {/* Font Family */}
      <select className="h-7 px-2 text-[12px] border border-gray-200 rounded bg-white">
        <option>A</option>
      </select>

      {/* Font Size */}
      <select className="h-7 px-2 text-[12px] border border-gray-200 rounded bg-white w-[60px]">
        <option>Aa</option>
      </select>

      {/* Text Color */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Text Color"
      >
        <Palette className="w-4 h-4 text-gray-600" />
      </button>

      {/* Highlight */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Highlight"
      >
        <Highlighter className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Undo/Redo */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Undo"
      >
        <Undo className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Redo"
      >
        <Redo className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Text Formatting */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Bold"
      >
        <Bold className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Italic"
      >
        <Italic className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Underline"
      >
        <Underline className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Super/Subscript */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Superscript"
      >
        <Superscript className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Subscript"
      >
        <Subscript className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Alignment */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Align Left"
      >
        <AlignLeft className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Align Center"
      >
        <AlignCenter className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Align Right"
      >
        <AlignRight className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Lists */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Bullet List"
      >
        <List className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Numbered List"
      >
        <ListOrdered className="w-4 h-4 text-gray-600" />
      </button>

      <div className="w-px h-5 bg-gray-200 mx-1" />

      {/* Expand / Code */}
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Expand"
      >
        <Maximize2 className="w-4 h-4 text-gray-600" />
      </button>
      <button
        type="button"
        className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100"
        title="Code View"
      >
        <Code className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}

const DEFAULT_TERMS = `This estimate is based on the information provided and is subject to change if additional details emerge or project specifications are modified. Any changes will be communicated to the customer in writing prior to implementation. It does not constitute a final quote.

Unforeseen conditions during removal may necessitate additional costs and a change order. If the customer declines to approve the change order, the warranty may be adjusted or voided at Danek Flooring Inc.'s discretion.

Danek Flooring Inc. is not responsible for any damages occurring after installation is completed. Any post-installation repairs requested by the customer will be billed at standard labor rates.

REQUIREMENTS AT JOB SITE:

The job site must be broom-swept and dry, with both ambient and floor temperatures at 60°F or higher. Adequate lighting, removal of obstructions, and uninterrupted access are required for the full duration of the project.

SPECIAL NOTES, CONDITIONS, AND QUALIFICATIONS:

1. Work Schedule and Additional Charges: Unless otherwise specified, work will be conducted between 7:00 AM and 7:00 PM, Monday through Friday, excluding holidays. If the agreed-upon schedule is changed to require night work or weekend hours, additional charges will be incurred at Danek Flooring Inc.'s premium labor rates.

2. Delays or rework caused by conditions beyond our control—including but not limited to weather or deficiencies in job site requirements—will be billed at Danek Flooring Inc.'s standard labor and material rates.

3. Danek Flooring will install plastic barriers and utilize a negative air machine when necessary to minimize dust and contaminants during the project. These measures will be implemented only as required by job conditions and specifications. Full containment will incur additional cost.

4. All fire alarms in or near the work area must be capped or covered while work is in progress.

5. Multiple 110V circuits, as well as larger 208 3-phase (100 amp) or 480 3-phase (60 amp) power, may be required depending on project needs. Power and lighting are not provided by Danek Flooring. If needed, Danek Flooring can supply these at an additional cost.

6. All work will be completed in one mobilization.

7. Based on Open Shop Labor Rates.

8. This quote is valid for 14 days.`;

export function TermsEditor({ defaultValue, onChange }: TermsEditorProps) {
  const [content, setContent] = useState(defaultValue || DEFAULT_TERMS);

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setContent(newValue);
    onChange?.(newValue);
  };

  return (
    <section id="terms">
      <div className="bg-white border border-[#e5e7eb] rounded-lg overflow-hidden">
        {/* Header */}
        <div className="h-12 bg-[#f9fafb] border-b border-[#e5e7eb] px-4 flex items-center gap-3">
          <FileText className="w-[18px] h-[18px] text-gray-600" />
          <span className="text-[14px] font-semibold text-gray-900">
            Terms and Conditions
          </span>
        </div>

        {/* Label */}
        <div className="px-4 pt-3 pb-2">
          <span className="text-[13px] font-medium text-gray-700">Terms</span>
        </div>

        {/* Toolbar */}
        <EditorToolbar />

        {/* Content Area */}
        <div className="p-4">
          <textarea
            value={content}
            onChange={handleChange}
            className="w-full min-h-[400px] text-[14px] leading-[1.6] text-gray-900 bg-transparent outline-none resize-none"
            placeholder="Enter terms and conditions..."
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
