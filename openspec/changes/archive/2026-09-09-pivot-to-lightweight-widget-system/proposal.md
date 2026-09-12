# Proposal: Pivot to Lightweight Embeddable Widget & Form Engine

## Why

`EventsPlug` was originally built with complex ticket inventory management, attendee check-in lifecycles (QR scanners, ticket PDF passes, waitlist auto-promotions), dynamic canvas shader backdrops (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`), and customizable monetization skins. 

For organizers who already own websites (built on Webflow, Framer, WordPress, React, or Squarespace) or simply want a lightweight Google Forms alternative with zero self-hosting hassle:
- Full attendee/ticket lifecycle management adds unnecessary overhead, server resource costs, and maintenance complexity.
- Heavy theme tables and canvas animations inflate bundle sizes and server CPU/memory requirements.

By pivoting `EventsPlug` into an **ultra-lightweight embeddable form & widget system**:
- Organizers get a 1-line script or React component to drop forms anywhere.
- Standalone page URLs remain available for direct sharing without web hosting.
- Form responses are stored cleanly in the database with instant CSV export.
- Server resource requirements drop to minimal levels, allowing the app to run smoothly on low-spec servers.

---

## What Changes

### 1. Database Schema & Server Pruning
- **Remove Theme & Skin Tables:** Drop `WidgetTheme`, `WidgetSkin`, and `OrganizationThemeUnlock`.
- **Remove Attendee Ticket Lifecycle:** Remove `RegistrationStatus` (`CHECKED_IN`, `WAITLISTED`, `CANCELLED`), QR check-in tokens, scanner APIs, and attendee account portals.
- **Simplify Models:** Focus schema strictly on `Organization`, `Event`, `FormField`, and `Registration` (Form Response).

### 2. Widget Engine Simplification (`apps/widget`)
- **Remove Heavy Canvas Shaders:** Strip WebGL/Canvas dynamic backdrop engines (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`).
- **Single Polished Built-in Design System:** Default to a clean, state-of-the-art dark/light adaptable widget UI with customizable accent color and logo/banner.
- **Multi-Embed Modes:** Support Inline embed (`<events-plug event="slug">`), Modal popup button, and Slide-over drawer.
- **Tiny Bundle Size:** Reduce JS bundle size from ~120KB to ~15KB gzipped.

### 3. Dashboard Simplification (`apps/dashboard`)
- **Prune Unneeded Panels:** Remove skin/theme purchasing, QR ticket scanner, attendee passports, and waitlist management panels.
- **Focus Dashboard Capabilities:**
  - Visual Form Builder (add/reorder text, email, select, checkbox, number fields).
  - 1-Click Embed Snippet Generator (`<script>` tag & React snippet).
  - Submission Data Table with 1-Click **Export CSV**.
  - Standalone Form Link Generator (`/w/[eventSlug]`).

---

## Capabilities

### Modified Capabilities
- `events`: Simplified event setup focused on form fields, basic accent color, banner, and standalone page link.
- `registrations`: Simplified form submission endpoint (`POST /api/v1/events/:id/submit`), response database persistence, and CSV export.
- `widget`: Lightweight Web Component supporting Inline, Modal, and Drawer embed modes without dynamic theme/canvas dependencies.

### Deprecated / Removed Capabilities
- `themes`: Theme unlocks, skin purchasing, dynamic canvas backdrops.
- `attendee-lifecycle`: QR check-ins, waitlist promotions, attendee ticket views, and scanner drawer.

---

## Impact

- **Database:** Prune Prisma schema from 9 tables to 4 core models. Run migration to clean up unused tables.
- **Backend API:** Remove unused check-in/ticket scanner controllers and theme unlock services. Focus API on lightweight event CRUD & form response submission/export.
- **Dashboard:** Clean up sidebars and tabs. Replace complex theme customizer with Embed Code Generator and CSV Exporter.
- **Widget:** Remove WebGL/Canvas shader code and dynamic skin dependencies.
