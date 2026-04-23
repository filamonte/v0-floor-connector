"use client";

import { useState } from "react";
import { Folder, Plus, X, FileIcon, Image, FileText } from "lucide-react";

type FileItem = { id: string; name: string; type: "image" | "document" | "other"; thumbnail?: string };
type FilesSectionProps = { files?: FileItem[]; onFilesChange?: (files: FileItem[]) => void; onUpload?: () => void };

export function FilesSection({ files = [], onFilesChange, onUpload }: FilesSectionProps) {
  const [localFiles, setLocalFiles] = useState(files);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const handleRemove = (id: string) => {
    const newFiles = localFiles.filter(f => f.id !== id);
    setLocalFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="h-9 bg-[#f8f9fa] border-b border-[#dfe1e6] px-3 flex items-center gap-2 shrink-0">
        <Folder className="w-4 h-4 text-[#5e6c84]" />
        <span className="text-[12px] font-semibold text-[#172b4d]">Files</span>
      </div>
      <div className="flex-1 p-3">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-2">
          <button
            type="button"
            onClick={onUpload}
            className="h-[80px] bg-[#f8f9fa] border-2 border-dashed border-[#dfe1e6] rounded flex items-center justify-center hover:border-[#ef7d32] hover:bg-[#fff9f5] transition"
          >
            <Plus className="w-5 h-5 text-[#b3bac5]" />
          </button>
          {localFiles.map((file) => {
            const Icon = file.type === "image" ? Image : file.type === "document" ? FileText : FileIcon;
            return (
              <div
                key={file.id}
                className="relative h-[80px] bg-white border border-[#dfe1e6] rounded overflow-hidden"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                {file.thumbnail ? (
                  <img src={file.thumbnail} alt={file.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                    <Icon className="w-6 h-6 text-[#b3bac5]" />
                    <span className="text-[9px] text-[#5e6c84] truncate px-1 max-w-full">{file.name}</span>
                  </div>
                )}
                {hoveredFile === file.id && (
                  <button
                    type="button"
                    onClick={() => handleRemove(file.id)}
                    className="absolute top-1 right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600"
                  >
                    <X className="w-2.5 h-2.5 text-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
