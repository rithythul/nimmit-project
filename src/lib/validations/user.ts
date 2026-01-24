import { z } from "zod";

// ===========================================
// User Role
// ===========================================

export const userRoleSchema = z.enum(["client", "worker", "admin"]);

// ===========================================
// Registration Schema
// ===========================================

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long"),
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long"),
  role: userRoleSchema,
  company: z.string().max(100).optional(),
  timezone: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ===========================================
// Login Schema
// ===========================================

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ===========================================
// Update Profile Schema
// ===========================================

export const updateProfileSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name is too long")
    .optional(),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name is too long")
    .optional(),
  avatar: z.string().url().optional(),
  timezone: z.string().optional(),
  phone: z.string().max(20).optional(),
  company: z.string().max(100).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// ===========================================
// Worker Profile Schema
// ===========================================

export const updateWorkerProfileSchema = z.object({
  skills: z.array(z.string()).max(20).optional(),
  availability: z.enum(["available", "busy", "offline"]).optional(),
  maxConcurrentJobs: z.number().min(1).max(10).optional(),
  bio: z.string().max(500).optional(),
});

export type UpdateWorkerProfileInput = z.infer<typeof updateWorkerProfileSchema>;
