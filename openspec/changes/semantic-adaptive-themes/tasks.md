## 1. Database Schema Updates

- [x] 1.1 Add the `WidgetSkin` model defining structural styling parameters to `apps/backend/prisma/schema.prisma`.
- [x] 1.2 Add the `skinId` relation to `Event` and `defaultSkinId`/`hubSkinId` to `Organization` in `apps/backend/prisma/schema.prisma`.
- [x] 1.3 Update NestJS controller DTOs and validation rules to allow semantic theme parameters and visual skin IDs.
- [x] 1.4 Run `npx prisma db push` to synchronize the database schema with the local instance.

## 2. Seed Preset Migration

- [x] 2.1 Update the database seed script `apps/backend/prisma/seed.ts` to create default structural skins (`frosted-glass`, `brutalist-bold`, `minimalist-soft`, `retro-cyber`).
- [x] 2.2 Update the database seed script `apps/backend/prisma/seed.ts` to convert `WidgetTheme` variables to semantic intent parameters (`baseMode`, `accentHue`, `surfaceTone`).
- [x] 2.3 Run `npm run seed` or prisma seed command to update global presets in the local database.

## 3. Frontend Color Derivation Engine

- [x] 3.1 Implement the dynamic color derivation helper `deriveThemeVariables(intent, mode)` in `apps/dashboard/src/lib/color-utils.ts` to calculate HSL variables dynamically.
- [x] 3.2 Add contrast guardrail checks to the derivation helper to automatically scale accent color lightness for WCAG AA compliance.

## 4. UI Dashboard Refactoring

- [x] 4.1 Update `CustomizationTab.tsx` to replace raw background and text color inputs with a single Accent Color picker and a Skin preset dock.
- [x] 4.2 Update the live preview mockup in the customizer tab to render dynamic, contrast-safe HSL colors and skin styling.
- [x] 4.3 Update `EditEventModal.tsx` to add a Skin Preset selector for event-level structural overrides.

## 5. Public Rendering Integration

- [x] 5.1 Refactor `PublicHubClient.tsx` to dynamically resolve skin properties and apply color palettes dynamically from semantic intent.
- [x] 5.2 Refactor `EventPageClient.tsx` to resolve event-level skin overrides while inheriting organization color palettes.

## 6. Verification

- [x] 6.1 Validate OpenSpec specifications and compile the monorepo successfully.
- [x] 6.2 Manually verify contrast levels and light/dark theme switches on both hub and event pages.
