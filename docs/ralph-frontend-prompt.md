# Ralph Loop Prompt: Nimmit Frontend Redesign

## Copy this prompt to start Ralph Loop:

---

```
/ralph-loop:ralph-loop

## Mission: Complete Frontend Redesign

You are redesigning the entire Nimmit frontend to adopt a **claude.ai-inspired aesthetic** - warm, approachable, professional, and distinctly NOT generic "AI slop."

### Design Reference: Claude.ai Aesthetic

**Visual Language:**
- Warm cream backgrounds (#FAF9F6) instead of stark white
- Terracotta/coral accent (#E07A5F) for primary actions
- Deep slate blue (#3D405B) for secondary elements
- Sage green (#81B29A) for success states
- Soft shadows, generous whitespace, rounded corners (12-16px)

**Typography:**
- Headings: Serif font (Newsreader or similar) - elegant, editorial feel
- Body: Clean sans-serif (Source Sans 3) - highly readable
- Avoid: Inter, Roboto, Arial, system fonts

**Interactions:**
- Subtle, purposeful animations (not flashy)
- Smooth hover states with slight elevation
- Staggered content reveals on page load
- Form fields with warm background, accent focus ring

### Task Tracking

Read the TODO file at `docs/frontend-redesign-todo.md` for the full task list.
Work through tasks in priority order (P0 first, then P1, then P2).
Mark tasks complete in the TODO file as you finish them.

### Implementation Guidelines

1. **Design System First (DESIGN-001 to DESIGN-003)**
   - Create CSS variables in `src/styles/design-tokens.css`
   - Update Tailwind config with custom theme
   - Override shadcn components to match aesthetic

2. **Landing Page (DESIGN-004 to DESIGN-008)**
   - This is the first impression - make it memorable
   - Hero with large serif headline, warm gradient
   - Clear value proposition for the Nimmit service
   - Smooth scroll animations

3. **Auth Pages (DESIGN-009 to DESIGN-010)**
   - Centered card on warm patterned background
   - Clean form styling with validation states

4. **Portals (DESIGN-011 to DESIGN-022)**
   - Client, Worker, Admin dashboards
   - Consistent card styling across all portals
   - Status badges with warm color palette
   - Job detail pages with chat-style messaging

5. **Shared Components (DESIGN-023 to DESIGN-026)**
   - Navigation, empty states, loading skeletons, error pages

6. **Polish (DESIGN-027 to DESIGN-030)**
   - Page transitions, micro-interactions, responsive, accessibility

### Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** TailwindCSS + shadcn/ui
- **Package Manager:** Use `bun` (not npm)
- **Animations:** CSS transitions preferred, Framer Motion if needed

### Files to Create/Modify

**New files:**
- `src/styles/design-tokens.css` - CSS variables
- `src/components/layout/base-layout.tsx` - Page wrapper
- `src/components/shared/footer.tsx` - Site footer

**Modify:**
- `tailwind.config.ts` - Custom theme colors, fonts
- `src/app/globals.css` - Import design tokens, base styles
- `src/app/layout.tsx` - Font imports
- All `src/components/ui/*.tsx` - shadcn overrides
- All `src/app/**/page.tsx` - Page redesigns

### Quality Standards

- No generic AI aesthetic (purple gradients, Inter font, etc.)
- Every page should feel cohesive with the design system
- Mobile responsive (test at 375px, 768px, 1024px, 1440px)
- Accessible (visible focus states, color contrast)
- Performance (no layout shift, optimized images)

### Verification

After completing each major phase:
1. Run `bun run dev` and visually verify
2. Check mobile responsiveness
3. Ensure no TypeScript errors
4. Update TODO file with completion status

Start with DESIGN-001 (design system foundation) and work sequentially.
```

---

## Alternative: Focused Session Prompts

If you prefer shorter, focused sessions:

### Session 1: Foundation + Landing
```
/ralph-loop:ralph-loop

Complete DESIGN-001 through DESIGN-008 from docs/frontend-redesign-todo.md.
Focus on establishing the design system and creating a stunning landing page.
Use claude.ai-inspired aesthetic: warm cream backgrounds, terracotta accents, serif headings.
```

### Session 2: Authentication
```
/ralph-loop:ralph-loop

Complete DESIGN-009 and DESIGN-010 from docs/frontend-redesign-todo.md.
Redesign login and register pages with warm, approachable aesthetic.
Match the design system established in previous session.
```

### Session 3: Client Portal
```
/ralph-loop:ralph-loop

Complete DESIGN-011 through DESIGN-015 from docs/frontend-redesign-todo.md.
Redesign all client portal pages: dashboard, job list, job detail, new job, billing.
Maintain consistency with established design system.
```

### Session 4: Worker Portal
```
/ralph-loop:ralph-loop

Complete DESIGN-016 through DESIGN-018 from docs/frontend-redesign-todo.md.
Redesign worker portal pages: dashboard, job list, job detail.
Focus on efficient workflow for workers managing multiple jobs.
```

### Session 5: Admin Portal
```
/ralph-loop:ralph-loop

Complete DESIGN-019 through DESIGN-022 from docs/frontend-redesign-todo.md.
Redesign admin portal: dashboard, jobs, job detail, team management.
Emphasize data density while maintaining warm aesthetic.
```

### Session 6: Polish
```
/ralph-loop:ralph-loop

Complete DESIGN-023 through DESIGN-030 from docs/frontend-redesign-todo.md.
Polish shared components, add page transitions, micro-interactions.
Perform responsive and accessibility audit.
```
