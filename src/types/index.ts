import type { Types } from "mongoose";

// ===========================================
// User Types
// ===========================================

export type UserRole = "client" | "worker" | "admin";

export type WorkerAvailability = "available" | "busy" | "offline";

export interface WorkerStats {
  completedJobs: number;
  avgRating: number;
  totalEarnings: number;
}

export interface WorkerProfile {
  skills: string[];
  availability: WorkerAvailability;
  currentJobCount: number;
  maxConcurrentJobs: number;
  stats: WorkerStats;
  bio?: string;
}

export interface ClientProfile {
  company?: string;
  preferredWorkerId?: Types.ObjectId;
  totalJobs: number;
  totalSpent: number;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  phone?: string;
}

export interface User {
  _id: Types.ObjectId;
  email: string;
  passwordHash: string;
  role: UserRole;
  profile: UserProfile;
  workerProfile?: WorkerProfile;
  clientProfile?: ClientProfile;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ===========================================
// Job Types
// ===========================================

export type JobStatus =
  | "pending"
  | "assigned"
  | "in_progress"
  | "review"
  | "revision"
  | "completed"
  | "cancelled";

export type JobCategory =
  | "video"
  | "design"
  | "web"
  | "social"
  | "admin"
  | "other";

export type JobPriority = "standard" | "priority" | "rush";

export interface JobFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  status: "pending_validation" | "verified" | "rejected";
  uploadedAt: Date;
}

export interface JobDeliverable {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  version: number;
  uploadedAt: Date;
}

export interface JobMessage {
  id: string;
  senderId: Types.ObjectId;
  senderRole: UserRole;
  message: string;
  timestamp: Date;
}

export interface Job {
  _id: Types.ObjectId;
  clientId: Types.ObjectId;
  workerId?: Types.ObjectId;
  assignedBy?: Types.ObjectId;

  title: string;
  description: string;
  category: JobCategory;
  priority: JobPriority;
  status: JobStatus;

  files: JobFile[];
  deliverables: JobDeliverable[];
  messages: JobMessage[];

  estimatedHours?: number;
  actualHours?: number;
  dueDate?: Date;

  rating?: number;
  feedback?: string;

  createdAt: Date;
  updatedAt: Date;
  assignedAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
}

// ===========================================
// API Response Types
// ===========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ===========================================
// Session Types (for NextAuth)
// ===========================================

export interface SessionUser {
  id: string;
  email: string;
  role: UserRole;
  name: string;
  avatar?: string;
}
