## Why

While the first iteration of the simplified branding customization successfully replaced raw CSS overrides with a color picker and cover banner, organizers need a more dynamic, visually stunning directory hub that stays professional and readable. Enabling structural animations (Warp Grid, Aurora Ambient, Dot Matrix) tinted with the brand color—backed by automatic WCAG-compliant contrast checking—will make EventsPlug directories look state-of-the-art while preventing bad color combinations.

## What Changes

* **Visual Presets**: Introduce a background style picker with visual presets (`DOT_MATRIX`, `GRID_WARP`, `AURORA_GLOW`).
* **Contrast Guardrails**: Add automatic client-side WCAG AA contrast ratio checks (minimum 4.5:1 ratio) to adjust accent color brightness dynamically for text and primary controls.
* **Layout Tinting**: Allow the selected background style to be tinted (5-10% opacity) by the organization's accent color automatically.
* **Attendee Theme Toggle**: Introduce a floating theme switcher on the public directory page that toggles between Dark and Light mode. The choice will be persisted in `localStorage` and respect the visitor's system preference by default.

## Capabilities

### Modified Capabilities
- `themes`: Allow organizers to select a structural background theme style, and implement dynamic background tinting and automatic WCAG contrast compliance for accent-colored text and buttons. Implement a public-facing dark/light mode switcher.

## Impact

* **Database**: `Organization` model schema is extended with a `hubThemeStyle` field.
* **Dashboard Portal**: Replace static customization fields with an interactive visual style dock, live preset previews, and a dynamic mockup simulator.
* **Public Hub**: Refactor layout styling, apply keyframe animations for selected presets, execute client-side contrast adjustments, and render an attendee-facing dark/light toggle with adaptive styles.
