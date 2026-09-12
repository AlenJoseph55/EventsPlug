# Tasks: Pivot to Lightweight Embeddable Widget System

## 1. Schema & Backend Pruning
- [x] Prune `apps/backend/prisma/schema.prisma` to remove `WidgetTheme`, `WidgetSkin`, `OrganizationThemeUnlock`, and attendee check-in fields.
- [x] Run Prisma migration / push to update database schema.
- [x] Remove ticket check-in and theme management API controllers/services from `apps/backend`.
- [x] Simplify `RegistrationsService` to handle form submission persistence and CSV export endpoint.

## 2. Dashboard Simplification (`apps/dashboard`)
- [x] Remove scanner drawer, attendee ticket passport views, and theme marketplace pages.
- [x] Refactor Portal Sidebar & Navigation to show: Forms, Builder & Embed Snippet, Submissions (CSV Export).
- [x] Implement 1-click Embed Code Generator component (`<script>` and React snippet).
- [x] Implement Submissions table view with instant CSV download button.
- [x] Ensure Standalone Page `/e/[orgSlug]/[eventSlug]` renders the streamlined form cleanly.

## 3. Widget Optimization (`apps/widget`)
- [x] Remove canvas backdrop shader implementations (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`).
- [x] Refactor Web Component to apply a single, polished dark/light responsive CSS stylesheet.
- [x] Ensure Inline, Modal, and Drawer embed modes function cleanly with zero external CSS leaks (Shadow DOM).

## 4. Verification & Testing
- [x] Verify form submission flow end-to-end via Web Component embed.
- [x] Verify Standalone form page submission.
- [x] Verify CSV export produces accurate headers and answers JSON mapping.
