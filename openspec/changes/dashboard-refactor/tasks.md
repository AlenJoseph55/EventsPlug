## 1. Setup & CSS Refactoring

- [ ] 1.1 Install `@tanstack/react-query` dependency in the `dashboard` package.
- [ ] 1.2 Create the dynamic `QueryProvider.tsx` client wrapper.
- [ ] 1.3 Update `layout.tsx` to wrap the dashboard in `QueryProvider`.
- [ ] 1.4 Refactor `globals.css` to use CSS custom variables mapped to Tailwind v4 theme tokens.
- [ ] 1.5 Convert static colors in `portal/page.tsx` elements to use the new semantic variables (`bg-bg-app`, `bg-bg-panel`, etc.).
- [ ] 1.6 Remove manual overrides and test that theme switching swaps styling colors cleanly.

## 2. Core Hook Abstractions

- [ ] 2.1 Create the `useEvents.ts` custom query & mutation hook.
- [ ] 2.2 Create the `useRegistrations.ts` custom query hook.
- [ ] 2.3 Create the `useHubCustomization.ts` hook for custom styles, banners, and logo uploads.
- [ ] 2.4 Create the `useTeamMembers.ts` hook for role and team operations.

## 3. Portal Shells & Tab Views Deconstruction

- [ ] 3.1 Extract `Sidebar.tsx` and `Header.tsx` layout components.
- [ ] 3.2 Move the `Overview` tab presentation layer to `OverviewTab.tsx`.
- [ ] 3.3 Move the `Registrations` tab table and filtering presentation to `RegistrationsTab.tsx`.
- [ ] 3.4 Move the `Standalone Hub Customization` layout presentation to `CustomizationTab.tsx`.
- [ ] 3.5 Move the `Members` tab and invitations forms presentation to `MembersTab.tsx`.

## 4. Overlay Modals Extraction

- [ ] 4.1 Extract the `EditEventModal.tsx` dialogue with custom fields settings.
- [ ] 4.2 Extract the `ShareEventModal.tsx` dialogue with high-resolution QR download.
- [ ] 4.3 Extract the `DeleteEventModal.tsx` dialogue with safety name validation.
- [ ] 4.4 Clean up the main orchestrator file `/portal/page.tsx` and verify that the monorepo builds and runs correctly.
