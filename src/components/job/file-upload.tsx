"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
}

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUpload({
  onFilesUploaded,
  maxFiles = 10,
  maxSizeMB = 50,
  accept = "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
      return null;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error?.message || "Upload failed");
      }

      return result.data;
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
      toast.error(`Failed to upload ${file.name}`);
      return null;
    }
  };

  const handleFiles = useCallback(
    async (fileList: FileList | null) => {
      if (!fileList || fileList.length === 0) return;

      const remaining = maxFiles - files.length;
      if (remaining <= 0) {
        toast.error(`Maximum ${maxFiles} files allowed`);
        return;
      }

      const filesToUpload = Array.from(fileList).slice(0, remaining);
      setIsUploading(true);

      const uploadedFiles: UploadedFile[] = [];
      for (const file of filesToUpload) {
        const uploaded = await uploadFile(file);
        if (uploaded) {
          uploadedFiles.push(uploaded);
        }
      }

      if (uploadedFiles.length > 0) {
        const newFiles = [...files, ...uploadedFiles];
        setFiles(newFiles);
        onFilesUploaded?.(newFiles);
        toast.success(`${uploadedFiles.length} file(s) uploaded`);
      }

      setIsUploading(false);
    },
    [files, maxFiles, onFilesUploaded]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeFile = (id: string) => {
    const newFiles = files.filter((f) => f.id !== id);
    setFiles(newFiles);
    onFilesUploaded?.(newFiles);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={isUploading}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer flex flex-col items-center gap-2"
        >
          <div className="text-4xl">📁</div>
          <p className="font-medium">
            {isUploading ? "Uploading..." : "Drop files here or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">
            Max {maxSizeMB}MB per file, up to {maxFiles} files
          </p>
        </label>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">Uploaded Files ({files.length})</p>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xl">
                    {file.mimeType.startsWith("image/")
                      ? "🖼️"
                      : file.mimeType.startsWith("video/")
                      ? "🎬"
                      : file.mimeType === "application/pdf"
                      ? "📄"
                      : "📎"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    View
                  </a>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
