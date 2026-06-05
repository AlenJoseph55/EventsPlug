## MODIFIED Requirements

### Requirement: Custom Form Builder
Organizers SHALL be able to add, edit, and delete custom registration fields for an event, capped at a maximum of 20 fields per event. The form builder workspace SHALL be presented as a tabbed, split-pane layout inside the event edit modal, featuring a real-time reactive attendee form preview and a quick-add toolbar palette.

#### Scenario: Add a Custom Field Under Limit
- **WHEN** an organizer adds a custom field (types: TEXT, EMAIL, TEXTAREA, SELECT, CHECKBOX, NUMBER) and the current field count is less than 20
- **THEN** the field is successfully appended to the event's form definition and the live preview immediately renders it

#### Scenario: Add a Custom Field Exceeding Limit
- **WHEN** an organizer tries to add a custom field but the event already has 20 fields
- **THEN** a bad request exception is thrown stating "Form builder limit reached: events cannot exceed 20 fields."

#### Scenario: Edit an Individual Custom Field
- **WHEN** an organizer modifies the label, placeholder, required status, or options of an existing custom field
- **THEN** the changes are applied, stored in the database, and reflected immediately in the live preview

#### Scenario: Delete a Custom Field
- **WHEN** an organizer deletes a custom field
- **THEN** the field is deleted, the live preview immediately updates, and registrations are unaffected except that its answers will no longer have field definitions
