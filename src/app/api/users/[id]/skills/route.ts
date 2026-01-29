import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { z } from "zod";

const skillLevelSchema = z.enum(["junior", "mid", "senior"]);

const updateSkillLevelsSchema = z.object({
  skillLevels: z.record(z.string(), skillLevelSchema),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// PATCH /api/users/[id]/skills - Update worker skill levels (admin only)
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

    const parsed = updateSkillLevelsSchema.safeParse(body);
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

    if (!user.workerProfile) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "INVALID_STATE", message: "Worker profile not found" },
        },
        { status: 400 }
      );
    }

    // Update skill levels - only for skills the worker actually has
    const validSkillLevels: Record<string, string> = {};
    const workerSkills = user.workerProfile.skills || [];

    for (const [skill, level] of Object.entries(parsed.data.skillLevels)) {
      if (workerSkills.includes(skill)) {
        validSkillLevels[skill] = level;
      }
    }

    // Use set() to update Map fields in Mongoose
    await User.findByIdAndUpdate(id, {
      "workerProfile.skillLevels": validSkillLevels,
    });

    return NextResponse.json({
      success: true,
      data: {
        skillLevels: validSkillLevels,
      },
      message: "Skill levels updated",
    });
  } catch (error) {
    console.error("Update skill levels error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to update skill levels" },
      },
      { status: 500 }
    );
  }
}
