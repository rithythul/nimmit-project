import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";

// GET /api/users/me/billing - Get current user's billing info
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

    if (session.user.role !== "client") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only clients have billing info" },
        },
        { status: 403 }
      );
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: { code: "NOT_FOUND", message: "User not found" },
        },
        { status: 404 }
      );
    }

    const billing = user.clientProfile?.billing || {
      credits: 0,
      rolloverCredits: 0,
    };

    return NextResponse.json({
      success: true,
      data: {
        subscriptionTier: billing.subscriptionTier,
        subscriptionStatus: billing.subscriptionStatus,
        credits: billing.credits,
        rolloverCredits: billing.rolloverCredits,
        billingPeriodEnd: billing.billingPeriodEnd,
      },
    });
  } catch (error) {
    console.error("Get billing error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to fetch billing info" },
      },
      { status: 500 }
    );
  }
}
