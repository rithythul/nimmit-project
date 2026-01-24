import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/types";

// Extend the NextAuth types
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: UserRole;
    name: string;
    avatar?: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    id: string;
    role: UserRole;
    avatar?: string;
  }
}

/**
 * Base auth config - Edge compatible (no Node.js dependencies)
 * Used by middleware for session validation
 */
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },

  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard =
        nextUrl.pathname.startsWith("/client") ||
        nextUrl.pathname.startsWith("/worker") ||
        nextUrl.pathname.startsWith("/admin");
      const isOnAuth =
        nextUrl.pathname === "/login" || nextUrl.pathname === "/register";

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect to login
      } else if (isOnAuth) {
        if (isLoggedIn) {
          // Redirect to appropriate dashboard
          const role = auth?.user?.role || "client";
          return Response.redirect(new URL(`/${role}/dashboard`, nextUrl));
        }
        return true;
      }
      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = user.role as UserRole;
        token.avatar = user.avatar as string | undefined;
      }
      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.avatar = token.avatar as string | undefined;
      }
      return session;
    },
  },

  providers: [], // Providers added in auth.ts (Node.js only)
};
