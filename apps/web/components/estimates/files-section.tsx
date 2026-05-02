"use client";

import { useEffect, useMemo, useRef } from "react";
import { Download, FileImage, FileText, FolderOpen, Plus, Trash2 } from "lucide-react";

type ExistingAttachment = {
  id: string;
  fileName: string;
  mimeType: string;
  downloadUrl: string | null;
};

type PendingAttachment = {
  id: string;
  file: File;
};

type FilesSectionProps = {
  existingAttachments: ExistingAttachment[];
  retainedAttachmentIds: string[];
  pendingAttachments: PendingAttachment[];
  onAddFiles: (files: File[]) => void;
  onRemoveExistingAttachment: (id: string) => void;
  onRemovePendingAttachment: (id: string) => void;
};

function isImageMimeType(mimeType: string) {
  return mimeType.startsWith("image/");
}

function formatFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function FilesSection({
  existingAttachments,
  retainedAttachmentIds,
  pendingAttachments,
  onAddFiles,
  onRemoveExistingAttachment,
  onRemovePendingAttachment
}: FilesSectionProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!fileInputRef.current) {
      return;
    }

    const dataTransfer = new DataTransfer();

    pendingAttachments.forEach((attachment) => {
      dataTransfer.items.add(attachment.file);
    });

    fileInputRef.current.files = dataTransfer.files;
  }, [pendingAttachments]);

  const visibleExistingAttachments = useMemo(
    () =>
      existingAttachments.filter((attachment) =>
        retainedAttachmentIds.includes(attachment.id)
      ),
    [existingAttachments, retainedAttachmentIds]
  );

  return (
    <section className="border-t border-[#e6e9ef] bg-white">
      <div className="border-b border-[#e6e9ef] bg-[#f8f8f8] px-4 py-3">
        <div className="flex items-center gap-3 text-[15px] font-semibold text-[#171717]">
          <FolderOpen className="h-4 w-4 text-[#5f5f5f]" />
          <h2>Files</h2>
        </div>
      </div>

      <div className="p-4">
        <label className="flex h-[102px] w-[130px] cursor-pointer items-center justify-center border border-dashed border-[#d4dae5] bg-[#f8f8f8] text-[#b8c1d2] transition hover:border-[#f4812a] hover:text-[#f4812a]">
          <Plus className="h-8 w-8" />
          <input
            ref={fileInputRef}
            name="newAttachments"
            type="file"
            multiple
            className="sr-only"
            onChange={(event) => {
              onAddFiles(Array.from(event.target.files ?? []));
              event.currentTarget.value = "";
            }}
          />
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          {visibleExistingAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex h-[110px] w-[140px] flex-col justify-between border border-[#d6d6d6] bg-white p-3 text-xs text-slate-500"
            >
              <div className="flex items-start justify-between gap-2">
                {isImageMimeType(attachment.mimeType) ? (
                  <FileImage className="h-6 w-6 text-slate-400" />
                ) : (
                  <FileText className="h-6 w-6 text-slate-400" />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveExistingAttachment(attachment.id)}
                  className="text-[#777777] hover:text-rose-600"
                  aria-label={`Remove ${attachment.fileName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="line-clamp-3 text-[#4a5e80]">{attachment.fileName}</span>
              {attachment.downloadUrl ? (
                <a
                  href={attachment.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[#ef7d32] hover:underline"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Open</span>
                </a>
              ) : (
                <span className="text-[#a1acbe]">Unavailable</span>
              )}
            </div>
          ))}

          {pendingAttachments.map((attachment) => (
            <div
              key={attachment.id}
              className="relative flex h-[110px] w-[140px] flex-col justify-between border border-[#d9e6ff] bg-[#f8f8f8] p-3 text-xs text-slate-500"
            >
              <div className="flex items-start justify-between gap-2">
                {isImageMimeType(attachment.file.type) ? (
                  <FileImage className="h-6 w-6 text-[#6f93d8]" />
                ) : (
                  <FileText className="h-6 w-6 text-[#6f93d8]" />
                )}
                <button
                  type="button"
                  onClick={() => onRemovePendingAttachment(attachment.id)}
                  className="text-[#777777] hover:text-rose-600"
                  aria-label={`Remove ${attachment.file.name}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <span className="line-clamp-3 text-[#4a5e80]">{attachment.file.name}</span>
              <span className="text-[#7f8ca4]">{formatFileSize(attachment.file.size)}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
