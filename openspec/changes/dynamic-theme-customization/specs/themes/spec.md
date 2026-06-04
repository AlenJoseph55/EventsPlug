## ADDED Requirements

### Requirement: Adaptive Contrast and Tinting
The system SHALL automatically calculate and enforce WCAG AA contrast ratio compliance (at least 4.5:1) for custom accent colors against the background, dynamically adjusting the color brightness for text and interactive control states.

#### Scenario: Adjust low-contrast accent color
- **WHEN** the client renders the hub with an accent color whose contrast ratio with the background is below 4.5:1
- **THEN** the system automatically shifts the color luminance to ensure AA accessibility standard compliance

#### Scenario: Adjust accent color against custom background color
- **WHEN** the organizer sets a custom background color (`hubBgColor`) and a low-contrast accent color
- **THEN** the system automatically adjusts the accent color relative to the custom background color to meet a 4.5:1 contrast ratio

#### Scenario: Accent tinting of background styles
- **WHEN** a background style is selected (e.g. Warp Grid or Aurora Ambient)
- **THEN** the background visual elements are tinted at 5-10% opacity using the accent color

### Requirement: Attendee Theme Switcher
The system SHALL provide a floating theme toggle control on the public directory page that switches the hub layout between Dark and Light mode, persisting the selection in `localStorage`.
All dynamic backdrops and contrast ratios SHALL adapt to remain readable and accessible.

#### Scenario: Toggle to Light Mode
- **WHEN** the attendee clicks the theme toggle to select Light Mode
- **THEN** the background shifts to `#f8fafc`, cards shift to `#ffffff` with dark text and borders, backdrops switch to dark grids, and the brand accent color auto-darkens to ensure a 4.5:1 contrast ratio.

#### Scenario: Toggle to Dark Mode
- **WHEN** the attendee clicks the theme toggle to select Dark Mode
- **THEN** the background shifts to the custom background color (`hubBgColor`) or default dark theme colors, cards shift to slate-900/gray, backdrops switch to light grids, and the brand accent color auto-lightens or adjusts to ensure a 4.5:1 contrast ratio.

## MODIFIED Requirements

### Requirement: Standalone Hub Customization
Organizers SHALL be able to customize their standalone hub directory page details, including text, card display flags, background theme style, accent color, and custom background color without raw custom CSS overrides.

#### Scenario: Save Standalone Customizations
- **WHEN** an organizer updates the hub title, description, logo, icon, autoFitImages setting, card display flags, background theme style selection, accent color, and custom background color
- **THEN** the organization's hub registry preferences are updated successfully
