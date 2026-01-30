// ===========================================
// Dead Letter Queue (DLQ) Service
// ===========================================
// Handles jobs that have exhausted all retry attempts
// Provides mechanisms for inspection, categorization, and manual retry

import { Job, Queue } from "bullmq";
import { connection } from "./connection";
import { logger } from "@/lib/logger";
import type { QueueJobData } from "./types";

// ===========================================
// Types
// ===========================================

export type DLQReason =
  | "max_retries_exceeded"
  | "unrecoverable_error"
  | "timeout"
  | "rate_limited"
  | "validation_error";

export interface DLQEntry {
  id: string;
  queueName: string;
  jobName: string;
  data: QueueJobData;
  failedReason: string;
  dlqReason: DLQReason;
  stackTrace?: string;
  attemptsMade: number;
  maxAttempts: number;
  processedOn?: Date;
  failedAt: Date;
  addedToDlqAt: Date;
  retryCount: number;
}

export interface DLQStats {
  total: number;
  byQueue: Record<string, number>;
  byReason: Record<DLQReason, number>;
  oldestEntry?: Date;
  newestEntry?: Date;
}

// ===========================================
// DLQ Queue
// ===========================================

export const dlqQueue = new Queue<DLQEntry>("dead-letter-queue", {
  connection,
  defaultJobOptions: {
    removeOnComplete: false, // Keep DLQ entries until manually processed
    removeOnFail: false,
  },
});

// ===========================================
// DLQ Service Functions
// ===========================================

/**
 * Categorize the failure reason based on error message
 */
function categorizeFailure(failedReason: string): DLQReason {
  const lowerReason = failedReason.toLowerCase();

  if (lowerReason.includes("timeout") || lowerReason.includes("timed out")) {
    return "timeout";
  }
  if (lowerReason.includes("rate limit") || lowerReason.includes("429")) {
    return "rate_limited";
  }
  if (
    lowerReason.includes("validation") ||
    lowerReason.includes("invalid") ||
    lowerReason.includes("required")
  ) {
    return "validation_error";
  }
  if (
    lowerReason.includes("fatal") ||
    lowerReason.includes("unrecoverable") ||
    lowerReason.includes("not found")
  ) {
    return "unrecoverable_error";
  }

  return "max_retries_exceeded";
}

/**
 * Add a failed job to the dead letter queue
 */
export async function addToDLQ(
  job: Job,
  failedReason: string,
  stackTrace?: string
): Promise<string> {
  const dlqEntry: DLQEntry = {
    id: job.id || `unknown-${Date.now()}`,
    queueName: job.queueName,
    jobName: job.name,
    data: job.data as QueueJobData,
    failedReason,
    dlqReason: categorizeFailure(failedReason),
    stackTrace,
    attemptsMade: job.attemptsMade,
    maxAttempts: (job.opts?.attempts || 3),
    processedOn: job.processedOn ? new Date(job.processedOn) : undefined,
    failedAt: new Date(),
    addedToDlqAt: new Date(),
    retryCount: 0,
  };

  const dlqJob = await dlqQueue.add("failed-job", dlqEntry, {
    jobId: `dlq-${job.queueName}-${job.id}`,
  });

  logger.info("DLQ", `Added job ${job.id} from ${job.queueName} to DLQ`, { reason: dlqEntry.dlqReason });

  return dlqJob.id || "";
}

/**
 * Get all entries from the DLQ with optional filtering
 */
export async function getDLQEntries(options: {
  queueName?: string;
  dlqReason?: DLQReason;
  limit?: number;
  offset?: number;
}): Promise<{ entries: DLQEntry[]; total: number }> {
  const { limit = 50, offset = 0 } = options;

  // Get jobs from the waiting/delayed states (DLQ jobs are held, not processed)
  const jobs = await dlqQueue.getJobs(["waiting", "delayed"], offset, offset + limit - 1);

  let entries = jobs
    .filter((job) => job.data)
    .map((job) => job.data as DLQEntry);

  // Apply filters
  if (options.queueName) {
    entries = entries.filter((e) => e.queueName === options.queueName);
  }
  if (options.dlqReason) {
    entries = entries.filter((e) => e.dlqReason === options.dlqReason);
  }

  const total = await dlqQueue.getWaitingCount();

  return { entries, total };
}

/**
 * Get a single DLQ entry by ID
 */
export async function getDLQEntry(dlqJobId: string): Promise<DLQEntry | null> {
  const job = await dlqQueue.getJob(dlqJobId);
  if (!job) return null;
  return job.data as DLQEntry;
}

