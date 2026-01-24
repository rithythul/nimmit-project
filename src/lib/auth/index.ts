/**
 * Auth exports for Node.js environment
 *
 * This file exports the full auth configuration with database providers.
 * Only import this in server components and API routes.
 *
 * For middleware (Edge runtime), import from ./config instead.
 */

export { handlers, signIn, signOut, auth } from "./auth";

// Helper to get session on server
export { auth as getServerSession } from "./auth";

// Helper type for auth session
export type { Session } from "next-auth";
