# Nimmit Platform - Task Backlog

**Last Updated:** January 25, 2026
**Status:** Active Development

---

## Priority Legend

| Priority | Label | Meaning |
|----------|-------|---------|
| 🔴 P0 | **BLOCKER** | Must fix before any client onboarding |
| 🟠 P1 | **CRITICAL** | Must fix for product-market fit |
| 🟡 P2 | **IMPORTANT** | Should fix for good UX |
| 🟢 P3 | **NICE TO HAVE** | Can defer to post-launch |

---

## 🔴 P0 - Launch Blockers

### TASK-001: Secure File Storage Migration
**Priority:** 🔴 P0 - BLOCKER
**Effort:** 2-3 days
**Assignee:** TBD

#### Problem
Files are uploaded to `public/uploads/` and are publicly accessible. Any client file URL can be accessed without authentication.

#### Spec
1. **Remove** local file storage from `src/app/api/upload/route.ts`
2. **Integrate** Cloudflare R2 for file storage
3. **Implement** presigned URLs for uploads (client → R2 direct)
4. **Implement** presigned URLs for downloads (time-limited, auth-gated)
5. **Add** file metadata to job record (stored URL is R2 key, not public URL)

#### Acceptance Criteria
- [ ] No files in `public/uploads/`
- [ ] All file uploads go directly to R2
- [ ] Download URLs expire after 1 hour
- [ ] Only job participants can access job files
- [ ] Files organized by: `clients/{clientId}/jobs/{jobId}/{filename}`

#### Technical Details
```typescript
// Required environment variables
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=nimmit-files

// Presigned URL generation
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
```

#### Files to Modify
- `src/app/api/upload/route.ts` - Replace with R2 presigned URL generation
- `src/lib/storage/r2.ts` - New file for R2 client
- `src/components/job/file-upload.tsx` - Direct upload to presigned URL
- `src/components/job/file-list.tsx` - Fetch presigned download URLs

---

### TASK-002: Basic AI Job Routing
**Priority:** 🔴 P0 - BLOCKER
**Effort:** 3-4 days
**Assignee:** TBD

#### Problem
All job assignments are manual. Admin must be awake to route jobs. Breaks "Overnight Magic" promise. Cannot scale past ~20 concurrent clients.

#### Spec
1. **Create** AI routing service at `src/lib/ai/routing.ts`
2. **Implement** job analysis via OpenAI (extract skills, complexity)
3. **Implement** worker scoring algorithm
4. **Add** auto-assignment when job is created (if confidence > threshold)
5. **Fallback** to admin queue if no good match

#### Acceptance Criteria
- [ ] New jobs automatically analyzed for required skills
- [ ] Workers scored based on: skills (40%), availability (25%), performance (20%), workload (15%)
- [ ] Top-scoring available worker auto-assigned if score > 0.7
- [ ] Admin notified if no suitable worker (manual assignment needed)
- [ ] Assignment latency < 30 seconds for auto-routed jobs

#### Technical Details
```typescript
// src/lib/ai/routing.ts
interface JobAnalysis {
  requiredSkills: string[];
  complexity: 'simple' | 'medium' | 'complex';
  estimatedHours: number;
  confidence: number;
}

interface WorkerScore {
  workerId: string;
  score: number;
  breakdown: {
    skillMatch: number;      // 0-1
    availability: number;    // 0-1
    performance: number;     // 0-1
    workload: number;        // 0-1
  };
}

async function analyzeJob(description: string): Promise<JobAnalysis>;
async function scoreWorkers(job: JobAnalysis): Promise<WorkerScore[]>;
async function autoAssignJob(jobId: string): Promise<boolean>;
```

#### Files to Create/Modify
- `src/lib/ai/routing.ts` - New routing service
- `src/lib/ai/openai.ts` - OpenAI client wrapper
- `src/app/api/jobs/route.ts` - Call auto-assign after job creation
- `src/lib/db/models/job.ts` - Add `aiAnalysis` field to schema
- `src/types/index.ts` - Add AI-related types

---

### TASK-003: Worker Skill Levels
**Priority:** 🔴 P0 - BLOCKER
**Effort:** 1 day
**Assignee:** TBD

#### Problem
Workers have `skills[]` array but no skill level per skill. Cannot match job complexity to worker expertise.

#### Spec
1. **Add** `skillLevels` map to WorkerProfile schema
2. **Update** seed script with skill levels
3. **Update** admin UI to set skill levels
4. **Use** skill levels in routing algorithm

#### Acceptance Criteria
- [ ] Each worker skill has level: `junior` | `mid` | `senior`
- [ ] Complex jobs prefer senior workers
- [ ] Simple jobs can go to any level
- [ ] Admin can update skill levels

#### Technical Details
```typescript
// Updated WorkerProfile
workerProfile: {
  skills: string[];
  skillLevels: {
    [skill: string]: 'junior' | 'mid' | 'senior';
  };
  // ... rest unchanged
}
```

#### Files to Modify
- `src/types/index.ts` - Add SkillLevel type
- `src/lib/db/models/user.ts` - Add skillLevels field
- `scripts/seed.ts` - Update demo data
- `src/app/admin/team/page.tsx` - Add skill level editor

