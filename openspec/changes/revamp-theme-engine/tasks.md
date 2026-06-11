## 1. Database Schema & Seeds

- [ ] 1.1 Modify `apps/backend/prisma/schema.prisma` to replace `cssVariables` in `WidgetTheme` with `baseMode`, `accentHue`, `accentChroma`, `surfaceTone`, `skinId`, and `fontPairingId`. Remove `hubBgColor` and `hubAccentColor` from `Organization`.
- [ ] 1.2 Update `apps/backend/prisma/seed.ts` to convert themes and update skins data slugs to `frosted`, `sharp`, `soft`, `retro`.
- [ ] 1.3 Apply schema migrations and reseed database using `npx prisma db push` and `pnpm --filter backend prisma db seed`.

## 2. Derivation Layer & Backend Controllers

- [ ] 2.1 Re-implement color derivation utility in `apps/dashboard/src/lib/color-utils.ts` to output contrast-safe OKLCH color properties. Add mathematical helper function `oklchToRgb`.
- [ ] 2.2 Update backend API controller `apps/backend/src/themes/preferences.controller.ts` to manage custom organization theme records, remove hex color validations, and return updated theme schema properties.

## 3. Frontend & Widget Rendering Integration

- [ ] 3.1 Update `apps/dashboard/src/app/layout.tsx` to load Google Fonts (`Inter`, `Outfit`, `Fira_Code`) via `next/font/google` and assign their CSS variables.
- [ ] 3.2 Update `EventPageClient.tsx` and `PublicHubClient.tsx` to map CSS custom properties to derived variables.
- [ ] 3.3 Update web component rendering in `apps/widget/src/main.ts` to harvest host variables and parse the theme intent columns directly to build CSS variables.

## 4. Customizer & Form Builder UI Updates

- [ ] 4.1 Update `useThemes.ts` and `useHubCustomization.ts` to reflect the updated backend schema fields.
- [ ] 4.2 Replace hex color inputs in `CustomizationTab.tsx` with Hue/Chroma sliders, font pairing selectors, and skin visual thumbnails.
- [ ] 4.3 Replace the dropdown skin selector in `EditEventModal.tsx` with a grid of brand-accented visual thumbnails.
- [ ] 4.4 Refactor `ThemesTab.tsx` and `SystemAdminTab.tsx` to display theme intent values and use color derivation helper.
