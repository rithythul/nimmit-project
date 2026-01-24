import { z } from "zod";

// ===========================================
// Job Enums
// ===========================================

export const jobCategorySchema = z.enum([
  "video",
  "design",
  "web",
  "social",
  "admin",
  "other",
]);

export const jobPrioritySchema = z.enum(["standard", "priority", "rush"]);

export const jobStatusSchema = z.enum([
  "pending",
  "assigned",
  "in_progress",
  "review",
  "revision",
  "completed",
  "cancelled",
]);

// ===========================================
// Create Job Schema
// ===========================================

export const createJobSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title is too long"),
  description: z
    .string()
    .min(20, "Please provide more details about the task")
    .max(10000, "Description is too long"),
  category: jobCategorySchema,
  priority: jobPrioritySchema,
  dueDate: z.date().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;

// ===========================================
// Update Job Schema (for clients)
// ===========================================

export const updateJobSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title is too long")
    .optional(),
  description: z
    .string()
    .min(20, "Please provide more details about the task")
    .max(10000, "Description is too long")
    .optional(),
  category: jobCategorySchema.optional(),
  priority: jobPrioritySchema.optional(),
  dueDate: z.date().optional(),
});

export type UpdateJobInput = z.infer<typeof updateJobSchema>;

// ===========================================
// Assign Job Schema (for admins)
// ===========================================

export const assignJobSchema = z.object({
  workerId: z.string().min(1, "Worker is required"),
  estimatedHours: z.number().min(0.5).max(100).optional(),
});

export type AssignJobInput = z.infer<typeof assignJobSchema>;

// ===========================================
// Update Job Status Schema (for workers)
// ===========================================

export const updateJobStatusSchema = z.object({
  status: jobStatusSchema,
  actualHours: z.number().min(0).max(1000).optional(),
});

export type UpdateJobStatusInput = z.infer<typeof updateJobStatusSchema>;

// ===========================================
// Complete Job Schema (for clients)
// ===========================================

export const completeJobSchema = z.object({
  rating: z.number().min(1).max(5),
  feedback: z.string().max(2000).optional(),
});

export type CompleteJobInput = z.infer<typeof completeJobSchema>;

// ===========================================
// Add Message Schema
// ===========================================

export const addMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message is too long"),
});

export type AddMessageInput = z.infer<typeof addMessageSchema>;