---

## 🟠 P1 - Critical for Product-Market Fit

### TASK-004: Context Cloud v1 (Vector Database)
**Priority:** 🟠 P1 - CRITICAL
**Effort:** 1-2 weeks
**Assignee:** TBD

#### Problem
No institutional memory. Workers cannot access previous job context. Clients must re-explain preferences. Core value proposition is undelivered.

#### Spec
1. **Set up** Pinecone (or pgvector) for vector storage
2. **Create** embedding pipeline for:
   - Job descriptions
   - Client feedback/reviews
   - Job deliverables metadata
3. **Implement** context retrieval on job creation
4. **Inject** relevant context into job briefing

#### Acceptance Criteria
- [ ] Every completed job is embedded and stored
- [ ] Client feedback is embedded and associated with client
- [ ] New job creation retrieves top 5 relevant past jobs
- [ ] Worker sees "Context from previous work" section
- [ ] Context retrieval latency < 500ms

#### Technical Details
```typescript
// src/lib/ai/context.ts
interface ContextItem {
  type: 'job' | 'feedback' | 'guideline';
  content: string;
  metadata: {
    clientId: string;
    jobId?: string;
    createdAt: Date;
  };
  similarity: number;
}

async function embedAndStore(content: string, metadata: object): Promise<void>;
async function retrieveContext(clientId: string, query: string): Promise<ContextItem[]>;
```

#### Files to Create
- `src/lib/ai/embeddings.ts` - OpenAI embedding generation
- `src/lib/ai/context.ts` - Context storage and retrieval
- `src/lib/ai/pinecone.ts` - Pinecone client
- `src/app/api/ai/context/route.ts` - Context API endpoint

#### Dependencies
- TASK-002 (AI routing infrastructure)

---

### TASK-005: Payment Integration (Stripe)
**Priority:** 🟠 P1 - CRITICAL
**Effort:** 1 week
**Assignee:** TBD

#### Problem
No way to charge clients or pay workers. No revenue.

#### Spec
1. **Set up** Stripe Connect for worker payouts
2. **Implement** subscription tiers (Starter/Growth/Scale)
3. **Implement** credit system
4. **Add** payment webhooks
5. **Create** billing dashboard for clients

#### Acceptance Criteria
- [ ] Clients can subscribe to a tier
- [ ] Credits deducted when job completes
- [ ] Workers receive payouts (manual trigger initially)
- [ ] Stripe webhook handles subscription events
- [ ] Client can view billing history

#### Technical Details
```typescript
// Subscription tiers
const TIERS = {
  starter: { price: 499, credits: 10, rollover: 2 },
  growth: { price: 999, credits: 25, rollover: 3 },
  scale: { price: 1999, credits: 60, rollover: 6 },
};
```

#### Files to Create
- `src/lib/payments/stripe.ts` - Stripe client
- `src/app/api/payments/subscribe/route.ts` - Create subscription
- `src/app/api/payments/webhook/route.ts` - Stripe webhooks
- `src/app/client/billing/page.tsx` - Billing dashboard

---

### TASK-006: File Validation & Security
**Priority:** 🟠 P1 - CRITICAL
**Effort:** 2-3 days
**Assignee:** TBD

#### Problem
No validation on uploaded files. No virus scanning. Size limits not enforced server-side.

#### Spec
1. **Add** server-side file size validation (50MB limit)
2. **Add** MIME type validation (whitelist safe types)
3. **Integrate** ClamAV for virus scanning
4. **Add** file status: `pending_scan` → `verified` | `rejected`
5. **Block** download of unverified files

#### Acceptance Criteria
- [ ] Files > 50MB rejected with clear error
- [ ] Only whitelisted MIME types accepted
- [ ] All files scanned before available for download
- [ ] Infected files quarantined and admin notified
- [ ] Scan latency < 10 seconds for files < 10MB

#### Technical Details
```typescript
// Whitelisted MIME types
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.*',
  'application/zip', 'application/x-rar-compressed',
];
```

#### Files to Modify
- `src/app/api/upload/route.ts` - Add validation
- `src/lib/security/scanner.ts` - ClamAV integration
- `src/types/index.ts` - Add file status types

#### Dependencies
- TASK-001 (R2 migration - scan before storing)

---

### TASK-007: Quality Assurance Automation
**Priority:** 🟠 P1 - CRITICAL
**Effort:** 3-4 days
**Assignee:** TBD

#### Problem
No quality checks on deliverables. Inconsistent output damages brand.

#### Spec
1. **Add** automated checks before client review:
   - File integrity (not corrupted)
   - Resolution/quality minimums for images/video
   - File naming conventions
2. **Add** QA status to deliverables
3. **Block** submission if QA fails
4. **Notify** worker of QA issues

#### Acceptance Criteria
- [ ] Images checked for minimum resolution (1080p)
- [ ] Videos checked for codec, resolution, audio
- [ ] PDFs checked for corruption
- [ ] QA results shown to worker before submission
- [ ] Failed QA blocks "Submit for Review" action

