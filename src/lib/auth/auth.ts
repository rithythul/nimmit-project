import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db/connection";
import { User } from "@/lib/db/models";
import { loginSchema } from "@/lib/validations/user";
import { authConfig } from "./config";
import KIDProvider from "./kid-provider";
import type { User as NextAuthUser } from "next-auth";

/**
 * Full auth configuration with providers
 * Only used in Node.js environment (API routes, server components)
 */
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    // KID (KOOMPI ID) OAuth
    KIDProvider({
      clientId: process.env.KID_CLIENT_ID!,
      clientSecret: process.env.KID_CLIENT_SECRET!,
    }),
    // Credentials (Email/Password)
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<NextAuthUser | null> {
        try {
          // Validate input
          const parsed = loginSchema.safeParse(credentials);
          if (!parsed.success) {
            return null;
          }

          const { email, password } = parsed.data;

          // Connect to database
          await connectDB();

          // Find user with password field
          const user = await User.findOne({
            email: email.toLowerCase(),
            isActive: true,
          }).select("+passwordHash");

          if (!user) {
            return null;
          }

          // Verify password
          const isValid = await bcrypt.compare(password, user.passwordHash);
          if (!isValid) {
            return null;
          }

          // Return user data for session
          return {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            name: `${user.profile.firstName} ${user.profile.lastName}`,
            avatar: user.profile.avatar,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
});
