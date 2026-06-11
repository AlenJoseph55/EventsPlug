## 1. Background Components Implementation

- [x] 1.1 Create component files for each React Bits background under `apps/dashboard/src/components/ui/backgrounds/`.
- [x] 1.2 Port and implement the `lightfall` (light drops), `siderays` (skewed rays), `lightrays` (sunbeams), `aurora` (neon blobs), `gradient` (moving color mesh), `pixelsnow` (pixel drift), and `shapegrid` (matrix grid) components.
- [x] 1.3 Update the backgrounds to dynamically read color properties from brand accent HSL CSS variables (`var(--hub-accent-color)`).

## 2. Dashboard Customizer Redesign

- [x] 2.1 Update `CustomizationTab.tsx` to implement 4 curated design vibe presets (Glassmorphism, Cyber Grid, Cozy Soft, Retro Arcade) as primary tiles.
- [x] 2.2 Add a collapsible Advanced Customization panel (accordion/disclosure) in `CustomizationTab.tsx`.
- [x] 2.3 Tidy up the advanced panel layout, moving hex sliders, custom border pickers, and specific background selectors inside the collapsible drawer.
- [x] 2.4 Bind presets action to automatically set the matching accent color, visual skin, and backdrop style in the dashboard state.

## 3. Public Template Rendering Integration

- [x] 3.1 Update `PublicHubClient.tsx` to dynamically load the 7 new background components using `next/dynamic` with `ssr: false`.
- [x] 3.2 Update `EventPageClient.tsx` to dynamically load the 7 new background components with `ssr: false`.
- [x] 3.3 Replace the static backdrop switch logic in both client files with dynamic components corresponding to the active `backdropStyle` config.

## 4. Verification

- [x] 4.1 Build the monorepo packages to confirm zero TypeScript compilation errors.
- [x] 4.2 Validate theme switching behavior and ensure no Next.js console hydration mismatch errors occur during page loading.
