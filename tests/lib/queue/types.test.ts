import { describe, test, expect } from "bun:test";
import type {
  JobAnalysisJobData,
  AutoAssignJobData,
  NotificationJobData,
  WebhookJobData,
  NotificationType,
} from "../../../src/lib/queue/types";
import { DEFAULT_QUEUE_CONFIG } from "../../../src/lib/queue/types";

describe("Queue Types", () => {
  describe("JobAnalysisJobData", () => {
    test("has correct shape", () => {
      const data: JobAnalysisJobData = {
        jobId: "test-job-123",
        title: "Create video",
        description: "Create a promotional video",
        category: "video",
        clientId: "client-123",
      };

      expect(data.jobId).toBe("test-job-123");
      expect(data.title).toBe("Create video");
      expect(data.description).toBe("Create a promotional video");
      expect(data.category).toBe("video");
      expect(data.clientId).toBe("client-123");
    });
  });

  describe("AutoAssignJobData", () => {
    test("has correct shape", () => {
      const data: AutoAssignJobData = {
        jobId: "test-job-123",
        title: "Design logo",
        description: "Design a company logo",
        category: "design",
      };

      expect(data.jobId).toBe("test-job-123");
      expect(data.title).toBe("Design logo");
      expect(data.category).toBe("design");
    });
  });

  describe("NotificationJobData", () => {
    test("supports job_assigned type", () => {
      const data: NotificationJobData = {
        userId: "user-123" as any,
        email: "test@example.com",
        type: "job_assigned",
        data: {
          jobId: "job-123",
          jobTitle: "Test Job",
          clientName: "John Doe",
        },
      };

      expect(data.type).toBe("job_assigned");
      expect(data.email).toBe("test@example.com");
      expect(data.data.jobTitle).toBe("Test Job");
    });

    test("supports all notification types", () => {
      const types: NotificationType[] = [
        "job_assigned",
        "job_status_change",
        "job_completed",
        "job_revision",
        "worker_welcome",
      ];

      types.forEach((type) => {
        const data: NotificationJobData = {
          userId: "user-123" as any,
          email: "test@example.com",
          type,
          data: {},
        };
        expect(data.type).toBe(type);
      });
    });
  });

  describe("WebhookJobData", () => {
    test("supports stripe webhook", () => {
      const data: WebhookJobData = {
        type: "stripe",
        payload: { event: "payment.succeeded" },
        headers: { "stripe-signature": "sig_123" },
      };

      expect(data.type).toBe("stripe");
      expect(data.headers["stripe-signature"]).toBe("sig_123");
    });

    test("supports retry count", () => {
      const data: WebhookJobData = {
        type: "custom",
        payload: {},
        headers: {},
        retryCount: 3,
      };

      expect(data.retryCount).toBe(3);
    });
  });

  describe("DEFAULT_QUEUE_CONFIG", () => {
    test("has correct default job options", () => {
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions).toBeDefined();
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.removeOnComplete).toBe(1000);
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.removeOnFail).toBe(5000);
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.attempts).toBe(3);
    });

    test("has exponential backoff", () => {
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.backoff).toBeDefined();
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.backoff?.type).toBe("exponential");
      expect(DEFAULT_QUEUE_CONFIG.defaultJobOptions?.backoff?.delay).toBe(1000);
    });
  });
});
