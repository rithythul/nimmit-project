"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  key: string;
  size: number;
  mimeType: string;
}

interface FileUploadProps {
  jobId: string;
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
  jobId,
  onFilesUploaded,
  maxFiles = 10,
  maxSizeMB = 50,
  accept = "image/*,video/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx",
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`${file.name} exceeds ${maxSizeMB}MB limit`);
      return null;
    }

    try {
      const presignedResponse = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
          jobId,
        }),
      });

      const presignedResult = await presignedResponse.json();

      if (!presignedResponse.ok) {
        throw new Error(presignedResult.error?.message || "Failed to get upload URL");
      }

      const { uploadUrl, key, fileId, filename } = presignedResult.data;

      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Failed to upload file to storage");
      }

      return {
        id: fileId,
        name: filename,
        url: key,
        key,
        size: file.size,
        mimeType: file.type,
      };
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
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
        const uploaded = await uploadFile(file);
        if (uploaded) {
          uploadedFiles.push(uploaded);
          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));
        }
      }

      if (uploadedFiles.length > 0) {
        const newFiles = [...files, ...uploadedFiles];
        setFiles(newFiles);
        onFilesUploaded?.(newFiles);
        toast.success(`${uploadedFiles.length} file(s) uploaded`);
      }

      setIsUploading(false);
      setUploadProgress({});
    },
    [files, maxFiles, onFilesUploaded, jobId]
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

  const getDownloadUrl = async (key: string): Promise<string | null> => {
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
  };

  const handleViewFile = async (file: UploadedFile) => {
    const url = await getDownloadUrl(file.key);
    if (url) {
      window.open(url, "_blank");
    } else {
      toast.error("Failed to get file URL");
    }
  };

  return (
    <div className="space-y-4">
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
          <div className="text-4xl">+</div>
          <p className="font-medium">
            {isUploading ? "Uploading..." : "Drop files here or click to upload"}
          </p>
          <p className="text-sm text-muted-foreground">
            Max {maxSizeMB}MB per file, up to {maxFiles} files
          </p>
        </label>
      </div>

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
                      ? "[IMG]"
                      : file.mimeType.startsWith("video/")
                      ? "[VID]"
                      : file.mimeType === "application/pdf"
                      ? "[PDF]"
                      : "[FILE]"}
                  </span>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewFile(file)}
                    className="text-primary"
                  >
                    View
                  </Button>
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
