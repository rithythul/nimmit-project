import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import Job from "@/lib/db/models/job";
import { addMessageSchema } from "@/lib/validations/job";
import { v4 as uuidv4 } from "uuid";
import type { UserRole } from "@/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const body = await request.json();

    // Validate input
    const parsed = addMessageSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: parsed.error.issues[0]?.message || "Invalid input",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    const job = await Job.findById(jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: { code: "NOT_FOUND", message: "Job not found" } },
        { status: 404 }
      );
    }

    // Check access: client owner, assigned worker, or admin
    const userId = session.user.id;
    const userRole = session.user.role as UserRole;
    const isClient = job.clientId.toString() === userId;
    const isWorker = job.workerId?.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isClient && !isWorker && !isAdmin) {
      return NextResponse.json(
        { success: false, error: { code: "FORBIDDEN", message: "Access denied" } },
        { status: 403 }
      );
    }

    // Add message
    const newMessage = {
      id: uuidv4(),
      senderId: new Types.ObjectId(userId),
      senderRole: userRole,
      message: parsed.data.message,
      timestamp: new Date(),
    };

    job.messages.push(newMessage);
    await job.save();

    return NextResponse.json({
      success: true,
      data: newMessage,
      message: "Message sent",
    });
  } catch (error) {
    console.error("Error adding message:", error);
    return NextResponse.json(
      { success: false, error: { code: "SERVER_ERROR", message: "Internal server error" } },
      { status: 500 }
    );
  }
}
