## Why

The current standalone Hub customization relies on a raw CSS editor (`hubCss`). This presents significant user experience issues, as most event organizers are not developers. It is prone to syntax errors, can easily break mobile layouts, and introduces styling vulnerabilities. Replacing it with a high-fidelity visual customization system (similar to Luma) simplifies the organizer flow, guarantees aesthetic quality, and improves security.

## What Changes

* **Remove Custom CSS Overrides**: Completely phase out the raw `hubCss` custom CSS textarea control from both the organizer portal frontend and database schema.
* **Introduce Brand Accent Color Picker**: Add a visual color picker control to let organizers specify their brand accent color.
* **Introduce Header Banner Cover**: Allow organizers to upload or select a banner cover image for the standalone hub top section.
* **Simplified Page Aesthetics**: Provide predefined style options (e.g. Minimal Light, Midnight Dark, Gradient) to dictate page-wide themes dynamically.

## Capabilities

### New Capabilities

*(None)*

### Modified Capabilities

* `themes`: Modifies standalone hub customization rules to deprecate the raw `hubCss` override field in favor of structured accent colors, cover layouts, and predefined theme configurations.

## Impact

* **Backend DB Schema**: Deprecate `hubCss` in the `Organization` model and add `hubAccentColor` and `hubBannerUrl`.
* **Backend DTOs / Controllers**: Update customization fetch/update endpoints and input validation schemas to accept these new parameters instead of raw CSS strings.
* **Organizer Portal UI**: Replace the custom CSS editor editor panel under the *Standalone Hub* tab with color pickers, banner image uploads, and visual preset selections.
* **Public Hub page**: Render chosen layout parameters dynamically via CSS custom properties on the root page element, ensuring responsive layout scales remain clean.
