# Nimmit

**Premium Asian Talent. Overnight Delivery. Fraction of US Cost.**

The **Operating System for Virtual Work**. A tech-enabled platform where US clients build long-term relationships with dedicated assistants, powered by AI.

---

## 🚀 Project Status

**Phase:** Architecture & Planning
**Next:** MVP Development (Weeks 1-6)

---

## 📋 Project Overview

**Nimmit is NOT a marketplace.** It's a relationship-focused virtual assistant service where:

- 🤝 **Real Relationships** - Clients build long-term partnerships with their dedicated assistant.
- 🛡️ **Trusted Team** - The KOOMPI team (trusted, trained, multi-skilled) delivers the work.
- ✨ **Overnight Magic** - US clients sleep, wake up to completed work.
- 🏆 **Trusted Partner** - Nimmit is a brand/partner, not a freelancer directory. We don't post jobs for random proposals.

### Key Features
-   🤖 **AI Job Intake (Nimmit)** - Structuring work for perfect execution.
-   🧠 **Context Cloud** - The platform remembers your brand voice.
-   ⚡ **Overnight Delivery** - Work while you sleep.
-   🎯 **Managed Quality** - Not a marketplace; a managed team.

### Target Market
- Digital solopreneurs ($5K-50K/month revenue)
- Small agencies (5-20 employees)
- Growing startups (pre-seed to Series A)

---

See [docs/design.md](./docs/design.md) for technical details and [docs/concept.md](./docs/concept.md) for the service vision.

---

## 🏗️ Technology Stack

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

## 📁 Project Structure

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

## 🎯 Roadmap

### Phase 1: MVP (Weeks 1-6)
- [ ] User authentication (client, worker, admin)
- [ ] Job creation and assignment
- [ ] File upload/download
- [ ] Basic messaging
- [ ] Stripe payment integration
- [ ] Admin dashboard

### Phase 2: Automation (Weeks 7-12)
- [ ] AI-powered job matching
- [ ] Subscription tiers with credits
- [ ] Real-time notifications
- [ ] Email notifications
- [ ] Worker performance tracking

### Phase 3: Scale (Months 4-6)
- [ ] Real-time messaging
- [ ] Time tracking
- [ ] Advanced analytics
- [ ] Referral system
- [ ] Quality assurance workflows

### Phase 4: Growth (Months 6-12)
- [ ] Mobile apps
- [ ] Advanced AI features
- [ ] Video processing automation
- [ ] API for integrations

---

## 🚦 Getting Started

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

# Install dependencies (coming soon)
# npm install

# Set up environment variables
# cp .env.example .env
# Edit .env with your credentials

# Run development server
# npm run dev
```

**Note:** Source code setup coming in Phase 1 MVP development.

---

## 🤝 Contributing

This is a private project currently in development. Contribution guidelines will be added when the project moves to collaborative development.

---

## 📄 License

Proprietary - All rights reserved

---

## 📞 Contact

**Project Lead:** Rithy Thul
**Repository:** https://github.com/rithythul/nimmit

---

**Built with ❤️ in Cambodia, serving clients in the US**
