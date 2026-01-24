import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Allowed MIME types
const ALLOWED_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Archives
  "application/zip",
  "application/x-rar-compressed",
  // Text
  "text/plain",
  "text/csv",
]);

// Sanitize filename to prevent path traversal
function sanitizeFilename(filename: string): string {
  // Remove path components and special characters
  const sanitized = filename
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\.+/, "_")
    .trim();

  // Limit length
  const ext = path.extname(sanitized);
  const name = path.basename(sanitized, ext).slice(0, 100);

  return `${name}${ext}`;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "No file provided" } },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "File exceeds 50MB limit" } },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: "File type not allowed" } },
        { status: 400 }
      );
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const fileId = uuidv4();
    const sanitizedName = sanitizeFilename(file.name);
    const ext = path.extname(sanitizedName);
    const uniqueFilename = `${fileId}${ext}`;

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(UPLOAD_DIR, uniqueFilename);

    await writeFile(filePath, buffer);

    // Return file metadata
    const fileData = {
      id: fileId,
      name: sanitizedName,
      url: `/uploads/${uniqueFilename}`,
      size: file.size,
      mimeType: file.type,
    };

    return NextResponse.json({
      success: true,
      data: fileData,
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to upload file" } },
      { status: 500 }
    );
  }
}
