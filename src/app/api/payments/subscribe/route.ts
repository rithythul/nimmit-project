import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { createCheckoutSession, SUBSCRIPTION_TIERS } from "@/lib/payments/stripe";
import { z } from "zod";

const subscribeSchema = z.object({
  tierId: z.enum(["starter", "growth", "scale"]),
});

// POST /api/payments/subscribe - Create checkout session
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

    if (session.user.role !== "client") {
      return NextResponse.json(
        {
          success: false,
          error: { code: "FORBIDDEN", message: "Only clients can subscribe" },
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = subscribeSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid tier",
            details: parsed.error.flatten().fieldErrors,
          },
        },
        { status: 400 }
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

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkout = await createCheckoutSession({
      tierId: parsed.data.tierId,
      customerId: user.clientProfile?.billing?.stripeCustomerId,
      customerEmail: user.email,
      successUrl: `${baseUrl}/client/billing?success=true`,
      cancelUrl: `${baseUrl}/client/billing?canceled=true`,
    });

    return NextResponse.json({
      success: true,
      data: {
        sessionId: checkout.sessionId,
        url: checkout.url,
      },
    });
  } catch (error) {
    console.error("Create subscription error:", error);
    return NextResponse.json(
      {
        success: false,
        error: { code: "SERVER_ERROR", message: "Failed to create checkout session" },
      },
      { status: 500 }
    );
  }
}

// GET /api/payments/subscribe - Get subscription tiers
export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      tiers: Object.values(SUBSCRIPTION_TIERS),
    },
  });
}
