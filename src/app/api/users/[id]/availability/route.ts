import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { z } from "zod";

const updateAvailabilitySchema = z.object({
  availability: z.enum(["available", "busy", "offline"]),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/users/[id]/availability - Update worker availability (admin only)
export async function PATCH(request: Request, { params }: RouteParams) {
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

    const { id } = await params;
    const body = await request.json();

    const parsed = updateAvailabilitySchema.safeParse(body);
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

    await connectDB();

    const user = await User.findById(id);
    if (!user || user.role !== "worker") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "Worker not found" },
        },
        { status: 404 }
      );
    }

    user.workerProfile!.availability = parsed.data.availability;
    await user.save();

    return NextResponse.json({
      success: true,
      data: user,
      message: "Availability updated",
    });
  } catch (error) {
    console.error("Update availability error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update availability" },
      },
      { status: 500 }
    );
  }
}
