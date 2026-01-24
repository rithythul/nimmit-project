import mongoose, { Schema, Model, Document, Types } from "mongoose";
import type {
  JobStatus,
  JobCategory,
  JobPriority,
  JobFile,
  JobDeliverable,
  JobMessage,
  UserRole,
} from "@/types";

// ===========================================
// Sub-Schemas
// ===========================================

const JobFileSchema = new Schema<JobFile>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending_validation", "verified", "rejected"],
      default: "pending_validation",
    },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JobDeliverableSchema = new Schema<JobDeliverable>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
    version: { type: Number, default: 1 },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JobMessageSchema = new Schema<JobMessage>(
  {
    id: { type: String, required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: {
      type: String,
      enum: ["client", "worker", "admin"] as UserRole[],
      required: true,
    },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

// ===========================================
// Job Document Interface
// ===========================================

export interface IJob extends Document {
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
// Job Schema
// ===========================================

const JobSchema = new Schema<IJob>(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    workerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 10000,
    },
    category: {
      type: String,
      enum: [
        "video",
        "design",
        "web",
        "social",
        "admin",
        "other",
      ] as JobCategory[],
      required: true,
      index: true,
    },
    priority: {
      type: String,
      enum: ["standard", "priority", "rush"] as JobPriority[],
      default: "standard",
    },
    status: {
      type: String,
      enum: [
        "pending",
        "assigned",
        "in_progress",
        "review",
        "revision",
        "completed",
        "cancelled",
      ] as JobStatus[],
      default: "pending",
      index: true,
    },

    files: { type: [JobFileSchema], default: [] },
    deliverables: { type: [JobDeliverableSchema], default: [] },
    messages: { type: [JobMessageSchema], default: [] },

    estimatedHours: { type: Number },
    actualHours: { type: Number },
    dueDate: { type: Date },

    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String, maxlength: 2000 },

    assignedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// ===========================================
// Indexes
// ===========================================

// For listing jobs by status
JobSchema.index({ status: 1, createdAt: -1 });

// For worker's job list
JobSchema.index({ workerId: 1, status: 1 });

// For client's job list
JobSchema.index({ clientId: 1, status: 1 });

// For admin's unassigned queue
JobSchema.index({ status: 1, workerId: 1, createdAt: 1 });

// ===========================================
// Export Model
// ===========================================

export const Job: Model<IJob> =
  mongoose.models.Job || mongoose.model<IJob>("Job", JobSchema);

export default Job;
