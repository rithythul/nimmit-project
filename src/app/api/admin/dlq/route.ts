import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getDLQEntries,
  getDLQStats,
  removeDLQEntry,
  retryDLQEntry,
  bulkRetryDLQ,
  purgeDLQ,
  type DLQReason,
} from "@/lib/queue/dlq";
import { queues } from "@/lib/queue";

// ===========================================
// GET /api/admin/dlq - Get DLQ entries and stats
// ===========================================

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const view = url.searchParams.get("view") || "stats"; // stats | entries
    const queueName = url.searchParams.get("queue") || undefined;
    const dlqReason = (url.searchParams.get("reason") as DLQReason) || undefined;
    const limit = parseInt(url.searchParams.get("limit") || "50", 10);
    const offset = parseInt(url.searchParams.get("offset") || "0", 10);

    if (view === "stats") {
      const stats = await getDLQStats();
      return NextResponse.json({
        success: true,
        data: stats,
      });
    }

    // Get entries with optional filters
    const { entries, total } = await getDLQEntries({
      queueName,
      dlqReason,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: {
        entries,
        total,
        limit,
        offset,
        hasMore: offset + entries.length < total,
      },
    });
  } catch (error) {
    console.error("[Admin DLQ] Error fetching DLQ data:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch DLQ data",
        },
      },
      { status: 500 }
    );
  }
}

// ===========================================
// POST /api/admin/dlq - Perform DLQ actions
// ===========================================

interface DLQAction {
  action: "retry" | "remove" | "bulk_retry" | "purge";
  dlqJobId?: string;
  filter?: {
    queueName?: string;
    dlqReason?: DLQReason;
  };
  olderThanDays?: number;
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Admin access required" } },
        { status: 401 }
      );
    }

    const body: DLQAction = await request.json();

    switch (body.action) {
      case "retry": {
        if (!body.dlqJobId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "BAD_REQUEST", message: "dlqJobId is required for retry" },
            },
            { status: 400 }
          );
        }

        // Determine the target queue based on the entry
        const entry = await getDLQEntries({ limit: 1 });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queueMap: Record<string, any> = {
          "job-analysis": queues.jobAnalysis,
          "auto-assign": queues.autoAssign,
          notifications: queues.notifications,
          "webhook-events": queues.webhookEvents,
        };

        // Get the entry to find its queue
        const { entries } = await getDLQEntries({ limit: 100 });
        const targetEntry = entries.find(
          (e) => `dlq-${e.queueName}-${e.id}` === body.dlqJobId
        );

        if (!targetEntry) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "NOT_FOUND", message: "DLQ entry not found" },
            },
            { status: 404 }
          );
        }

        const targetQueue = queueMap[targetEntry.queueName];
        if (!targetQueue) {
          return NextResponse.json(
            {
              success: false,
              error: {
                code: "BAD_REQUEST",
                message: `Unknown queue: ${targetEntry.queueName}`,
              },
            },
            { status: 400 }
          );
        }

        const result = await retryDLQEntry(body.dlqJobId, targetQueue);

        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "RETRY_FAILED", message: result.error },
            },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          data: { newJobId: result.newJobId },
          message: "Job retried successfully",
        });
      }

      case "remove": {
        if (!body.dlqJobId) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "BAD_REQUEST", message: "dlqJobId is required for remove" },
            },
            { status: 400 }
          );
        }

        const removed = await removeDLQEntry(body.dlqJobId);

        if (!removed) {
          return NextResponse.json(
            {
              success: false,
              error: { code: "NOT_FOUND", message: "DLQ entry not found" },
            },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "DLQ entry removed",
        });
      }

      case "bulk_retry": {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queueMap: Record<string, any> = {
          "job-analysis": queues.jobAnalysis,
          "auto-assign": queues.autoAssign,
          notifications: queues.notifications,
          "webhook-events": queues.webhookEvents,
        };

        const result = await bulkRetryDLQ(body.filter || {}, queueMap);

        return NextResponse.json({
          success: true,
          data: result,
          message: `Bulk retry completed: ${result.retried} retried, ${result.failed} failed`,
        });
      }

      case "purge": {
        const olderThanDays = body.olderThanDays || 30;
        const purged = await purgeDLQ(olderThanDays);

        return NextResponse.json({
          success: true,
          data: { purged },
          message: `Purged ${purged} entries older than ${olderThanDays} days`,
        });
      }

      default:
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "BAD_REQUEST",
              message: "Invalid action. Use: retry, remove, bulk_retry, or purge",
            },
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Admin DLQ] Error processing action:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to process DLQ action",
        },
      },
      { status: 500 }
    );
  }
}
