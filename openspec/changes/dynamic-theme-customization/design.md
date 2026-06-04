## Context

Organizers need their standalone directory landing pages to feel alive and dynamic. While raw CSS overrides are unsafe, we are implementing a controlled dynamic customization engine that supports visual preset background styles (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`) and custom canvas background colors (`hubBgColor`), with an automatic contrast guardrail utility to guarantee WCAG AA readability.

## Goals / Non-Goals

**Goals:**
* Add `hubThemeStyle` and `hubBgColor` fields to the `Organization` database model.
* Implement custom background color selection in the organizer portal panel.
* Implement custom background layers (grid dot matrix, moving spotlights, slow pulsing auroras) for the public hub page and organizer preview.
* Create a client-side color helper utility to calculate contrast ratios and automatically adjust low-contrast color choices.
* Implement a floating light/dark theme switch toggle on the public directory page.
* Make backdrops (grids, auroras) and layout styles (cards, text, borders) fully adaptive to the light/dark setting.

**Non-Goals:**
* Creating dynamic particle canvases or complex visual page editors.

## Decisions

### 1. Contrast Adjustment (WCAG AA)
We will implement relative luminance math to measure the contrast ratio of the custom accent color against the canvas background color (which defaults to `#090d16` in Dark Mode, but can be customized via `hubBgColor`).
* **Threshold**: Must meet a minimum contrast ratio of 4.5:1.
* **Fallback Action**: If contrast falls below 4.5, automatically shift the accent color's light-ness/luminance (lightening for dark backgrounds, darkening for light backgrounds) until the contrast ratio is satisfied.

### 2. Backdrop Effects via CSS/Tailwind
Rather than installing heavy particle libraries (e.g., tsParticles), we will construct the backdrops using lightweight SVG/CSS patterns and CSS keyframes:
* **Warp Grid**: Dotted grid background with a slow-moving radial gradient overlay mimicking a pulsing ambient spotlight.
* **Aurora Ambient**: Soft radial gradients at 5-10% opacity, animated via translating and scaling transforms.

### 3. Attendee Theme Switcher (Option 2)
We will build a floating toggle on the public directory page that shifts the layout between Light and Dark mode:
* **Light Mode Overrides**:
  * Canvas background: `#f8fafc` (minimal light background).
  * Card background: `#ffffff` (pure white).
  * Text color: `text-slate-800` (instead of `text-slate-200`).
  * Borders/Separators: `rgba(0,0,0,0.06)` (instead of `rgba(255,255,255,0.08)`).
  * Backdrop Grids: `#000000` (black lines/dots at 5% opacity).
  * Contrast check base: Calculated against `#f8fafc` background (automatically darkening the accent color).
* **Dark Mode Defaults**:
  * Canvas background: `#090d16` (or organization theme's `--bg-color`).
  * Card background: `#111827` (or organization theme's `--card-bg`).
  * Text color: `text-slate-200`.
  * Borders/Separators: `rgba(255,255,255,0.08)`.
  * Backdrop Grids: `#ffffff` (white lines/dots at 4% opacity).
  * Contrast check base: Calculated against `#090d16` background (automatically lightening the accent color).
* **State Persistence**: The active setting is saved to `localStorage` (key: `eventsplug-hub-theme-preference`) and defaults to standard window media query match detection.

## Risks / Trade-offs

* **[Risk]** Organizers picking very dark colors (e.g., `#0a0b0d`) causing text to become white.
  * *Mitigation*: The contrast checker automatically detects this and lightens the hex code to a readable tone (e.g., `#a3e635` or `#818cf8`) dynamically. Same applies in light mode, where light accent colors will be automatically darkened.
