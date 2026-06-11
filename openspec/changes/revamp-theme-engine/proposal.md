## Why

The current theme engine stores raw hex values as CSS variables directly in the database. This makes contrast issues structurally unavoidable when organizers change colors. To guarantee readability and brand consistency, we need a theme engine driven by intent (baseMode, accentHue, accentChroma, surfaceTone, skinId, fontPairingId) that derives full contrast-compliant color palettes (WCAG AA) using browser-native OKLCH colors at runtime.

## What Changes

- **WidgetTheme Schema Update**: Replace the `cssVariables` JSON blob with individual semantic intent fields (`baseMode`, `accentHue`, `accentChroma`, `surfaceTone`, `skinId`, `fontPairingId`).
- **Organization Schema Simplification**: Remove the `hubAccentColor` and `hubBgColor` hex fields. Replace with an organization-owned custom `WidgetTheme` record referenced by the existing `hubThemeId` FK.
- **Dynamic OKLCH Derivation**: Derive colors at render-time using OKLCH and automatically adjust the lightness of the brand accent color if it fails WCAG AA contrast (4.5:1) against the active card/background surface.
- **Skins and Font Pairings**: Upgrade the 4 default visual skins (`frosted`, `sharp`, `soft`, `retro`) and implement standard typography combinations (e.g. Inter, Space Grotesk, Outfit, Fira Code).
- **Customizer UI Updates**: Replace the hex color pickers in the dashboard customizations panel with Hue/Chroma sliders, a font pairing selector, and a visual thumbnail grid for skin and base mode selection.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `themes`: Update requirements around theme settings to save Hue/Chroma intent and Font Pairing instead of raw hex accent and background color values, and require automatic runtime WCAG AA contrast compliance.

## Impact

- **Database**: `WidgetTheme` and `Organization` schema columns modified.
- **Backend API**: NestJS `preferences.controller.ts` updated to drop hex code validations, accept and persist intent sliders/dropdowns, and manage organization custom theme records.
- **Dashboard Frontend**: React customizer tabs (`CustomizationTab.tsx`, `EditEventModal.tsx`, `ThemesTab.tsx`, `SystemAdminTab.tsx`) and hooks updated to manage Hue/Chroma/Font Pairing and render real-time preview canvas with OKLCH derivation.
- **Public Views & Embed Widget**: `PublicHubClient.tsx`, `EventPageClient.tsx`, and `apps/widget/src/main.ts` updated to fetch semantic properties and dynamically inject custom CSS variables derived at runtime.