/**
 * Get DLQ statistics
 */
export async function getDLQStats(): Promise<DLQStats> {
  const { entries, total } = await getDLQEntries({ limit: 1000 });

  const byQueue: Record<string, number> = {};
  const byReason: Record<DLQReason, number> = {
    max_retries_exceeded: 0,
    unrecoverable_error: 0,
    timeout: 0,
    rate_limited: 0,
    validation_error: 0,
  };

  let oldestEntry: Date | undefined;
  let newestEntry: Date | undefined;

  for (const entry of entries) {
    // Count by queue
    byQueue[entry.queueName] = (byQueue[entry.queueName] || 0) + 1;

    // Count by reason
    byReason[entry.dlqReason]++;

    // Track oldest/newest
    const entryDate = new Date(entry.addedToDlqAt);
    if (!oldestEntry || entryDate < oldestEntry) {
      oldestEntry = entryDate;
    }
    if (!newestEntry || entryDate > newestEntry) {
      newestEntry = entryDate;
    }
  }

  return {
    total,
    byQueue,
    byReason,
    oldestEntry,
    newestEntry,
  };
}

/**
 * Remove a job from the DLQ (after manual resolution)
 */
export async function removeDLQEntry(dlqJobId: string): Promise<boolean> {
  const job = await dlqQueue.getJob(dlqJobId);
  if (!job) return false;

  await job.remove();
  logger.info("DLQ", `Removed entry ${dlqJobId}`);
  return true;
}

/**
 * Retry a job from the DLQ by re-adding it to its original queue
 */
export async function retryDLQEntry(
  dlqJobId: string,
  targetQueue: Queue
): Promise<{ success: boolean; newJobId?: string; error?: string }> {
  const job = await dlqQueue.getJob(dlqJobId);
  if (!job) {
    return { success: false, error: "DLQ entry not found" };
  }

  const entry = job.data as DLQEntry;

  // Check if the target queue matches the original queue
  if (entry.queueName !== targetQueue.name) {
    return {
      success: false,
      error: `Queue mismatch: entry is from ${entry.queueName}, target is ${targetQueue.name}`,
    };
  }

  try {
    // Add back to original queue with fresh attempts
    const newJob = await targetQueue.add(entry.jobName, entry.data, {
      jobId: `retry-${entry.id}-${entry.retryCount + 1}`,
    });

    // Update the DLQ entry with retry count
    entry.retryCount++;
    await job.updateData(entry);

    // Remove from DLQ after successful re-queue
    await job.remove();

    logger.info("DLQ", `Retried job ${entry.id} -> new job ${newJob.id} in ${entry.queueName}`);

    return { success: true, newJobId: newJob.id || undefined };
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    logger.error("DLQ", `Failed to retry job ${entry.id}`, { error: errMsg });
    return { success: false, error: errMsg };
  }
}

/**
 * Bulk retry all jobs matching a filter
 */
export async function bulkRetryDLQ(
  filter: { queueName?: string; dlqReason?: DLQReason },
  targetQueues: Record<string, Queue>
): Promise<{ retried: number; failed: number; errors: string[] }> {
  const { entries } = await getDLQEntries({ ...filter, limit: 500 });

  let retried = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const entry of entries) {
    const targetQueue = targetQueues[entry.queueName];
    if (!targetQueue) {
      failed++;
      errors.push(`No target queue for ${entry.queueName}`);
      continue;
    }

    const dlqJobId = `dlq-${entry.queueName}-${entry.id}`;
    const result = await retryDLQEntry(dlqJobId, targetQueue);

    if (result.success) {
      retried++;
    } else {
      failed++;
      if (result.error) {
        errors.push(`${entry.id}: ${result.error}`);
      }
    }
  }

  logger.info("DLQ", `Bulk retry completed`, { retried, failed });

  return { retried, failed, errors };
}

/**
 * Purge old DLQ entries (cleanup)
 */
export async function purgeDLQ(olderThanDays: number = 30): Promise<number> {
  const { entries } = await getDLQEntries({ limit: 1000 });
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - olderThanDays);

  let purged = 0;

  for (const entry of entries) {
    if (new Date(entry.addedToDlqAt) < cutoff) {
      const dlqJobId = `dlq-${entry.queueName}-${entry.id}`;
      const removed = await removeDLQEntry(dlqJobId);
      if (removed) purged++;
    }
  }

  logger.info("DLQ", `Purged entries older than ${olderThanDays} days`, { purged });

  return purged;
}
