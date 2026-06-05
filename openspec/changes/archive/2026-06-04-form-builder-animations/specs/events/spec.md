## MODIFIED Requirements

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

#### Scenario: Expand Field Properties Animation
- **WHEN** an organizer opens the inline edit panel for a custom field
- **THEN** the properties card expands and collapses with a smooth height transition

### Requirement: Form Field Reordering
Organizers SHALL be able to reorder the fields in a form dynamically.

#### Scenario: Transactional Bulk Reordering
- **WHEN** an organizer submits a list of custom fields with new order indices
- **THEN** the system updates the order of all specified fields in a single database transaction

#### Scenario: Drag and Drop Animation Feedback
- **WHEN** an organizer reorders a form field via drag-and-drop or keyboard shortcuts
- **THEN** the items in the list translate smoothly to their new coordinates
