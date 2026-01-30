import IORedis from "ioredis";
import { logger } from "@/lib/logger";

// ===========================================
// Redis Connection Configuration
// ===========================================

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";

// Create a singleton Redis connection for BullMQ
const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null, // Required for BullMQ
  enableReadyCheck: false,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Connection error handling
connection.on("error", (error) => {
  logger.error("Queue", "Redis connection error", { error: String(error) });
});

connection.on("connect", () => {
  logger.info("Queue", "Redis connected");
});

connection.on("close", () => {
  logger.info("Queue", "Redis connection closed");
});

// Graceful shutdown
const close = async () => {
  await connection.quit();
  logger.info("Queue", "Redis connection closed gracefully");
};

// ===========================================
// Export
// ===========================================

export { connection, close };

// Export for testing
export const getRedisUrl = () => REDIS_URL;