## ADDED Requirements

### Requirement: Visual Skins Configuration
The system SHALL support visual skins that define structural visual settings (typography, borders, shadow treatments, margins, and canvas backdrop styles) independently of the color palette.

#### Scenario: Update Default Hub Skin
- **WHEN** an organizer updates the hub default skin ID
- **THEN** the new skin is saved and applied to all events that do not have custom skin overrides

### Requirement: Event-Level Skin Override
Organizers SHALL be able to override the default organization skin for individual events to allow customized layout treatments while inheriting the organization's color brand.

#### Scenario: Set Event Skin Override
- **WHEN** an organizer overrides the skin ID for a specific event
- **THEN** the event override is saved and takes precedence over the organization default skin for that event
