# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Nimmit** is a relationship-focused virtual assistant service connecting US clients with the KOOMPI team in Cambodia. Clients build real relationships with dedicated assistants who deliver work "overnight" while US clients sleep.

**Current Status:** MVP Development Phase
**Tech Stack:** Next.js 16, TypeScript, MongoDB, Redis, TailwindCSS, shadcn/ui

## Development Preferences

- **Package Manager:** Use `bun` instead of `npm` or `yarn` for all package operations
  - Install all deps: `bun install` (NOT `bun run install`)
  - Add package: `bun add <package>` or `bun add -d <package>` for dev
  - Run scripts: `bun run dev`, `bun run build`, `bun run seed`
  - Execute binaries: `bunx` instead of `npx`

## Quick Start

```bash
# Start local services
docker-compose up -d

# Install dependencies
bun install

# Seed demo data
bun run seed

# Run development server
bun run dev
```

## Demo Accounts (password: password123)

| Role   | Email                  |
|--------|------------------------|
| Admin  | admin@nimmit.com       |
| Client | john@example.com       |
| Client | sarah@example.com      |
| Worker | dara@koompi.com        |
| Worker | sreymom@koompi.com     |
| Worker | visal@koompi.com       |

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Register pages
│   ├── admin/           # Admin portal (dashboard, jobs, team)
│   ├── client/          # Client portal (dashboard, jobs)
│   ├── worker/          # Worker portal (dashboard, jobs)
│   └── api/             # API routes
├── components/
│   ├── ui/              # shadcn/ui components
│   ├── shared/          # Shared components (navbar)
│   └── providers/       # React context providers
├── lib/
│   ├── db/              # MongoDB connection and models
│   ├── auth/            # NextAuth.js configuration
│   └── validations/     # Zod schemas
├── types/               # TypeScript types
└── scripts/             # Database seed script
```

## Core Workflow

1. **Client** creates job → status: `pending`
2. **Admin** assigns to worker → status: `assigned`
3. **Worker** starts work → status: `in_progress`
4. **Worker** submits → status: `review`
5. **Client** approves with rating → status: `completed`

## API Response Format

```json
// Success
{ "success": true, "data": {...}, "message": "..." }

// Error
{ "success": false, "error": { "code": "...", "message": "..." } }
```

## Key Technologies

- **Framework:** Next.js 16 (App Router)
- **Database:** MongoDB with Mongoose
- **Auth:** NextAuth.js v5 (beta)
- **Validation:** Zod
- **Forms:** React Hook Form
- **UI:** TailwindCSS + shadcn/ui
- **Background Jobs:** BullMQ + Redis (planned)
- **File Storage:** Cloudflare R2 (planned)
- **Payments:** Stripe (planned)

## Environment Variables

See `.env.example` for required variables. Copy to `.env.local` for development.
