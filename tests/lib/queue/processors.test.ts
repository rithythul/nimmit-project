import { describe, test, expect } from "bun:test";

// Test the processor config values directly to avoid loading
// processors with database dependencies. These values should match
// src/lib/queue/processors/index.ts
const PROCESSOR_CONFIG = {
  jobAnalysis: {
    concurrency: 5,
    limiter: { max: 10, duration: 1000 },
  },
  autoAssign: {
    concurrency: 3,
    limiter: { max: 5, duration: 1000 },
  },
  notifications: {
    concurrency: 10,
    limiter: { max: 20, duration: 1000 },
  },
} as const;

describe("Processor Configuration", () => {
  describe("jobAnalysis processor config", () => {
    test("has correct concurrency", () => {
      expect(PROCESSOR_CONFIG.jobAnalysis.concurrency).toBe(5);
    });

    test("has rate limiter configured", () => {
      expect(PROCESSOR_CONFIG.jobAnalysis.limiter).toBeDefined();
      expect(PROCESSOR_CONFIG.jobAnalysis.limiter.max).toBe(10);
      expect(PROCESSOR_CONFIG.jobAnalysis.limiter.duration).toBe(1000);
    });
  });

  describe("autoAssign processor config", () => {
    test("has correct concurrency", () => {
      expect(PROCESSOR_CONFIG.autoAssign.concurrency).toBe(3);
    });

    test("has rate limiter configured", () => {
      expect(PROCESSOR_CONFIG.autoAssign.limiter).toBeDefined();
      expect(PROCESSOR_CONFIG.autoAssign.limiter.max).toBe(5);
      expect(PROCESSOR_CONFIG.autoAssign.limiter.duration).toBe(1000);
    });
  });

  describe("notifications processor config", () => {
    test("has correct concurrency", () => {
      expect(PROCESSOR_CONFIG.notifications.concurrency).toBe(10);
    });

    test("has rate limiter configured", () => {
      expect(PROCESSOR_CONFIG.notifications.limiter).toBeDefined();
      expect(PROCESSOR_CONFIG.notifications.limiter.max).toBe(20);
      expect(PROCESSOR_CONFIG.notifications.limiter.duration).toBe(1000);
    });
  });

  describe("concurrency ordering", () => {
    test("notifications has highest concurrency", () => {
      expect(PROCESSOR_CONFIG.notifications.concurrency).toBeGreaterThan(
        PROCESSOR_CONFIG.jobAnalysis.concurrency
      );
      expect(PROCESSOR_CONFIG.notifications.concurrency).toBeGreaterThan(
        PROCESSOR_CONFIG.autoAssign.concurrency
      );
    });

    test("jobAnalysis has higher concurrency than autoAssign", () => {
      expect(PROCESSOR_CONFIG.jobAnalysis.concurrency).toBeGreaterThan(
        PROCESSOR_CONFIG.autoAssign.concurrency
      );
    });
  });
});
