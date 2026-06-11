## Why

The current theme engine relies on basic backdrop styles (DOT_MATRIX, GRID_WARP, AURORA_GLOW) and a configuration interface that can feel cluttered with hex color pickers and dropdown selectors. Organizers need a simpler, one-click preset system to style their event pages, with support for modern, lightweight, and interactive background options based on React Bits components (copy-pasted to prevent bundle bloat).

## What Changes

- Redesign the dashboard Customization tab interface to be **Preset-First**, grouping skins, accents, and backdrops into unified style selections (Vibeboxes) with a collapsible "Advanced Customization" accordion.
- Import 7 optimized, lightweight React Bits background components: `lightfall`, `siderays`, `lightrays`, `aurora`, `gradient`, `pixelsnow`, and `shapegrid`.
- Update the public hub and event-details page renderers to dynamically load and display these 7 background presets.
- Connect background colors to the dynamic, contrast-adjusted HSL brand colors resolved at runtime.

## Capabilities

### New Capabilities
- `backgrounds`: Interactive, lightweight React Bits-style background components (imported manually to keep bundle sizes small) that render dynamic styles in public templates.

### Modified Capabilities
- `themes`: Expand themes spec to support the 7 distinct background styles, and introduce unified presets in the dashboard customization builder.

## Impact

- **Database:** Prisma schema remains unchanged since `WidgetSkin.backdropStyle` and `WidgetTheme` fields can capture the new style presets without schema migration.
- **Dashboard Customizer UI:** Major layout overhaul to the Customization Tab, simplifying the settings panel with card selectors and collapsible drawers.
- **Public Templates:** Next.js dynamic client rendering updates to mount background canvas/CSS elements with SSR disabled, preventing hydration mismatches.
