"use client";

import type { JobFile, JobDeliverable } from "@/types";

interface FileListProps {
  files: (JobFile | JobDeliverable)[];
  title?: string;
  emptyMessage?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎬";
  if (mimeType === "application/pdf") return "📄";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "📊";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "📽️";
  if (mimeType.includes("document") || mimeType.includes("word")) return "📝";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
  return "📎";
}

export function FileList({
  files,
  title = "Files",
  emptyMessage = "No files attached",
}: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium">{title}</p>}
      <div className="space-y-2">
        {files.map((file) => (
          <a
            key={file.id}
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <span className="text-xl">{getFileIcon(file.mimeType)}</span>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.size)} &middot; {formatDate(file.uploadedAt)}
                {"version" in file && file.version > 1 && ` &middot; v${file.version}`}
              </p>
            </div>
            <span className="text-muted-foreground text-sm">Download</span>
          </a>
        ))}
      </div>
    </div>
  );
}
