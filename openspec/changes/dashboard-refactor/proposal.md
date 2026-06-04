## Why

The portal dashboard (`apps/dashboard/src/app/portal/page.tsx`) has grown to 5,140 lines of monolithic React code. It manages authentication, stateful API integrations, modular tabs (Overview, Creation Wizard, Registrants List, Customize Standalone Hub, Team Members, Custom Themes Marketplace, Impersonation), and multiple modal overlays in a single file. 

This monolithic structure results in:
* **High Maintenance Overhead**: Navigating, reading, and modifying logic is extremely difficult.
* **Fragile Style Overrides**: Light mode is supported through a 350-line list of `.light-admin ... !important` overrides in `globals.css` that breaks standard Tailwind utilities and makes preset expansions impossible.
* **State Propagation Delays & UI Lag**: Every toggle, keystroke in form fields, or toast alert triggers re-renders across the entire portal page.
* **Repetitive Fetch/Loading Boilerplate**: Dozens of state variables are dedicated to managing API loading flags (`authLoading`, `loadingEvents`, `loadingRegs`, `savingCustomization`, `uploadingPoster`, `editSaving`, `deleteSaving`, `loadingMetrics`).

---

## What Changes

* **TanStack Query Integration**: Introduce `@tanstack/react-query` to decouple server data cache from the UI. It will automate loading/error indicators, caching, background refetches, and optimistic updates.
* **Semantic Custom CSS variables**: Refactor `globals.css` to use CSS custom variables mapped to Tailwind v4 theme tokens. All Tailwind styling classes (e.g., `bg-bg-panel`, `text-text-primary`) will adapt dynamically when switching themes, removing the need for manual `.light-admin` overrides.
* **Logical Hook Extraction**: Pull data-fetching and state management away from the UI views into dedicated, domain-specific hooks (`useEvents`, `useRegistrations`, `useTeamMembers`, `useHubCustomization`).
* **Component-Based Modularization**: Break down the monolithic page into a clean directory tree:
  * **Portal Shells**: Sidebar, Header.
  * **Tab Views**: Overview, Registrations, Standalone Hub Customization, Team Members, Themes, System Admin dashboard.
  * **Modals**: Edit, Delete, Share, Checkout, Create Tenant.

---

## Capabilities

### Modified Capabilities
* `portal-dashboard`: Refactor the application dashboard to implement a clean architecture with a modular directory layout, semantic CSS variable theme layers, and TanStack Query state caching.

---

## Impact

* **Database**: None (purely frontend architectural improvements).
* **Dependencies**: Add `@tanstack/react-query` package to `apps/dashboard/package.json`.
* **Build Configuration**: Wrap the root App Layout in a React Query `QueryClientProvider`.
* **Code Size & Readability**: Reduces `portal/page.tsx` from 5,140 lines to ~80 lines, and breaks down the logic into small, focused modules that are easy to test and maintain.
