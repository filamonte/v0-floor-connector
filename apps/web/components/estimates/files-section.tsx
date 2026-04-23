"use client";

import { useState } from "react";
import { Folder, Plus, X, FileIcon, Image, FileText as FileDoc } from "lucide-react";

type FileItem = {
  id: string;
  name: string;
  type: "image" | "document" | "other";
  thumbnail?: string;
};

type FilesSectionProps = {
  files?: FileItem[];
  onFilesChange?: (files: FileItem[]) => void;
  onUpload?: () => void;
};

function getFileIcon(type: FileItem["type"]) {
  switch (type) {
    case "image":
      return Image;
    case "document":
      return FileDoc;
    default:
      return FileIcon;
  }
}

export function FilesSection({
  files = [],
  onFilesChange,
  onUpload
}: FilesSectionProps) {
  const [localFiles, setLocalFiles] = useState(files);
  const [hoveredFile, setHoveredFile] = useState<string | null>(null);

  const handleRemoveFile = (id: string) => {
    const newFiles = localFiles.filter((f) => f.id !== id);
    setLocalFiles(newFiles);
    onFilesChange?.(newFiles);
  };

  return (
    <section id="files">
      <div className="bg-white border border-[#e5e7eb] rounded-lg p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Folder className="w-[18px] h-[18px] text-gray-600" />
          <span className="text-[14px] font-semibold text-gray-900">Files</span>
        </div>

        {/* File Grid */}
        <div className="grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3">
          {/* Upload Tile */}
          <button
            type="button"
            onClick={onUpload}
            className="w-full h-[100px] bg-[#f9fafb] border-2 border-dashed border-[#d1d5db] rounded-lg flex items-center justify-center hover:border-[#ef7d32] hover:bg-[#fff9f5] transition"
          >
            <Plus className="w-6 h-6 text-gray-400" />
          </button>

          {/* File Tiles */}
          {localFiles.map((file) => {
            const Icon = getFileIcon(file.type);

            return (
              <div
                key={file.id}
                className="relative w-full h-[100px] bg-white border border-[#e5e7eb] rounded-lg overflow-hidden group"
                onMouseEnter={() => setHoveredFile(file.id)}
                onMouseLeave={() => setHoveredFile(null)}
              >
                {file.thumbnail ? (
                  <img
                    src={file.thumbnail}
                    alt={file.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                    <Icon className="w-8 h-8 text-gray-400" />
                    <span className="text-[11px] text-gray-500 truncate px-2 max-w-full">
                      {file.name}
                    </span>
                  </div>
                )}

                {/* Delete button on hover */}
                {hoveredFile === file.id && (
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(file.id)}
                    className="absolute top-1 right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center hover:bg-rose-600 transition"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
