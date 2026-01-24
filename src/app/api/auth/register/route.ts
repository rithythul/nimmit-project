import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { registerSchema } from "@/lib/validations/user";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const parsed = registerSchema.safeParse(body);
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

    const { email, password, firstName, lastName, role, company, timezone } =
      parsed.data;

    // Connect to database
    await connectDB();

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_EXISTS",
            message: "An account with this email already exists",
          },
        },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user based on role
    const userData: Record<string, unknown> = {
      email: email.toLowerCase(),
      passwordHash,
      role,
      profile: {
        firstName,
        lastName,
        timezone,
      },
    };

    // Add role-specific profile
    if (role === "client") {
      userData.clientProfile = {
        company: company || undefined,
        totalJobs: 0,
        totalSpent: 0,
      };
    } else if (role === "worker") {
      userData.workerProfile = {
        skills: [],
        availability: "offline",
        currentJobCount: 0,
        maxConcurrentJobs: 3,
        stats: {
          completedJobs: 0,
          avgRating: 0,
          totalEarnings: 0,
        },
      };
    }

    const user = await User.create(userData);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          name: `${user.profile.firstName} ${user.profile.lastName}`,
        },
        message: "Account created successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
