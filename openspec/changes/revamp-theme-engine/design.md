## Context

The current theme engine in EventsPlug relies on a JSON blob (`cssVariables`) containing static, hardcoded hex values stored in the `WidgetTheme` table. This approach causes styling clashes, contrast bugs (such as dark-to-light flash on public directory pages, or white-on-white text readability issues), and is prone to synchronization errors. We will revamp the theme engine to define themes via six orthogonal parameters of intent and dynamically derive contrast-safe OKLCH color palettes and layouts at render-time.

## Goals / Non-Goals

**Goals:**
- Replace the `WidgetTheme.cssVariables` JSON field with six database columns: `baseMode`, `accentHue`, `accentChroma`, `surfaceTone`, `skinId`, and `fontPairingId`.
- Drop raw hex columns `hubAccentColor` and `hubBgColor` from the `Organization` model, delegating color customization entirely to custom theme records referenced by `hubThemeId`.
- Establish a runtime derivation layer in `color-utils.ts` utilizing browser-native OKLCH colors.
- Enforce WCAG AA contrast compliance (4.5:1 ratio) on the primary brand accent color automatically by adjusting the Lightness parameter `L` in OKLCH during derivation.
- Add Next.js Google Font optimization variables for `Inter`, `Outfit`, and `Fira_Code` in `layout.tsx` to support typography pairings.
- Provide a premium grid of visual thumbnails to select skins and base mode options in the customizer UI.

**Non-Goals:**
- Adding more than 4 initial skins (`frosted`, `sharp`, `soft`, `retro`) or custom font uploads.
- Customizing accent colors at the event-level (accent color is always anchored to the Parent Organization hub).

## Decisions

### 1. OKLCH Color Space & Contrast Adjustment Math
We will use browser-native `oklch()` color structures for CSS custom properties.
- **Conversion Math:** Since Node.js / SSR environments do not support Canvas elements, we implement a lightweight matrix multiplication logic in `color-utils.ts` to convert OKLCH to linear sRGB, apply gamma correction, and output standard Hex values.
- **Lightness Adjustment:** To guarantee 4.5:1 WCAG contrast, the derived accent color is converted to hex and compared against the background hex. If it fails, the lightness `L` parameter of the OKLCH tuple is adjusted incrementally (upwards if background is dark, downwards if background is light) while keeping hue and chroma fixed.

### 2. Isolated Organization Custom Themes
To support custom brand accents and font selections without overwriting global theme presets, organizations will be provisioned a unique custom theme with slug `org-custom-${orgId}` when they first customize their branding settings.
- If `Organization.hubThemeId` points to a system preset and the organizer adjusts the customization slider, the backend automatically clones/creates the custom theme, links `hubThemeId` to it, and updates its parameters.

### 3. Google Fonts Variable Integration
Fonts are loaded in `apps/dashboard/src/app/layout.tsx` via `next/font/google` and exposed as CSS custom properties:
- `Inter` -> `--font-inter`
- `Outfit` -> `--font-outfit`
- `Fira_Code` -> `--font-fira-code`
- `Space_Grotesk` -> `--font-space-grotesk`
Font pairings map these variables to `--ep-font-display` and `--ep-font-body` custom properties during color derivation.
- *Performance Consideration:* Unconditional loading of all four fonts in `layout.tsx` is selected for v1 simplicity. In a production pipeline, public hub pages should only load the specific typefaces needed by their active pairing to optimize loading speed.

## Risks / Trade-offs

- **[Risk]** Existing database presets and custom organization settings store outdated `cssVariables` blocks which will break the new rendering layer.
  - *Mitigation:* We will execute a db migration that drops the column and a db seed script that updates all preset records to populate the new columns.
- **[Risk]** Migration Window Fallback Mismatch: During schema migration, active events or organizations may have themes where new semantic fields are null while old `cssVariables` still exist.
  - *Mitigation:* The rendering layer (`PublicHubClient.tsx`, `EventPageClient.tsx`, and the widget) will implement defensive validation: if the semantic properties (e.g. `accentHue`) are missing/null and a legacy `cssVariables` fallback exists, we fallback to system defaults rather than throwing rendering errors or crashing the page.
- **[Risk]** OKLCH is not fully supported in older web browsers.
  - *Mitigation:* This is acceptable as the platform targets modern browser environments. We will utilize standard fallback values in globals.css.

