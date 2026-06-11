## Why

The current theme engine in EventsPlug relies on raw, hardcoded hex values stored directly in preset CSS variables and organization preferences. This model causes visual bugs—such as dark-to-light flash on public directories, white-on-white text readability failures, and clashing styling parameters. Moving to a semantic adaptive model guarantees WCAG AA contrast compliance and separates color palettes from visual card treatments (skins).

## What Changes

* **Semantic Theme Intent**: Redefine the `WidgetTheme` JSON contract to store semantic color intent (`baseMode`, `accentHue`, `surfaceTone`) instead of hardcoded hex variables (`--bg-color`, `--text-color`).
* **Visual Skins (WidgetSkin)**: Introduce `WidgetSkin` as a separate database entity to manage structural aesthetics (border radius, box shadows, fonts, and backdrop animations) independently of colors.
* **Unified Accent Picker**: Deprecate raw background and text color inputs in the organizer customization panel in favor of a single brand accent color picker.
* **Runtime Palette Derivation**: Update the frontend rendering layer to dynamically calculate WCAG AA-compliant HSL colors from semantic intent and the user's active light/dark toggle.
* **Event-Level Skin Overrides**: Allow events to override visual skins (`skinId`) to change page style (e.g., Brutalist, Minimalist) while inheriting the organization's brand palette.

## Capabilities

### New Capabilities
- `skins`: Introduce structural page customization templates (visual skins) separate from colors.

### Modified Capabilities
- `themes`: Restructure global theme presets to store semantic intent rather than raw hex codes, and calculate WCAG AA-compliant adaptive color palettes at runtime.

## Impact

* **Database**:
  * Add the `WidgetSkin` model.
  * Add `skinId` relation to `Event` and `defaultSkinId`/`hubSkinId` to `Organization`.
* **API & Controllers**:
  * NestJS controller endpoint updates for organization customization and event updates to validate and process semantic theme details and skin preferences.
* **Dashboard Customizer**:
  * Simplify the branding configuration UI to focus on Accent Color + Vibe selection with dynamic preview updating.
* **Public Rendering**:
  * Refactor public hub and event details pages to construct CSS color variables dynamically at runtime based on palette intent and attendee theme toggling.
