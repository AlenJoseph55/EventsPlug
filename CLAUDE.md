# EventsPlug Developer Guide

## Build & Run Commands

### Development
- Run all dev servers: `pnpm dev`
- Run NestJS backend dev server: `pnpm --filter backend dev`
- Run Next.js dashboard dev server: `pnpm --filter dashboard dev`
- Run Widget build watcher: `pnpm --filter widget dev`

### Production Build
- Build the entire monorepo: `pnpm build`

### Quality & Linting
- Lint all projects: `pnpm lint`
- Validate OpenSpec specifications: `npx openspec validate --specs`

### Database
- Start local database container: `docker compose up -d`
- Sync database schema: `npx prisma db push`
- Run Prisma seeding: `npx prisma db seed`

## Design Context

### Users
- **Organizers**: Need a powerful, fast dashboard that makes setup feel professional and can be done in under 5 minutes, evoking confidence and speed.
- **Attendees**: Need a frictionless, clear registration experience that builds trust and makes event details clear.

### Brand Personality
- **3-Word Personality**: Sharp. Minimal. Reliable.
- **Tone & Voice**: Crisp, precise, and professional. Zero unnecessary decoration. Fast-feeling surfaces with command-driven clean UI.
- **Aesthetic Direction**:
  - **Inspirations**: Linear.app (dark surfaces, tight spacing), Vercel Dashboard (high density without clutter), Raycast (utilitarian, key-driven simplicity).
  - **Anti-References**: Avoid Canva-style playfulness, outdated Eventbrite clutter, characterless Google Forms, and generic "purple gradient on white" AI-generated SaaS aesthetics.

### Design Principles
1. **Dark-Mode First Intentionality**: Full dark/light support where the dark mode feels natively designed rather than simply inverted.
2. **Restrained Color Accents**: Use a single clean blue or indigo accent (e.g., `#4F6EF7` or `#5B6AF0`) sparingly. Neutral bases must rely on near-blacks and cool grays for dark mode, and off-whites/warm grays for light mode.
3. **Typography with Character**: Use a geometric sans-serif (Geist, DM Sans, Plus Jakarta Sans) for UI, and monospace (font-mono) strictly for technical fields, embed codes, and slug details. Avoid Inter and Roboto.
4. **Purposeful Spacing**: Generous whitespace to let elements breathe. Information density is reserved strictly for complex data screens (such as registration lists or form builders).
