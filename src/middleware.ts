import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";
import type { UserRole } from "@/types";

/**
 * Middleware for route protection
 *
 * Uses edge-compatible auth config (no database dependencies)
 * Session validation happens via JWT in the cookie
 */

// Create auth middleware from edge-compatible config
const { auth } = NextAuth(authConfig);

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/register"];

// Role-based route prefixes
const roleRoutes: Record<UserRole, string> = {
  client: "/client",
  worker: "/worker",
  admin: "/admin",
};

// Dashboard redirects by role
const dashboardRoutes: Record<UserRole, string> = {
  client: "/client/dashboard",
  worker: "/worker/dashboard",
  admin: "/admin/dashboard",
};

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // Allow API routes and static files
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Public routes - redirect authenticated users to dashboard
  if (publicRoutes.includes(pathname)) {
    if (session?.user) {
      const dashboardUrl = dashboardRoutes[session.user.role as UserRole];
      return NextResponse.redirect(new URL(dashboardUrl, req.url));
    }
    return NextResponse.next();
  }

  // Protected routes - redirect unauthenticated users to login
  if (!session?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check role-based access
  const userRole = session.user.role as UserRole;

  // Check if user is accessing their designated area
  for (const [role, prefix] of Object.entries(roleRoutes)) {
    if (pathname.startsWith(prefix)) {
      if (userRole !== role && userRole !== "admin") {
        // Redirect to user's own dashboard
        return NextResponse.redirect(
          new URL(dashboardRoutes[userRole], req.url)
        );
      }
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
