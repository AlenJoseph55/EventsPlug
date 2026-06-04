## 1. Database Schema Updates

- [ ] 1.1 Add the `hubThemeStyle` field to the `Organization` model in `apps/backend/prisma/schema.prisma`.
- [ ] 1.2 Synchronize the database schema with the local instance using `npx prisma db push`.

## 2. Backend DTOs & Validation

- [ ] 2.1 Update validation schemas and NestJS controller endpoints to validate and allow `hubThemeStyle` (enum: `DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`).

## 3. Contrast Guardrail Utility

- [ ] 3.1 Create a shared color utility function to calculate relative luminance and automatically scale hex color brightness to satisfy a WCAG AA contrast ratio of 4.5:1.

## 4. UI Dashboard Controls & Live Preview Mockup

- [ ] 4.1 Update `portal/page.tsx` state and API calls to support saving and loading `hubThemeStyle`.
- [ ] 4.2 Build a visual backdrop style picker panel in the portal's customization section.
- [ ] 4.3 Update the portal live preview mockup to render the moving spotlights, matrix grids, and pulsing auroras instantly.

## 5. Standalone Public Hub Rendering

- [ ] 5.1 Apply the dynamic CSS animations and backdrop grids to the public directory page at `apps/dashboard/src/app/o/[orgSlug]/page.tsx`.
- [ ] 5.2 Integrate the contrast utility to auto-adjust colors dynamically on render.

## 6. Verification

- [ ] 6.1 Validate OpenSpec specifications and compile the monorepo successfully.

## 7. Attendee Dark/Light Mode Switcher

- [ ] 7.1 Build the floating theme toggle component on the public directory page.
- [ ] 7.2 Implement state tracking, localStorage persistence, and system theme media query detection.
- [ ] 7.3 Update the page layout, card styling, and text colors to dynamically adapt when Light Mode is active.
- [ ] 7.4 Update the dynamic backdrops (Dot Matrix, Warp Grid, Aurora Ambient) to use dark accents/grids in Light Mode.
- [ ] 7.5 Update the portal customization mockup preview in `portal/page.tsx` to react to theme preset changes (dark/light background simulation).

## 8. Custom Background Color Selection
- [x] 8.1 Add `hubBgColor` field to the `Organization` model in `apps/backend/prisma/schema.prisma`.
- [x] 8.2 Run `npx prisma db push` to synchronize the database schema.
- [x] 8.3 Update NestJS controller `preferences.controller.ts` validation and patch endpoints to support `hubBgColor`.
- [x] 8.4 Update the `PublicOrgData` type interface in `public-api.ts`.
- [x] 8.5 Add a custom background color picker to the organizer customization page (`portal/page.tsx`).
- [x] 8.6 Update the live preview mockup in `portal/page.tsx` to render the custom background color in Dark Mode simulation.
- [x] 8.7 Update `PublicHubClient.tsx` to render the custom background color and pass it to the contrast utility.