#### Technical Details
```typescript
interface QAResult {
  passed: boolean;
  score: number; // 0-100
  checks: {
    name: string;
    passed: boolean;
    message?: string;
  }[];
}

async function checkDeliverable(fileUrl: string, mimeType: string): Promise<QAResult>;
```

#### Files to Create
- `src/lib/qa/checker.ts` - QA automation
- `src/lib/qa/image.ts` - Image-specific checks
- `src/lib/qa/video.ts` - Video-specific checks
- `src/app/api/jobs/[id]/deliverables/check/route.ts` - QA endpoint

---

## 🟡 P2 - Important for Good UX

### TASK-008: Real-Time Notifications
**Priority:** 🟡 P2 - IMPORTANT
**Effort:** 3-4 days
**Assignee:** TBD

#### Problem
No real-time updates. Users must refresh to see changes.

#### Spec
1. **Implement** WebSocket connection (Socket.io or native WS)
2. **Broadcast** events: job status changes, new messages, assignments
3. **Add** notification bell with unread count
4. **Show** toast notifications for important events

#### Acceptance Criteria
- [ ] Job status changes appear without refresh
- [ ] New messages appear in real-time
- [ ] Notification bell shows unread count
- [ ] Toast appears for: assignment, message, completion

---

### TASK-009: Email Notifications
**Priority:** 🟡 P2 - IMPORTANT
**Effort:** 2-3 days
**Assignee:** TBD

#### Problem
No email notifications. Users miss important events.

#### Spec
1. **Set up** Resend or SendGrid
2. **Create** email templates for key events
3. **Add** notification preferences per user
4. **Queue** emails via BullMQ (don't block API)

#### Acceptance Criteria
- [ ] Email sent on: job assigned, job completed, payment received
- [ ] Users can disable email notifications
- [ ] Emails are branded and professional
- [ ] Delivery latency < 1 minute

---

### TASK-010: Admin Analytics Dashboard
**Priority:** 🟡 P2 - IMPORTANT
**Effort:** 3-4 days
**Assignee:** TBD

#### Problem
No visibility into platform health, worker utilization, revenue.

#### Spec
1. **Add** dashboard with key metrics
2. **Charts:** Jobs by status, revenue over time, worker utilization
3. **Tables:** Top workers, at-risk clients, overdue jobs

#### Acceptance Criteria
- [ ] Dashboard loads in < 2 seconds
- [ ] Data refreshes every 5 minutes
- [ ] Charts are interactive (hover for details)

---

## 🟢 P3 - Nice to Have (Post-Launch)

### TASK-011: Audit Logging
**Priority:** 🟢 P3
**Effort:** 2 days

#### Spec
Log all significant actions: job creation, assignment, status changes, file uploads, payments.

---

### TASK-012: Worker Performance Reports
**Priority:** 🟢 P3
**Effort:** 2-3 days

#### Spec
Weekly/monthly reports for workers showing: jobs completed, ratings, earnings, areas for improvement.

---

### TASK-013: Client Onboarding Flow
**Priority:** 🟢 P3
**Effort:** 2-3 days

#### Spec
Guided onboarding: brand questionnaire, first job creation, payment setup.

---

### TASK-014: Mobile Responsive Improvements
**Priority:** 🟢 P3
**Effort:** 2-3 days

#### Spec
Optimize all pages for mobile viewing. Workers should be able to check jobs on phone.

---

### TASK-015: API Rate Limiting
**Priority:** 🟢 P3
**Effort:** 1 day

#### Spec
Implement rate limiting on all API routes to prevent abuse.

---

## Task Dependencies

```
TASK-001 (File Storage) ─────┬──→ TASK-006 (File Validation)
                             │
TASK-002 (AI Routing) ───────┼──→ TASK-004 (Context Cloud)
                             │
TASK-003 (Skill Levels) ─────┘

TASK-005 (Payments) ─────────→ Independent

TASK-007 (QA) ───────────────→ Depends on TASK-001

TASK-008 (Real-Time) ────────→ Independent
TASK-009 (Email) ────────────→ Independent
```

---

## Sprint Plan Recommendation

### Sprint 1 (Week 1-2): Security & Foundation
- TASK-001: Secure File Storage ✅
- TASK-003: Worker Skill Levels ✅
- TASK-006: File Validation ✅

### Sprint 2 (Week 3-4): AI & Automation
- TASK-002: AI Job Routing ✅
- TASK-007: QA Automation ✅

### Sprint 3 (Week 5-6): Revenue & Scale
- TASK-005: Payment Integration ✅
- TASK-008: Real-Time Notifications ✅

### Sprint 4 (Week 7-8): The Moat
- TASK-004: Context Cloud v1 ✅
- TASK-009: Email Notifications ✅

### Post-Launch
- TASK-010 through TASK-015

---

## Definition of Done

For each task to be considered complete:

- [ ] Code implemented and working
- [ ] Types added/updated
- [ ] Error handling in place
- [ ] Basic tests written (if applicable)
- [ ] Documentation updated
- [ ] PR reviewed and merged
- [ ] Deployed to staging
- [ ] Smoke tested

---

*Document maintained by: Engineering Team*
*Next review: Weekly sprint planning*
