## Purpose
Defines the specifications for organization-wide default branding themes and layouts, event-specific overrides, and standalone organization hub directory customization options.
## Requirements
### Requirement: Organization Theme & Layout Settings
Organizers SHALL be able to select a default theme, default widget layout (GRID, LIST, CAROUSEL), and card display limit for their organization's widgets.

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
Organizers SHALL be able to override the default organization theme for individual events.

#### Scenario: Set Event Theme Override
- **WHEN** an organizer overrides the theme ID for a specific event
- **THEN** the event override is saved and takes precedence over the organization's default theme for that event

### Requirement: Standalone Hub Customization
Organizers SHALL be able to customize their standalone hub directory page details, including text, card display flags, and visual layout styles without raw custom CSS overrides.

#### Scenario: Save Standalone Customizations
- **WHEN** an organizer updates the hub title, description, logo, icon, autoFitImages setting, and card display flags
- **THEN** the organization's hub registry preferences are updated successfully

### Requirement: Standalone Hub Banner and Accent Color
Organizers SHALL be able to customize their standalone hub accent color (using hex code validation) and upload a custom banner image for visual branding.

#### Scenario: Save Accent Color and Banner
- **WHEN** an organizer updates the hub accent color and uploads a header banner cover
- **THEN** the organization's hub registry branding preferences are successfully saved

#### Scenario: Reject Invalid Hex Color Code
- **WHEN** an organizer attempts to save an accent color with an invalid hex format (e.g. "invalid-color")
- **THEN** a bad request exception is thrown stating that the accent color must be a valid hex color code

### Requirement: Admin Panel Theme Mode Toggle
The administrator portal SHALL support a Theme Mode toggle that shifts the interface layout colors between Light and Dark mode options.

#### Scenario: Toggle Admin Panel Theme Mode
- **WHEN** an administrator clicks the Theme Toggle button in the portal sidebar navigation
- **THEN** the interface layout theme switches between dark (default) and light modes, and the selection is saved in local storage

#### Scenario: Load Admin Panel Saved Theme
- **WHEN** the administrator portal is loaded
- **THEN** the system checks local storage and applies the saved theme preference, defaulting to dark mode if no preference exists

