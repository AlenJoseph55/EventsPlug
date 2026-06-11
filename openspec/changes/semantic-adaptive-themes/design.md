## Context

The current EventsPlug theme customization architecture stores hardcoded CSS variables directly in the database (`WidgetTheme.cssVariables`). As a result, the rendering layer cannot adapt colors dynamically based on light/dark mode triggers, leading to unreadable text combinations (e.g., white-on-white text in light mode or incorrect color flashing). 

We will introduce a semantic, intent-based theme schema and separate the color customizer from structural card styles (skins).

## Goals / Non-Goals

**Goals:**
* Update `WidgetTheme` presets to store color intent parameters (`baseMode`, `accentHue`, `surfaceTone`) instead of raw, static CSS variables.
* Create a `WidgetSkin` database model defining structural attributes (border-radius, border-style, box shadows, fonts, and backdrop animations).
* Relate `WidgetSkin` to `Organization` (default hub-level skin) and `Event` (per-event skin override).
* Implement client-side HSL/OKLCH color calculation to derive WCAG AA-compliant theme colors at runtime based on palette intent and the user's active theme.
* Simplify the Admin Customization Tab to use a single brand color picker and skin selection dock.

**Non-Goals:**
* Exposing advanced color pickers for individual text, button, and border elements.
* Allowing organizers to pick custom background or text colors on a per-event basis (all event colors are inherited from the parent organization).

## Decisions

### 1. Intent-Based Palette Contract
Instead of raw CSS variable JSON, `WidgetTheme` will store:
* `baseMode`: `"dark" | "light" | "adaptive"`
* `accentHue`: number (0-360)
* `surfaceTone`: `"deep" | "tinted" | "neutral"`

*Rationale:* This allows the frontend to mathematically generate readable, high-contrast colors dynamically at runtime. If an attendee toggles from dark to light mode, the engine uses the same `accentHue` and `surfaceTone` but flips the background and card luminosity automatically, avoiding hardcoded text/bg mismatch bugs.

### 2. Separating Colors (Themes) from Structure (Skins)
We will introduce `WidgetSkin` as a separate database entity.
* `borderRadius`: e.g., `"16px"`, `"0px"`, `"24px"`
* `shadowStyle`: e.g., `"frosted"`, `"brutalist"`, `"soft"`, `"none"`
* `borderStyle`: e.g., `"solid"`, `"none"`, `"double"`
* `borderWidth`: e.g., `"1px"`, `"2px"`
* `fontFamily`: e.g., `"var(--font-sans)"`, `"var(--font-display)"`
* `backdropStyle`: e.g., `"DOT_MATRIX"`, `"GRID_WARP"`, `"AURORA_GLOW"`

*Rationale:* Organizers want unique stylings for events (e.g., a gaming tournament should look Brutalist or Cyberpunk, while a lecture looks Minimalist), but want to maintain a uniform brand color palette (e.g., university green). Decoupling these concepts makes this behavior native.

### 3. Client-Side HSL Color Generation
The Next.js client will derive full CSS variable blocks from semantic intent values at runtime.
* *Light Background:* `hsl(accentHue, 4%, 98%)`, *Light Card:* `rgba(255,255,255,0.75)`, *Light Text:* `hsl(accentHue, 15%, 8%)`.
* *Dark Background:* `hsl(accentHue, 12%, 6%)`, *Dark Card:* `rgba(255, 255, 255, 0.045)`, *Dark Text:* `hsl(accentHue, 5%, 98%)`.
* *Accent Contrast check:* If the primary accent is below `4.5:1` contrast against background, scale the lightness until it passes WCAG AA targets before assigning it to buttons and text links.

*Rationale:* Simplifies the backend database constraints, keeps SQL queries fast, and handles dark/light mode toggles without roundtripping to the database or loading extra resources.

## Risks / Trade-offs

* **[Risk]** Existing presets in the database store raw variable arrays which will break the new rendering algorithms.
  * *Mitigation:* We will execute a db seed/migration script to clean up outdated presets and insert the updated intent JSON structure.
