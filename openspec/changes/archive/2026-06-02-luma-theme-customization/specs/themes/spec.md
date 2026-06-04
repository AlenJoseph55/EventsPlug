## ADDED Requirements

### Requirement: Standalone Hub Banner and Accent Color
Organizers SHALL be able to customize their standalone hub accent color (using hex code validation) and upload a custom banner image for visual branding.

#### Scenario: Save Accent Color and Banner
- **WHEN** an organizer updates the hub accent color and uploads a header banner cover
- **THEN** the organization's hub registry branding preferences are successfully saved

#### Scenario: Reject Invalid Hex Color Code
- **WHEN** an organizer attempts to save an accent color with an invalid hex format (e.g. "invalid-color")
- **THEN** a bad request exception is thrown stating that the accent color must be a valid hex color code

## MODIFIED Requirements

### Requirement: Standalone Hub Customization
Organizers SHALL be able to customize their standalone hub directory page details, including text, card display flags, and visual layout styles without raw custom CSS overrides.

#### Scenario: Save Standalone Customizations
- **WHEN** an organizer updates the hub title, description, logo, icon, autoFitImages setting, and card display flags
- **THEN** the organization's hub registry preferences are updated successfully

## REMOVED Scenarios

### Scenario: Reject Exceeded CSS Character Cap
**Requirement**: Standalone Hub Customization
**Reason**: Replaced by structured, safe visual customization options (accent colors and predefined themes) to prevent layout breakages and improve security.
