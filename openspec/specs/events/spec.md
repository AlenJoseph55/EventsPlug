## Purpose
Defines the specifications for creating and managing events, along with customizing their registration forms using a dynamic field builder.

## Requirements

### Requirement: Event Management
Organizers SHALL be able to create, view, update, and delete event listings for their organization.

#### Scenario: Create a New Event
- **WHEN** an organizer creates a new event with a title, slug, date, location, description, and optional registration capacity limit
- **THEN** the event is successfully saved in the database with an active status by default

#### Scenario: Update Event Details
- **WHEN** an organizer updates properties of an existing event
- **THEN** the changes are saved and reflected immediately in public and admin lists

#### Scenario: Delete an Event
- **WHEN** an organizer deletes an event
- **THEN** the event and all associated registrations and custom form fields are removed from the database

### Requirement: Custom Form Builder
Organizers SHALL be able to add, edit, and delete custom registration fields for an event, capped at a maximum of 20 fields per event.

#### Scenario: Add a Custom Field Under Limit
- **WHEN** an organizer adds a custom field (types: TEXT, EMAIL, TEXTAREA, SELECT, CHECKBOX, NUMBER) and the current field count is less than 20
- **THEN** the field is successfully appended to the event's form definition

#### Scenario: Add a Custom Field Exceeding Limit
- **WHEN** an organizer tries to add a custom field but the event already has 20 fields
- **THEN** a bad request exception is thrown stating "Form builder limit reached: events cannot exceed 20 fields."

#### Scenario: Edit an Individual Custom Field
- **WHEN** an organizer modifies the label, placeholder, required status, or options of an existing custom field
- **THEN** the changes are applied and stored in the database

#### Scenario: Delete a Custom Field
- **WHEN** an organizer deletes a custom field
- **THEN** the field is deleted and registrations are unaffected except that its answers will no longer have field definitions

### Requirement: Form Presets
Organizers SHALL be able to apply preset field templates (Individual, Team, Gaming Tournament, Workshop, Hackathon) in APPEND or REPLACE mode.

#### Scenario: Apply Preset in REPLACE Mode
- **WHEN** an organizer applies a preset in REPLACE mode
- **THEN** all existing custom fields for the event are transactionally deleted and the preset fields are created in their place

#### Scenario: Apply Preset in APPEND Mode
- **WHEN** an organizer applies a preset in APPEND mode and the combined count is 20 or less
- **THEN** the preset fields are created and appended after the existing fields

#### Scenario: Apply Preset in APPEND Mode Exceeding Limit
- **WHEN** an organizer applies a preset in APPEND mode and the combined count would exceed 20
- **THEN** a bad request exception is thrown and no changes are saved

### Requirement: Form Field Reordering
Organizers SHALL be able to reorder the fields in a form dynamically.

#### Scenario: Transactional Bulk Reordering
- **WHEN** an organizer submits a list of custom fields with new order indices
- **THEN** the system updates the order of all specified fields in a single database transaction
