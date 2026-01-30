# Nimmit

**The Operating System for Virtual Work.**

A tech-enabled platform where **Nimmit is the service**. Clients submit work to the platform; AI analyzes tasks and routes them to the best available specialist. A lean team of 10 AI-powered professionals can serve 100+ clients.

---

## Project Status

**Phase:** MVP Development
**Current Sprint:** AI & Payments Integration
**Last Updated:** January 30, 2026

See [Task Backlog](./docs/tasks.md)

---

## Project Overview

**Nimmit is NOT a marketplace.** It's a platform-first managed service where:

- **Platform is the Brand** - Clients trust Nimmit, not individual workers. Workers are interchangeable.
- **Smart Routing** - AI analyzes tasks and assigns to the best available specialist automatically.
- **Context Cloud** - The platform remembers everything—any worker can pick up any task.
- **10-to-100 Scale** - AI handles 80% of friction; humans focus on execution.

### Key Features
- **AI Job Intake** - Structuring vague requests into actionable briefs.
- **Institutional Memory** - Platform holds context, workers are fungible.
- **Managed Quality** - Consistent output regardless of which worker executes.
- **Smart Routing** - Automatic assignment based on skills + availability.

### Target Market
- Digital solopreneurs ($5K-50K/month revenue)
- Small agencies (5-20 employees)
- Growing startups (pre-seed to Series A)

---

### Documentation
- [Concept](./docs/concept.md) - Service vision and operational model
- [Product Vision](./docs/product_vision.md) - UX and workflow design
- [Technical Design](./docs/design.md) - Architecture and database schemas
- [Market Research](./docs/market_research.md) - Target market and positioning
- [Task Backlog](./docs/tasks.md) - Prioritized development tasks

---

## Technology Stack

### Frontend
- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **State:** Zustand + TanStack Query

### Backend
- **Framework:** Next.js API Routes (Serverless)
- **Database:** MongoDB (Atlas)
- **Cache:** Redis (Upstash)
- **Queue:** Bull/BullMQ
- **Deployment:** Railway or Render

### Infrastructure
- **File Storage:** Cloudflare R2 (zero egress fees!)
- **Payments:** Stripe
- **Email:** SendGrid or Resend
- **AI:** OpenAI GPT-4 (job matching)
- **Monitoring:** Sentry

---

## Project Structure

```
nimmit/
├── docs/                    # Documentation
│   ├── concept.md           # Service vision and operational model
│   ├── design.md            # System architecture document
│   └── diagrams.md          # Architecture diagrams
│
├── src/                     # Source code
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   └── lib/                 # Utilities
│
├── .gitignore
└── README.md                # This file
```

---

## Roadmap

### ✅ Completed
- [x] User authentication (client, worker, admin)
- [x] Job creation and assignment (manual + AI)
- [x] Secure file storage (Cloudflare R2)
- [x] In-job messaging
- [x] Role-based dashboards
- [x] Job status workflow
- [x] Worker skill levels
- [x] AI job routing (auto-assignment)
- [x] Context Cloud v1 (Pinecone)

### 🔄 In Progress
- [ ] Stripe payment integration
- [ ] Real-time notifications (WebSocket)
- [ ] Email notifications

### 📋 Backlog
- [ ] QA automation for deliverables
- [ ] File validation & virus scanning
- [ ] Admin analytics dashboard
- [ ] Audit logging

See [docs/tasks.md](./docs/tasks.md) for detailed specs.

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Cloudflare R2 account
- Stripe account

### Development Setup

```bash
# Clone repository
git clone https://github.com/rithythul/nimmit.git
cd nimmit

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
bun run dev
```

---

## Contributing

This is a private project currently in development. Contribution guidelines will be added when the project moves to collaborative development.

---

## License

Proprietary - All rights reserved

---

## Contact

**Project Lead:** Rithy Thul
**Repository:** https://github.com/rithythul/nimmit

---

**Built in Cambodia, serving clients in the US**
