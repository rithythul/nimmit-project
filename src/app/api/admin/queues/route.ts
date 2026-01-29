import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getAllQueueStats, cleanQueues } from "@/lib/queue";

// GET /api/admin/queues - Get queue statistics (admin only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Admin access required" },
        },
        { status: 403 }
      );
    }

    const stats = await getAllQueueStats();

    return NextResponse.json({
      success: true,
      data: {
        queues: stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Queue stats error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch queue stats" },
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/queues - Clean old jobs from queues (admin only)
export async function POST() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "UNAUTHORIZED", message: "Not authenticated" },
        },
        { status: 401 }
      );
    }

    if (session.user.role !== "admin") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Admin access required" },
        },
        { status: 403 }
      );
    }

    await cleanQueues();

    return NextResponse.json({
      success: true,
      message: "Queues cleaned successfully",
    });
  } catch (error) {
    console.error("Queue clean error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to clean queues" },
      },
      { status: 500 }
    );
  }
}
