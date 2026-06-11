## Context

The theme system in EventsPlug uses HSL dynamic color derivation and structural skins. Currently, the customization UI exposes raw pickers directly, and the public page renderers support a limited set of backdrop styles (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`). To improve the visual quality of event pages and simplify the customization flow, we will integrate 7 lightweight React Bits backgrounds and organize them under a preset-first Customizer UI.

## Goals / Non-Goals

**Goals:**
* Build 7 lightweight, high-performance background components under a unified directory (`apps/dashboard/src/components/ui/backgrounds/`).
* Dynamically load background components on client pages depending on active theme settings, maintaining a fast page load speed.
* Group accent colors, skins, and backgrounds into 4 simplified, 1-click styling presets (Vibeboxes) in the Customizer dashboard.
* Hide granular configurations (hex pickers, custom skins) inside an advanced customization accordion.

**Non-Goals:**
* Avoid installing heavy packages like `three.js`, `@react-three/fiber`, or `tsparticles`. All animations must be written in pure CSS/SVG or lightweight 2D canvas.
* Do not perform database schema migrations (we will leverage the existing Prisma fields for `WidgetSkin.backdropStyle` and `WidgetTheme` variables).

## Decisions

### 1. Code-Porting Model (Copy-Paste Component Integration)
We will fetch and manually integrate the React Bits component code inside our codebase rather than installing third-party libraries.
* **Why:** This ensures complete control over layout, styling, and dependencies. It avoids third-party bundler bloat and compiles instantly.
* **Location:** `apps/dashboard/src/components/ui/backgrounds/`

### 2. Client-Side Code Splitting (next/dynamic)
All background components will be loaded dynamically using Next.js imports with `ssr: false`.
* **Why:** WebGL or 2D canvas renderers require access to `window` and `document` APIs. Rendering them on the server causes hydration mismatches. Dynamic imports keep the initial bundle lightweight.

### 3. Dynamic Color Variable Binding
Rather than passing static hex colors, the background components will accept CSS variables or read from computed styles (e.g., `var(--hub-accent-color)`).
* **Why:** This ensures backgrounds react dynamically when users switch between light and dark modes or change the brand accent color.

### 4. Preset-First Customizer Panel
The organizer customization dashboard will lead with 4 curated styling presets:
1. **Glassmorphism (🔮):** Frosted Glass skin + Indigo accent + Aurora background.
2. **Cyber Grid (⚡):** Retro Cyber skin + Pink accent + Shape Grid background.
3. **Cozy Soft (🌿):** Minimalist Soft skin + Emerald accent + Gradient background.
4. **Retro Arcade (🕹️):** Retro Cyber skin + Yellow accent + Pixel Snow background.
Granular controls will toggle inside a collapsible advanced panel.

## Risks / Trade-offs

* **[Risk] CPU Usage on Mobile:** Multiple canvas animations or heavy CSS transitions can cause high CPU utilization on mobile devices.
  * *Mitigation:* Keep particle count low (e.g., maximum 50 points for `lightfall` and `pixelsnow`), pause animation rendering loops when the tab is out of focus, and rely on GPU-accelerated CSS properties where possible.
* **[Risk] Color Contrast:** Animated backgrounds might degrade text contrast.
  * *Mitigation:* Ensure text has a solid, semi-transparent backdrop card (using `.hub-card`) with a glass blur, separating text elements from the moving backgrounds.
