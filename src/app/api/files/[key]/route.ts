import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedDownloadUrl, parseStorageKey } from "@/lib/storage/r2";
import { connectDB } from "@/lib/db/connection";
import Job from "@/lib/db/models/job";

/**
 * GET /api/files/[key]
 * Generate a presigned download URL for a file
 * Only job participants (client, assigned worker, admin) can access
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { key } = await params;
    const decodedKey = decodeURIComponent(key);
    const parsed = parseStorageKey(decodedKey);

    if (!parsed) {
      return NextResponse.json(
        { success: false, error: { code: "INVALID_KEY", message: "Invalid file key format" } },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await Job.findById(parsed.jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    const userId = session.user.id;
    const userRole = session.user.role;
    const isClient = job.clientId.toString() === userId;
    const isWorker = job.workerId?.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isClient && !isWorker && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "You do not have access to this file" } },
        { status: 403 }
      );
    }

    const presigned = await getPresignedDownloadUrl(decodedKey);

    return NextResponse.json({
      success: true,
      data: {
        downloadUrl: presigned.downloadUrl,
        expiresAt: presigned.expiresAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Download URL generation error:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Failed to generate download URL" } },
      { status: 500 }
    );
  }
}
