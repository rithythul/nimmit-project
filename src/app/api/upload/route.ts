import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { v4 as uuidv4 } from "uuid";
import { getPresignedUploadUrl } from "@/lib/storage/r2";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "video/mp4",
  "video/webm",
  "video/quicktime",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/zip",
  "application/x-rar-compressed",
  "text/plain",
  "text/csv",
]);

function sanitizeFilename(filename: string): string {
  const sanitized = filename
    .replace(/[/\\:*?"<>|]/g, "_")
    .replace(/\.\./g, "_")
    .replace(/^\.+/, "_")
    .trim();

  const ext = sanitized.lastIndexOf(".") > 0 ? sanitized.slice(sanitized.lastIndexOf(".")) : "";
  const name = sanitized.slice(0, sanitized.lastIndexOf(".") > 0 ? sanitized.lastIndexOf(".") : sanitized.length).slice(0, 100);

  return `${name}${ext}`;
}

/**
 * POST /api/upload
 * Generate a presigned URL for direct upload to R2
 *
 * Request body:
 * {
 *   filename: string;
 *   contentType: string;
 *   size: number;
 *   jobId: string;
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { filename, contentType, size, jobId } = body;

    if (!filename || !contentType || !jobId) {
      return NextResponse.json(
        { success: false, error: { code: "BAD_REQUEST", message: "Missing required fields: filename, contentType, jobId" } },
        { status: 400 }
      );
    }

    if (size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: { code: "FILE_TOO_LARGE", message: "File exceeds 50MB limit" } },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.has(contentType)) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_TYPE", message: "File type not allowed" } },
        { status: 400 }
      );
    }

    const fileId = uuidv4();
    const sanitizedName = sanitizeFilename(filename);
    const ext = sanitizedName.lastIndexOf(".") > 0 ? sanitizedName.slice(sanitizedName.lastIndexOf(".")) : "";
    const uniqueFilename = `${fileId}${ext}`;

    const clientId = session.user.id;
    const presigned = await getPresignedUploadUrl(
      clientId,
      jobId,
      uniqueFilename,
      contentType
    );

    return NextResponse.json({
      success: true,
      data: {
        uploadUrl: presigned.uploadUrl,
        key: presigned.key,
        fileId,
        filename: sanitizedName,
        expiresAt: presigned.expiresAt.toISOString(),
      },
      message: "Presigned URL generated",
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to generate upload URL" } },
      { status: 500 }
    );
  }
}
