import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getJobContext, formatContextForWorker } from "@/lib/ai/context";
import { z } from "zod";

const getContextSchema = z.object({
  clientId: z.string(),
  title: z.string(),
  description: z.string(),
  topK: z.number().min(1).max(10).optional(),
});

// POST /api/ai/context - Get relevant context for a job
export async function POST(request: NextRequest) {
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

    // Only workers and admins can retrieve context
    if (!["worker", "admin"].includes(session.user.role)) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Access denied" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = getContextSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid input",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
      );
    }

    const { clientId, title, description, topK } = parsed.data;

    // Retrieve context
    const contextItems = await getJobContext(clientId, title, description, topK || 5);

    // Format for display
    const formattedContext = formatContextForWorker(contextItems);

    return NextResponse.json({
      success: true,
      data: {
        items: contextItems,
        formatted: formattedContext,
      },
    });
  } catch (error) {
    console.error("Get context error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to retrieve context" },
      },
      { status: 500 }
    );
  }
}
