## Context

The current EventsPlug standalone hub directory allows organizers to provide raw CSS rules (`hubCss`) to override the hub's styles. This is complex for users, hard to maintain, and insecure. We want to pivot to a simple, highly aesthetic branding control system similar to Luma, exposing structural properties (accent colors, banner images, page aesthetics).

## Goals / Non-Goals

**Goals:**
* Deprecate the raw custom CSS field (`hubCss`) and replace it with `hubAccentColor` and `hubBannerUrl` fields in the `Organization` model.
* Enforce Hex color validations on the backend and frontend for the accent color.
* Support custom banner image uploads for the organization hub, reusing the existing image upload logic.
* Apply accent colors dynamically in the frontend layout using React inline style bindings to CSS Custom Properties.

**Non-Goals:**
* Building complex page editors or visual layout dragging components.
* Modifying individual event page layouts (these already fall back to the organization default themes).

## Decisions

### 1. Accent Color Validation
* **Option A**: Use a predefined select list of allowed accent colors (e.g. Tailwind indigo, emerald, rose).
* **Option B**: Expose a visual HTML color picker (`<input type="color">`) allowing any valid Hex color code, validated via regex (`^#[0-9A-Fa-f]{6}$`) on the backend.
* **Chosen Approach**: **Option B**. This gives organizers the flexibility to align exactly with their institutional or team branding colors while maintaining structure.

### 2. Header Banner Storage
* We will reuse the existing backend file upload API (`POST /api/upload`) which validates image file sizes (<5MB) and mime-types, and returns a static uploads URL.
* The saved banner URL path will be stored in a new `hubBannerUrl` column on the `Organization` table.

### 3. Rendering Brand Styles in Frontend
* The public organization hub page (`apps/dashboard/src/app/o/[orgSlug]/page.tsx`) will read `hubAccentColor` and `hubBannerUrl` from the organization payload.
* An inline CSS custom properties block will override Tailwind theme colors dynamically:
  ```tsx
  const hubStyles = {
    '--primary-color': org.hubAccentColor || '#6366f1',
    '--hub-banner-url': org.hubBannerUrl ? `url(${org.hubBannerUrl})` : 'none',
  } as React.CSSProperties;
  ```

## Risks / Trade-offs

* **[Risk] Migration of Existing Custom CSS** → Some organizers may have custom CSS in `hubCss` that will be removed.
  * **Mitigation**: We will execute a Prisma schema migration. For safety, we will migrate any custom CSS out of `hubCss` and replace it with a clean default accent color.
* **[Risk] Poor Contrast Ratio** → Organizers might choose a very light accent color (e.g., `#ffffff`) which makes white text on primary buttons illegible.
  * **Mitigation**: Use clean neutral backgrounds and borders, and ensure contrast-safe text colors (e.g. contrast utility logic or black text on light buttons) are used when needed.
