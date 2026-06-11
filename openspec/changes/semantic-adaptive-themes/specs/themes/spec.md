## MODIFIED Requirements

### Requirement: Organization Theme & Layout Settings
Organizers SHALL be able to select a default semantic theme (containing baseMode, accentHue, and surfaceTone), default widget layout (GRID, LIST, CAROUSEL), and card display limit for their organization's widgets.

#### Scenario: Update Default Theme
- **WHEN** an organizer updates the organization's default theme ID
- **THEN** the new default theme is saved and applied to all events that do not have custom theme overrides

#### Scenario: Update Default Layout & Limit
- **WHEN** an organizer updates the default layout to "LIST" and sets the limit to a positive integer (e.g. 5)
- **THEN** the preferences are saved in the database

#### Scenario: Reject Invalid Layout or Limit
- **WHEN** an organizer submits an invalid layout type or a limit that is negative or zero
- **THEN** a bad request exception is thrown and the organization configuration is not updated

### Requirement: Event Theme overrides
Organizers SHALL be able to override the default organization semantic theme for individual events to apply custom palette intents.

#### Scenario: Set Event Theme Override
- **WHEN** an organizer overrides the theme ID for a specific event
- **THEN** the event override is saved and takes precedence over the organization's default theme for that event

### Requirement: Standalone Hub Banner and Accent Color
Organizers SHALL be able to customize their standalone hub accent color (using hex code validation) and upload a custom banner image for visual branding. The accent color SHALL be used as the primary seed to dynamically derive all page colors ensuring WCAG AA contrast.

#### Scenario: Save Accent Color and Banner
- **WHEN** an organizer updates the hub accent color and uploads a header banner cover
- **THEN** the organization's hub registry branding preferences are successfully saved

#### Scenario: Reject Invalid Hex Color Code
- **WHEN** an organizer attempts to save an accent color with an invalid hex format (e.g. "invalid-color")
- **THEN** a bad request exception is thrown stating that the accent color must be a valid hex color code
