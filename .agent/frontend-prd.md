# Frontend Redesign PRD - Loki Mode Execution

## Executive Summary

Implement the remaining frontend redesign tasks for the Nimmit platform, following a Claude.ai-inspired warm, professional aesthetic.

## Design System Reference

Use the tokens defined in `docs/frontend-redesign-todo.md`:
- Warm cream backgrounds (#FAF9F6)
- Terracotta accent (#E07A5F)
- Serif headings (Newsreader), sans-serif body (Source Sans 3)
- Soft shadows, rounded corners
- Generous whitespace

## Remaining Tasks (Prioritized)

### P0 - Authentication (Must Complete First)

1. **DESIGN-009**: Login page redesign
   - File: `src/app/(auth)/login/page.tsx`
   - Centered card, warm background, smooth form interactions

2. **DESIGN-010**: Register page redesign
   - File: `src/app/(auth)/register/page.tsx`
   - Match login aesthetic

### P1 - Client Portal

3. **DESIGN-011**: Client dashboard
   - File: `src/app/client/dashboard/page.tsx`
   - Welcome message, stats cards, recent jobs

4. **DESIGN-012**: Job list page
   - File: `src/app/client/jobs/page.tsx`
   - Filterable cards, status badges

5. **DESIGN-013**: Job detail page
   - File: `src/app/client/jobs/[id]/page.tsx`
   - Chat thread, file previews, timeline

6. **DESIGN-014**: New job creation
   - File: `src/app/client/jobs/new/page.tsx`
   - Multi-step form, drag-drop upload

7. **DESIGN-015**: Billing page
   - File: `src/app/client/billing/page.tsx`
   - Tier cards, usage viz, invoice table

### P1 - Worker Portal

8. **DESIGN-016**: Worker dashboard
   - File: `src/app/worker/dashboard/page.tsx`
   - Availability toggle, job queue, earnings

9. **DESIGN-017**: Worker job list
   - File: `src/app/worker/jobs/page.tsx`
   - Priority sorted, due dates

10. **DESIGN-018**: Worker job detail
    - File: `src/app/worker/jobs/[id]/page.tsx`
    - Context panel, deliverable upload

### P1 - Admin Portal

11. **DESIGN-019**: Admin dashboard
    - File: `src/app/admin/dashboard/page.tsx`
    - Metrics, pending queue, worker grid

12. **DESIGN-020**: Admin jobs page
    - File: `src/app/admin/jobs/page.tsx`
    - Data table, bulk actions

13. **DESIGN-021**: Admin job detail
    - File: `src/app/admin/jobs/[id]/page.tsx`
    - Full context, assignment, audit trail

14. **DESIGN-022**: Team management
    - File: `src/app/admin/team/page.tsx`
    - Worker cards, skills, metrics

### P2 - Shared Components

15. **DESIGN-023**: Navigation redesign
    - File: `src/components/shared/navbar.tsx`
    - Clean nav, user menu, mobile responsive

16. **DESIGN-024**: Empty states
    - Reusable component with illustrations

17. **DESIGN-025**: Loading states
    - Skeleton screens, subtle pulse

18. **DESIGN-026**: Error states
    - Friendly error pages (404, 500)

### P2 - Polish

19. **DESIGN-027**: Page transitions
    - Smooth fade/slide between routes

20. **DESIGN-028**: Micro-interactions
    - Button hovers, form focus animations

21. **DESIGN-029**: Responsive audit
    - Mobile-first refinements

22. **DESIGN-030**: Accessibility audit
    - Contrast, focus states, keyboard nav

## Implementation Guidelines

1. **Use existing design tokens** from `docs/frontend-redesign-todo.md`
2. **Override shadcn defaults** - no stock styling should remain
3. **Test on dev server** with `bun run dev`
4. **Commit after each major component** with conventional commits
5. **Update `docs/frontend-redesign-todo.md`** marking tasks as [x] when complete

## Success Criteria

- All 22 remaining tasks marked as [x] in docs/frontend-redesign-todo.md
- Consistent warm aesthetic across all pages
- Mobile responsive
- No TypeScript or linting errors
