"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Eraser,
  Heading2,
  Heading3,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Pilcrow,
  Redo2,
  Underline,
  Undo2
} from "lucide-react";

type RichTextEditorMode = "compact" | "standard" | "document";

type RichTextEditorProps = {
  label?: string;
  name?: string;
  value?: string | null;
  placeholder?: string;
  minHeight?: number;
  mode?: RichTextEditorMode;
  readOnly?: boolean;
  className?: string;
  showStats?: boolean;
  onChange?: (value: string) => void;
};

type ToolbarAction = {
  label: string;
  icon: typeof Bold;
  command?: string;
  value?: string;
  run?: () => void;
};

const TOOLBAR_BUTTON_CLASS =
  "inline-flex items-center justify-center rounded-[4px] border border-transparent text-[#72829b] transition hover:bg-[#f4f6fa] hover:text-[#243a5f]";

function cx(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

function isMeaningfulHtml(value: string) {
  const plain = value
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > 0;
}

function countWords(value: string) {
  const plain = value
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

  return plain.length > 0 ? plain.split(" ").length : 0;
}

function getModeDefaults(mode: RichTextEditorMode) {
  switch (mode) {
    case "compact":
      return {
        minHeight: 140,
        buttonSizeClass: "h-7 w-7",
        contentPaddingClass: "px-3 py-3",
        contentTextClass: "text-[14px] leading-7"
      };
    case "document":
      return {
        minHeight: 520,
        buttonSizeClass: "h-8 w-8",
        contentPaddingClass: "px-4 py-4",
        contentTextClass: "text-[15px] leading-8"
      };
    default:
      return {
        minHeight: 320,
        buttonSizeClass: "h-7 w-7",
        contentPaddingClass: "px-4 py-4",
        contentTextClass: "text-[14px] leading-8"
      };
  }
}

export function RichTextEditor({
  label,
  name,
  value,
  placeholder = "Start typing...",
  minHeight,
  mode = "standard",
  readOnly = false,
  className,
  showStats = true,
  onChange
}: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [html, setHtml] = useState(value ?? "");
  const [isFocused, setIsFocused] = useState(false);
  const modeDefaults = useMemo(() => getModeDefaults(mode), [mode]);
  const resolvedMinHeight = minHeight ?? modeDefaults.minHeight;
  const editorId = `rich-editor-${useId().replace(/:/g, "")}`;

  useEffect(() => {
    const nextValue = value ?? "";

    setHtml((currentValue) => {
      if (currentValue === nextValue) {
        return currentValue;
      }

      if (editorRef.current && editorRef.current.innerHTML !== nextValue) {
        editorRef.current.innerHTML = nextValue;
      }

      return nextValue;
    });
  }, [value]);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== html) {
      editorRef.current.innerHTML = html;
    }
  }, [html]);

  function emitChange(nextValue: string) {
    setHtml(nextValue);
    onChange?.(nextValue);
  }

  function focusEditor() {
    editorRef.current?.focus();
  }

  function runCommand(command: string, commandValue?: string) {
    focusEditor();
    document.execCommand(command, false, commandValue);
    emitChange(editorRef.current?.innerHTML ?? "");
  }

  const toolbarActions: ToolbarAction[] = [
    { label: "Paragraph", icon: Pilcrow, run: () => runCommand("formatBlock", "p") },
    { label: "Heading 2", icon: Heading2, run: () => runCommand("formatBlock", "h2") },
    { label: "Heading 3", icon: Heading3, run: () => runCommand("formatBlock", "h3") },
    { label: "Undo", icon: Undo2, command: "undo" },
    { label: "Redo", icon: Redo2, command: "redo" },
    { label: "Bold", icon: Bold, command: "bold" },
    { label: "Italic", icon: Italic, command: "italic" },
    { label: "Underline", icon: Underline, command: "underline" },
    { label: "Align left", icon: AlignLeft, command: "justifyLeft" },
    { label: "Align center", icon: AlignCenter, command: "justifyCenter" },
    { label: "Align right", icon: AlignRight, command: "justifyRight" },
    { label: "Bullet list", icon: List, command: "insertUnorderedList" },
    { label: "Numbered list", icon: ListOrdered, command: "insertOrderedList" },
    {
      label: "Link",
      icon: LinkIcon,
      run: () => {
        const url = window.prompt("Enter a URL");

        if (url) {
          runCommand("createLink", url);
        }
      }
    },
    { label: "Clear formatting", icon: Eraser, command: "removeFormat" }
  ];

  const words = countWords(html);
  const characters = html.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, " ").length;
  const showPlaceholder = !isFocused && !isMeaningfulHtml(html);

  return (
    <div className={cx("border border-[#e3e7ee] bg-white", className)}>
      {label ? (
        <div className="border-b border-[#e3e7ee] bg-[#f7f8fb] px-4 py-3 text-[15px] font-semibold text-[#23395d]">
          {label}
        </div>
      ) : null}

      {!readOnly ? (
        <div className="flex flex-wrap items-center gap-1 border-b border-[#e3e7ee] bg-white px-2 py-1.5">
          <select
            defaultValue="Arial"
            onChange={(event) => runCommand("fontName", event.target.value)}
            className="h-8 rounded-[4px] border border-[#e3e7ee] px-2 text-[12px] text-[#243a5f]"
          >
            <option value="Arial">Arial</option>
            <option value="Georgia">Georgia</option>
            <option value="Times New Roman">Times</option>
            <option value="Verdana">Verdana</option>
          </select>
          <select
            defaultValue="3"
            onChange={(event) => runCommand("fontSize", event.target.value)}
            className="h-8 rounded-[4px] border border-[#e3e7ee] px-2 text-[12px] text-[#243a5f]"
          >
            <option value="2">Small</option>
            <option value="3">Body</option>
            <option value="4">Large</option>
            <option value="5">XL</option>
          </select>
          {toolbarActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.label}
                type="button"
                className={cx(TOOLBAR_BUTTON_CLASS, modeDefaults.buttonSizeClass)}
                aria-label={action.label}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  if (action.run) {
                    action.run();
                    return;
                  }

                  if (action.command) {
                    runCommand(action.command, action.value);
                  }
                }}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="relative">
        {showPlaceholder ? (
          <div className="pointer-events-none absolute left-0 top-0 z-10 px-4 py-4 text-[14px] text-slate-400">
            {placeholder}
          </div>
        ) : null}
        <div
          id={editorId}
          ref={editorRef}
          className={cx(
            "w-full outline-none",
            modeDefaults.contentPaddingClass,
            modeDefaults.contentTextClass,
            readOnly ? "cursor-default text-[#2d4368]" : "text-[#2d4368]"
          )}
          style={{ minHeight: resolvedMinHeight }}
          contentEditable={!readOnly}
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            emitChange(editorRef.current?.innerHTML ?? "");
          }}
          onInput={(event) => {
            emitChange((event.currentTarget as HTMLDivElement).innerHTML);
          }}
        />
      </div>

      {name ? <input type="hidden" name={name} value={html} /> : null}

      {showStats ? (
        <div className="border-t border-[#e3e7ee] px-4 py-2 text-right text-[12px] font-medium text-[#8b99b0]">
          Words: {words} Characters: {characters}
        </div>
      ) : null}
    </div>
  );
}
