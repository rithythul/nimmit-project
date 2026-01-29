"use client";

import { useState } from "react";
import type { JobFile, JobDeliverable } from "@/types";
import { toast } from "sonner";

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
  if (mimeType.startsWith("image/")) return "[IMG]";
  if (mimeType.startsWith("video/")) return "[VID]";
  if (mimeType === "application/pdf") return "[PDF]";
  if (mimeType.includes("spreadsheet") || mimeType.includes("excel")) return "[XLS]";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint")) return "[PPT]";
  if (mimeType.includes("document") || mimeType.includes("word")) return "[DOC]";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "[ZIP]";
  return "[FILE]";
}

function isR2Key(url: string): boolean {
  return url.startsWith("clients/");
}

async function getDownloadUrl(key: string): Promise<string | null> {
  try {
    const response = await fetch(`/api/files/${encodeURIComponent(key)}`);
    const result = await response.json();
    if (result.success) {
      return result.data.downloadUrl;
    }
    return null;
  } catch {
    return null;
  }
}

export function FileList({
  files,
  title = "Files",
  emptyMessage = "No files attached",
}: FileListProps) {
  const [loadingFile, setLoadingFile] = useState<string | null>(null);

  if (files.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        {emptyMessage}
      </div>
    );
  }

  const handleFileClick = async (file: JobFile | JobDeliverable, e: React.MouseEvent) => {
    const fileUrl = file.url;

    if (isR2Key(fileUrl)) {
      e.preventDefault();
      setLoadingFile(file.id);

      const downloadUrl = await getDownloadUrl(fileUrl);
      setLoadingFile(null);

      if (downloadUrl) {
        window.open(downloadUrl, "_blank");
      } else {
        toast.error("Failed to get download link");
      }
    }
  };

  return (
    <div className="space-y-2">
      {title && <p className="text-sm font-medium">{title}</p>}
      <div className="space-y-2">
        {files.map((file) => {
          const isLoading = loadingFile === file.id;
          const needsPresignedUrl = isR2Key(file.url);

          return (
            <a
              key={file.id}
              href={needsPresignedUrl ? "#" : file.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => handleFileClick(file, e)}
              className={`flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors ${
                isLoading ? "opacity-50 cursor-wait" : ""
              }`}
            >
              <span className="text-xl font-mono">{getFileIcon(file.mimeType)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)} &middot; {formatDate(file.uploadedAt)}
                  {"version" in file && file.version > 1 && ` &middot; v${file.version}`}
                </p>
              </div>
              <span className="text-muted-foreground text-sm">
                {isLoading ? "Loading..." : "Download"}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
