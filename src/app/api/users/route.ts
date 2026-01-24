import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";

// GET /api/users - List users (admin only, primarily for listing workers)
export async function GET(request: Request) {
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

    await connectDB();

    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role") || "worker";
    const availability = searchParams.get("availability");

    const query: Record<string, unknown> = {
      role,
      isActive: true,
    };

    if (availability) {
      query["workerProfile.availability"] = availability;
    }

    const users = await User.find(query)
      .select("-passwordHash")
      .sort({ "profile.firstName": 1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get users error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch users" },
      },
      { status: 500 }
    );
  }
}
